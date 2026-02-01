import type { Project } from "../types";
//THIS IS AN EXAMPLE OF A TEXT PROJECT,CLONE THIS FILE AND MODIFY THE CONTENT TO CREATE A NEW TEXT PROJECT
const project: Project = {
  id: "year-of-LLMs",
  title: "What We Learned from a Year of Building with LLMs",
  type: "text",

  tags: ["AI"],
  description: `Eugene Yan, Bryan Bischof, Charles Frye, Hamel Husain, Jason Liu, and Shreya Shankar were invited by O'Reilly to contribute to a comprehensive article on working with LLMs. I was brought in as editor to refine sections of this extensive piece, which was produced ahead of an O'Reilly event where the authors were speaking.
   
   The article distills a year of hands-on experience building production LLM applications into tactical, operational, and strategic insights. The content later formed the foundation of their presentation, offering practical guidance on prompting, RAG, evaluation, and workflow optimization for practitioners building with large language models.
`,
  credits: [
    { role: "Editor", name: "Joseph Gleasure" },
    { role: "Authors", name: "Eugene Yan, Bryan Bischof, Charles Frye, Hamel Husain, Jason Liu, Shreya Shankar" },
    { role: "Client", name: "O'Reilly Media" },
    { role: "URL", name: "[O'Reilly.com](https://www.oreilly.com/radar/what-we-learned-from-a-year-of-building-with-llms-part-i/)" }
  ],

  body: `
It's an exciting time to build with large language models (LLMs). Over the past year, LLMs have become "good enough" for real-world applications. The pace of improvements in LLMs, coupled with a parade of demos on social media, will fuel an estimated $200B investment in AI by 2025. 

LLMs are also broadly accessible, allowing everyone, not just ML engineers and scientists, to build intelligence into their products. While the barrier to entry for building AI products has been lowered, creating those effective beyond a demo remains a deceptively difficult endeavor.

We've identified some crucial, yet often neglected, lessons and methodologies informed by machine learning that are essential for developing products based on LLMs. Awareness of these concepts can give you a competitive advantage against most others in the field without requiring ML expertise! 

Over the past year, the six of us have been building real-world applications on top of LLMs. We realized that there was a need to distill these lessons in one place for the benefit of the community.

We come from a variety of backgrounds and serve in different roles, but we've all experienced firsthand the challenges that come with using this new technology. Two of us are independent consultants who've helped numerous clients take LLM projects from initial concept to successful product, seeing the patterns determining success or failure. 

One of us is a researcher studying how ML/AI teams work and how to improve their workflows. Two of us are leaders on applied AI teams: one at a tech giant and one at a startup. Finally, one of us has taught deep learning to thousands and now works on making AI tooling and infrastructure easier to use. 

Despite our different experiences, we were struck by the consistent themes in the lessons we've learned, and we're surprised that these insights aren't more widely discussed.

Our goal is to make this a practical guide to building successful products around LLMs, drawing from our own experiences and pointing to examples from around the industry. We've spent the past year getting our hands dirty and gaining valuable lessons, often the hard way. 

While we don't claim to speak for the entire industry, here we share some advice and lessons for anyone building products with LLMs.

This work is organized into three sections: tactical, operational, and strategic. This is the first of three pieces. It dives into the tactical nuts and bolts of working with LLMs. We share best practices and common pitfalls around prompting, setting up retrieval-augmented generation, applying flow engineering, and evaluation and monitoring. 

Whether you're a practitioner building with LLMs or a hacker working on weekend projects, this section was written for you. Look out for the operational and strategic sections in the coming weeks.

Ready to ~~delve~~ dive in? Let's go.

## Tactical

In this section, we share best practices for the core components of the emerging LLM stack: prompting tips to improve quality and reliability, evaluation strategies to assess output, retrieval-augmented generation ideas to improve grounding, and more. We also explore how to design human-in-the-loop workflows. While the technology is still rapidly developing, we hope these lessons, the by-product of countless experiments we've collectively run, will stand the test of time and help you build and ship robust LLM applications.

### Prompting

We recommend starting with prompting when developing new applications. It's easy to both underestimate *and* overestimate its importance. It's underestimated because the right prompting techniques, when used correctly, can get us very far. It's overestimated because even prompt-based applications require significant engineering around the prompt to work well.

#### Focus on getting the most out of fundamental prompting techniques

A few prompting techniques have consistently helped improve performance across various models and tasks: n-shot prompts + in-context learning, chain-of-thought, and providing relevant resources.

The idea of in-context learning via n-shot prompts is to provide the LLM with a few examples that demonstrate the task and align outputs to our expectations. A few tips:

- If n is too low, the model may over-anchor on those specific examples, hurting its ability to generalize. As a rule of thumb, aim for n ≥ 5. Don't be afraid to go as high as a few dozen.
- Examples should be representative of the expected input distribution. If you're building a movie summarizer, include samples from different genres in roughly the proportion you expect to see in practice.
- You don't necessarily need to provide the full input-output pairs. In many cases, examples of desired outputs are sufficient.
- If you are using an LLM that supports tool use, your n-shot examples should also use the tools you want the agent to use.

In chain-of-thought (CoT) prompting, we encourage the LLM to explain its thought process before returning the final answer. Think of it as providing the LLM with a sketchpad so it doesn't have to do it all in memory. 

The original approach was to simply add the phrase "Let's think step-by-step" as part of the instructions. However, we've found it helpful to make the CoT more specific, where adding specificity via an extra sentence or two often reduces hallucination rates significantly. 

For example, when asking an LLM to summarize a meeting transcript, we can be explicit about the steps, such as:

- First, list the key decisions, follow-up items, and associated owners in a sketchpad.
- Then, check that the details in the sketchpad are factually consistent with the transcript.
- Finally, synthesize the key points into a concise summary.

Recently, [some doubt](https://arxiv.org/abs/2405.04776) has been cast on whether this technique is as powerful as believed. Additionally, there's significant debate about exactly what happens during inference when chain-of-thought is used. Regardless, this technique is one to experiment with when possible.

Providing relevant resources is a powerful mechanism to expand the model's knowledge base, reduce hallucinations, and increase the user's trust. Often accomplished via retrieval augmented generation (RAG), providing the model with snippets of text that it can directly utilize in its response is an essential technique. When providing the relevant resources, it's not enough to merely include them; don't forget to tell the model to prioritize their use, refer to them directly, and sometimes to mention when none of the resources are sufficient. These help "ground" agent responses to a corpus of resources.

#### Structure your inputs and outputs

Structured input and output help models better understand the input as well as return output that can reliably integrate with downstream systems. Adding serialization formatting to your inputs can help provide more clues to the model as to the relationships between tokens in the context, additional metadata to specific tokens (like types), or relate the request to similar examples in the model's training data.

As an example, many questions on the internet about writing SQL begin by specifying the SQL schema. Thus, you may expect that effective prompting for Text-to-SQL should include structured schema definitions; [indeed](https://www.researchgate.net/publication/371223615_SQL-PaLM_Improved_Large_Language_ModelAdaptation_for_Text-to-SQL).

Structured output serves a similar purpose, but it also simplifies integration into downstream components of your system. [Instructor](https://github.com/jxnl/instructor) and [Outlines](https://github.com/outlines-dev/outlines) work well for structured output. (If you're importing an LLM API SDK, use Instructor; if you're importing Huggingface for a self-hosted model, use Outlines.) Structured input expresses tasks clearly and resembles how the training data is formatted, increasing the probability of better output.

When using structured input, be aware that each LLM family has their own preferences. Claude prefers XML while GPT favors Markdown and JSON. With XML, you can even pre-fill Claude's responses by providing a response tag.

*[Code example demonstrating XML-based prompt structure with response pre-filling]*

#### Have small prompts that do one thing, and only one thing, well

A common anti-pattern/code smell in software is the "[God Object](https://en.wikipedia.org/wiki/God_object)," where we have a single class or function that does everything. The same applies to prompts too.

A prompt typically starts simple: A few sentences of instruction, a couple of examples, and we're good to go. But as we try to improve performance and handle more edge cases, complexity creeps in. More instructions. Multi-step reasoning. Dozens of examples. Before we know it, our initially simple prompt is now a 2,000 token frankenstein. And to add injury to insult, it has worse performance on the more common and straightforward inputs! GoDaddy shared this challenge as their [No. 1 lesson from building with LLMs](https://www.godaddy.com/resources/news/llm-from-the-trenches-10-lessons-learned-operationalizing-models-at-godaddy#h-1-sometimes-one-prompt-isn-t-enough).

Just like how we strive (read: struggle) to keep our systems and code simple, so should we for our prompts. Instead of having a single, catch-all prompt for the meeting transcript summarizer, we can break it into steps to:

- Extract key decisions, action items, and owners into structured format
- Check extracted details against the original transcription for consistency
- Generate a concise summary from the structured details

As a result, we've split our single prompt into multiple prompts that are each simple, focused, and easy to understand. And by breaking them up, we can now iterate and eval each prompt individually.

#### Craft your context tokens

Rethink, and challenge your assumptions about how much context you actually need to send to the agent. Be like Michaelangelo, do not build up your context sculpture—chisel away the superfluous material until the sculpture is revealed. RAG is a popular way to collate all of the potentially relevant blocks of marble, but what are you doing to extract what's necessary?

We've found that taking the final prompt sent to the model—with all of the context construction, and meta-prompting, and RAG results—putting it on a blank page and just reading it, really helps you rethink your context. We have found redundancy, self-contradictory language, and poor formatting using this method.

The other key optimization is the structure of your context. Your bag-of-docs representation isn't helpful for humans, don't assume it's any good for agents. Think carefully about how you structure your context to underscore the relationships between parts of it, and make extraction as simple as possible.

### Information Retrieval/RAG

Beyond prompting, another effective way to steer an LLM is by providing knowledge as part of the prompt. This grounds the LLM on the provided context which is then used for in-context learning. This is known as retrieval-augmented generation (RAG). Practitioners have found RAG effective at providing knowledge and improving output, while requiring far less effort and cost compared to finetuning.

#### RAG is only as good as the retrieved documents' relevance, density, and detail

The quality of your RAG's output is dependent on the quality of retrieved documents, which in turn can be considered along a few factors.

The first and most obvious metric is relevance. This is typically quantified via ranking metrics such as [Mean Reciprocal Rank (MRR)](https://en.wikipedia.org/wiki/Mean_reciprocal_rank) or [Normalized Discounted Cumulative Gain (NDCG)](https://en.wikipedia.org/wiki/Discounted_cumulative_gain). MRR evaluates how well a system places the first relevant result in a ranked list while NDCG considers the relevance of all the results and their positions. They measure how good the system is at ranking relevant documents higher and irrelevant documents lower. For example, if we're retrieving user summaries to generate movie review summaries, we'll want to rank reviews for the specific movie higher while excluding reviews for other movies.

Like traditional recommendation systems, the rank of retrieved items will have a significant impact on how the LLM performs on downstream tasks. To measure the impact, run a RAG-based task but with the retrieved items shuffled—how does the RAG output perform?

Second, we also want to consider information density. If two documents are equally relevant, we should prefer one that's more concise and has lesser extraneous details. Returning to our movie example, we might consider the movie transcript and all user reviews to be relevant in a broad sense. Nonetheless, the top-rated reviews and editorial reviews will likely be more dense in information.

Finally, consider the level of detail provided in the document. Imagine we're building a RAG system to generate SQL queries from natural language. We could simply provide table schemas with column names as context. But, what if we include column descriptions and some representative values? The additional detail could help the LLM better understand the semantics of the table and thus generate more correct SQL.

#### Don't forget keyword search; use it as a baseline and in hybrid search

Given how prevalent the embedding-based RAG demo is, it's easy to forget or overlook the decades of research and solutions in information retrieval.

Nonetheless, while embeddings are undoubtedly a powerful tool, they are not the be all and end all. First, while they excel at capturing high-level semantic similarity, they may struggle with more specific, keyword-based queries, like when users search for names (e.g., Ilya), acronyms (e.g., RAG), or IDs (e.g., claude-3-sonnet). Keyword-based search, such as BM25, are explicitly designed for this. And after years of keyword-based search, users have likely taken it for granted and may get frustrated if the document they expect to retrieve isn't being returned.

> **Aravind Srinivas, CEO Perplexity.ai**
> 
> Vector embeddings *do not* magically solve search. In fact, the heavy lifting is in the step before you re-rank with semantic similarity search. Making a genuine improvement over BM25 or full-text search is hard.

> **Beyang Liu, CTO Sourcegraph**
> 
> We've been communicating this to our customers and partners for months now. Nearest Neighbor Search with naive embeddings yields very noisy results and you're likely better off starting with a keyword-based approach.

Second, it's more straightforward to understand why a document was retrieved with keyword search—we can look at the keywords that match the query. In contrast, embedding-based retrieval is less interpretable. Finally, thanks to systems like Lucene and OpenSearch that have been optimized and battle-tested over decades, keyword search is usually more computationally efficient.

In most cases, a hybrid will work best: keyword matching for the obvious matches, and embeddings for synonyms, hypernyms, and spelling errors, as well as multimodality (e.g., images and text). [Shortwave shared how they built their RAG pipeline](https://www.shortwave.com/blog/deep-dive-into-worlds-smartest-email-ai/), including query rewriting, keyword + embedding retrieval, and ranking.

#### Prefer RAG over fine-tuning for new knowledge

Both RAG and fine-tuning can be used to incorporate new information into LLMs and increase performance on specific tasks. Thus, which should we try first?

Recent research suggests that RAG may have an edge. [One study](https://arxiv.org/abs/2312.05934) compared RAG against unsupervised fine-tuning (a.k.a. continued pre-training), evaluating both on a subset of MMLU and current events. They found that RAG consistently outperformed fine-tuning for knowledge encountered during training as well as entirely new knowledge. In [another paper](https://arxiv.org/abs/2401.08406), they compared RAG against supervised fine-tuning on an agricultural dataset. Similarly, the performance boost from RAG was greater than fine-tuning, especially for GPT-4 (see Table 20 of the paper).

Beyond improved performance, RAG comes with several practical advantages too. First, compared to continuous pretraining or fine-tuning, it's easier—and cheaper!—to keep retrieval indices up-to-date. Second, if our retrieval indices have problematic documents that contain toxic or biased content, we can easily drop or modify the offending documents.

In addition, the R in RAG provides finer grained control over how we retrieve documents. For example, if we're hosting a RAG system for multiple organizations, by partitioning the retrieval indices, we can ensure that each organization can only retrieve documents from their own index. This ensures that we don't inadvertently expose information from one organization to another.

#### Long-context models won't make RAG obsolete

With Gemini 1.5 providing context windows of up to 10M tokens in size, some have begun to question the future of RAG.

> **Yao Fu on long context and RAG**
> 
> I tend to believe that Gemini 1.5 is significantly overhyped by Sora. A context window of 10M tokens effectively makes most of existing RAG frameworks unnecessary—you simply put whatever your data into the context and talk to the model like usual. Imagine how it does to all the startups/agents/LangChain projects where most of the engineering efforts goes to RAG Or in one sentence: the 10m context kills RAG. Nice work Gemini.

While it's true that long contexts will be a game-changer for use cases such as analyzing multiple documents or chatting with PDFs, the rumors of RAG's demise are greatly exaggerated.

First, even with a context window of 10M tokens, we'd still need a way to select information to feed into the model. Second, beyond the narrow needle-in-a-haystack eval, we've yet to see convincing data that models can effectively reason over such a large context. Thus, without good retrieval (and ranking), we risk overwhelming the model with distractors, or may even fill the context window with completely irrelevant information.

Finally, there's cost. The Transformer's inference cost scales quadratically (or linearly in both space and time) with context length. Just because there exists a model that could read your organization's entire Google Drive contents before answering each question doesn't mean that's a good idea. Consider an analogy to how we use RAM: we still read and write from disk, even though there exist compute instances with [RAM running into the tens of terabytes](https://aws.amazon.com/ec2/instance-types/high-memory/).

So don't throw your RAGs in the trash just yet. This pattern will remain useful even as context windows grow in size.

### Tuning and optimizing workflows

Prompting an LLM is just the beginning. To get the most juice out of them, we need to think beyond a single prompt and embrace workflows. For example, how could we split a single complex task into multiple simpler tasks? When is finetuning or caching helpful with increasing performance and reducing latency/cost? In this section, we share proven strategies and real-world examples to help you optimize and build reliable LLM workflows.

#### Step-by-step, multi-turn "flows" can give large boosts

We already know that by decomposing a single big prompt into multiple smaller prompts, we can achieve better results. An example of this is [AlphaCodium](https://arxiv.org/abs/2401.08500): By switching from a single prompt to a multi-step workflow, they increased GPT-4 accuracy (pass@5) on CodeContests from 19% to 44%. The workflow includes:

- Reflecting on the problem
- Reasoning on the public tests
- Generating possible solutions
- Ranking possible solutions
- Generating synthetic tests
- Iterating on the solutions on public and synthetic tests

Small tasks with clear objectives make for the best agent or flow prompts. It's not required that every agent prompt requests structured output, but structured outputs help a lot to interface with whatever system is orchestrating the agent's interactions with the environment.

Some things to try:

- An explicit planning step, as tightly specified as possible. Consider having predefined plans to choose from.
- Rewriting the original user prompts into agent prompts. Be careful, this process is lossy!
- Agent behaviors as linear chains, DAGs, and State-Machines; different dependency and logic relationships can be more and less appropriate for different scales. Can you squeeze performance optimization out of different task architectures?
- Planning validations; your planning can include instructions on how to evaluate the responses from other agents to make sure the final assembly works well together.
- Prompt engineering with fixed upstream state—make sure your agent prompts are evaluated against a collection of variants of what may happen before.

#### Prioritize deterministic workflows for now

While AI agents can dynamically react to user requests and the environment, their non-deterministic nature makes them a challenge to deploy. Each step an agent takes has a chance of failing, and the chances of recovering from the error are poor. Thus, the likelihood that an agent completes a multi-step task successfully decreases exponentially as the number of steps increases. As a result, teams building agents find it difficult to deploy reliable agents.

A promising approach is to have agent systems that produce deterministic plans which are then executed in a structured, reproducible way. In the first step, given a high-level goal or prompt, the agent generates a plan. Then, the plan is executed deterministically. This allows each step to be more predictable and reliable. Benefits include:

- Generated plans can serve as few-shot samples to prompt or finetune an agent.
- Deterministic execution makes the system more reliable, and thus easier to test and debug. Furthermore, failures can be traced to the specific steps in the plan.
- Generated plans can be represented as directed acyclic graphs (DAGs) which are easier, relative to a static prompt, to understand and adapt to new situations.

The most successful agent builders may be those with strong experience managing junior engineers because the process of generating plans is similar to how we instruct and manage juniors. We give juniors clear goals and concrete plans, instead of vague open-ended directions, and we should do the same for our agents too.

In the end, the key to reliable, working agents will likely be found in adopting more structured, deterministic approaches, as well as collecting data to refine prompts and finetune models. Without this, we'll build agents that may work exceptionally well some of the time, but on average, disappoint users which leads to poor retention.

#### Getting more diverse outputs beyond temperature

Suppose your task requires diversity in an LLM's output. Maybe you're writing an LLM pipeline to suggest products to buy from your catalog given a list of products the user bought previously. When running your prompt multiple times, you might notice that the resulting recommendations are too similar—so you might increase the temperature parameter in your LLM requests.

Briefly, increasing the temperature parameter makes LLM responses more varied. At sampling time, the probability distributions of the next token become flatter, meaning that tokens which are usually less likely get chosen more often. Still, when increasing temperature, you may notice some failure modes related to output diversity. For example, some products from the catalog that could be a good fit may never be output by the LLM. The same handful of products might be overrepresented in outputs, if they are highly likely to follow the prompt based on what the LLM has learned at training time. If the temperature is too high, you may get outputs that reference nonexistent products (or gibberish!)

In other words, increasing temperature does not guarantee that the LLM will sample outputs from the probability distribution you expect (e.g., uniform random). Nonetheless, we have other tricks to increase output diversity. The simplest way is to adjust elements within the prompt. For example, if the prompt template includes a list of items, such as historical purchases, shuffling the order of these items each time they're inserted into the prompt can make a significant difference.

Additionally, keeping a short list of recent outputs can help prevent redundancy. In our recommended products example, by instructing the LLM to avoid suggesting items from this recent list, or by rejecting and resampling outputs that are similar to recent suggestions, we can further diversify the responses. Another effective strategy is to vary the phrasing used in the prompts. For instance, incorporating phrases like "pick an item that the user would love using regularly" or "select a product that the user would likely recommend to friends" can shift the focus and thereby influence the variety of recommended products.

#### Caching is underrated

Caching saves cost and eliminates generation latency by removing the need to recompute responses for the same input. Furthermore, if a response has previously been guardrailed, we can serve these vetted responses and reduce the risk of serving harmful or inappropriate content.

One straightforward approach to caching is to use unique IDs for the items being processed, such as if we're summarizing new articles or [product reviews](https://www.cnbc.com/2023/06/12/amazon-is-using-generative-ai-to-summarize-product-reviews.html). When a request comes in, we can check to see if a summary already exists in the cache. If so, we can return it immediately; if not, we generate, guardrail, and serve it, and then store it in the cache for future requests.

For more open-ended queries, we can borrow techniques from the field of search, which also leverages caching for open-ended inputs. Features like autocomplete and spelling correction also help normalize user input and thus increase the cache hit rate.

#### When to fine-tune

We may have some tasks where even the most cleverly designed prompts fall short. For example, even after significant prompt engineering, our system may still be a ways from returning reliable, high-quality output. If so, then it may be necessary to finetune a model for your specific task.

Successful examples include:

- [Honeycomb's Natural Language Query Assistant](https://www.honeycomb.io/blog/introducing-query-assistant): Initially, the "programming manual" was provided in the prompt together with n-shot examples for in-context learning. While this worked decently, fine-tuning the model led to better output on the syntax and rules of the domain-specific language.
- [ReChat's Lucy](https://www.youtube.com/watch?v=B_DMMlDuJB0): The LLM needed to generate responses in a very specific format that combined structured and unstructured data for the frontend to render correctly. Fine-tuning was essential to get it to work consistently.

### Evaluation & Monitoring

Evaluating LLMs is hard. But if we can't measure, we can't improve. How do we know if changes to our prompts or model configs lead to better or worse outcomes? This is particularly tricky for generative tasks where there's no single right answer. Nonetheless, by combining a few signals, we can define a useful evaluation framework that helps inform decisions and track if the system is improving over time.

#### Create a few assertion-based unit tests from real input/output samples

Creating unit tests for individual components is standard practice in software engineering. These unit tests verify that an isolated part of the code works correctly. This same principle applies to working with LLMs. Creating a handful of input-output pairs allows us to write assertions and verify the behavior of our prompts in specific situations.

The most straightforward assertions are function-based checks that verify that the output meets a specific criterion. This could be something as simple as checking that a response is non-empty, or more complex, such as checking that a specific piece of metadata is correctly extracted.

A key challenge when working with LLMs is that they'll often generate output even when they shouldn't. This can lead to harmless but nonsensical responses, or more egregious defects like toxicity or dangerous content. For example, when asked to extract specific attributes or metadata from a document, an LLM may confidently return values even when those values don't actually exist. Alternatively, the model may respond in a language other than English because we provided non-English documents in the context.

While we can try to prompt the LLM to return a "not applicable" or "unknown" response, it's not foolproof. Even when the log probabilities are available, they're a poor indicator of output quality. While log probs indicate the likelihood of a token appearing in the output, they don't necessarily reflect the correctness of the generated text. On the contrary, for instruction-tuned models that are trained to respond to queries and generate coherent response, log probabilities may not be well-calibrated. Thus, while a high log probability may indicate that the output is fluent and coherent, it doesn't mean it's accurate or relevant.

While careful prompt engineering can help to some extent, we should complement it with robust guardrails that detect and filter/regenerate undesired output. For example, OpenAI provides a [content moderation API](https://platform.openai.com/docs/guides/moderation) that can identify unsafe responses such as hate speech, self-harm, or sexual output. Similarly, there are numerous packages for detecting personally identifiable information (PII). One benefit is that guardrails are largely agnostic of the use case and can thus be applied broadly to all output in a given language. In addition, with precise retrieval, our system can deterministically respond "I don't know" if there are no relevant documents.

A corollary here is that LLMs may fail to produce outputs when they are expected to. This can happen for various reasons, from straightforward issues like long tail latencies from API providers to more complex ones such as outputs being blocked by content moderation filters. As such, it's important to consistently log inputs and (potentially a lack of) outputs for debugging and monitoring.

#### Hallucinations are a stubborn problem

Unlike content safety or PII defects which have a lot of attention and thus seldom occur, factual inconsistencies are stubbornly persistent and more challenging to detect. They're more common and occur at a baseline rate of 5 – 10%, and from what we've learned from LLM providers, it can be challenging to get it below 2%, even on simple tasks such as summarization.

To address this, we can combine prompt engineering (upstream of generation) and factual inconsistency guardrails (downstream of generation). For prompt engineering, techniques like CoT help reduce hallucination by getting the LLM to explain its reasoning before finally returning the output. Then, we can apply a [factual inconsistency guardrail](https://eugeneyan.com/writing/finetuning/) to assess the factuality of summaries and filter or regenerate hallucinations. In some cases, hallucinations can be deterministically detected. When using resources from RAG retrieval, if the output is structured and identifies what the resources are, you should be able to manually verify they're sourced from the input context.

## About the authors

**Eugene Yan** designs, builds, and operates machine learning systems that serve customers at scale. He's currently a Senior Applied Scientist at Amazon where he builds RecSys serving millions of customers worldwide and applies LLMs to serve customers better. Previously, he led machine learning at Lazada (acquired by Alibaba) and a Healthtech Series A. He writes & speaks about ML, RecSys, LLMs, and engineering at [eugeneyan.com](https://eugeneyan.com/) and [ApplyingML.com](https://applyingml.com/).

**Bryan Bischof** is the Head of AI at Hex, where he leads the team of engineers building Magic—the data science and analytics copilot. Bryan has worked all over the data stack leading teams in analytics, machine learning engineering, data platform engineering, and AI engineering. He started the data team at Blue Bottle Coffee, led several projects at Stitch Fix, and built the data teams at Weights and Biases. Bryan previously co-authored the book Building Production Recommendation Systems with O'Reilly, and teaches Data Science and Analytics in the graduate school at Rutgers. His Ph.D. is in pure mathematics.

**Charles Frye** teaches people to build AI applications. After publishing research in psychopharmacology and neurobiology, he got his Ph.D. at the University of California, Berkeley, for dissertation work on neural network optimization. He has taught thousands the entire stack of AI application development, from linear algebra fundamentals to GPU arcana and building defensible businesses, through educational and consulting work at Weights and Biases, [Full Stack Deep Learning](https://fullstackdeeplearning.com/), and Modal.

**Hamel Husain** is a machine learning engineer with over 25 years of experience. He has worked with innovative companies such as Airbnb and GitHub, which included early LLM research used by OpenAI for code understanding. He has also led and contributed to numerous popular open-source machine-learning tools. Hamel is currently an independent consultant helping companies operationalize Large Language Models (LLMs) to accelerate their AI product journey.

**Jason Liu** is a distinguished machine learning consultant known for leading teams to successfully ship AI products. Jason's technical expertise covers personalization algorithms, search optimization, synthetic data generation, and MLOps systems. His experience includes companies like Stitch Fix, where he created a recommendation framework and observability tools that handled 350 million daily requests. Additional roles have included Meta, NYU, and startups such as Limitless AI and Trunk Tools.

**Shreya Shankar** is an ML engineer and PhD student in computer science at UC Berkeley. She was the first ML engineer at 2 startups, building AI-powered products from scratch that serve thousands of users daily. As a researcher, her work focuses on addressing data challenges in production ML systems through a human-centered approach. Her work has appeared in top data management and human-computer interaction venues like VLDB, SIGMOD, CIDR, and CSCW.

## Contact Us

We would love to hear your thoughts on this post. You can contact us at contact@applied-llms.org. Many of us are open to various forms of consulting and advisory. We will route you to the correct expert(s) upon contact with us if appropriate.

## Acknowledgements

This series started as a conversation in a group chat, where Bryan quipped that he was inspired to write "A Year of AI Engineering." Then, magic happened in the group chat, and we were all inspired to chip in and share what we've learned so far.

The authors would like to thank Eugene for leading the bulk of the document integration and overall structure in addition to a large proportion of the lessons. Additionally, for primary editing responsibilities and document direction. The authors would like to thank Bryan for the spark that led to this writeup, restructuring the write-up into tactical, operational, and strategic sections and their intros, and for pushing us to think bigger on how we could reach and help the community. The authors would like to thank Charles for his deep dives on cost and LLMOps, as well as weaving the lessons to make them more coherent and tighter—you have him to thank for this being 30 instead of 40 pages! The authors appreciate Hamel and Jason for their insights from advising clients and being on the front lines, for their broad generalizable learnings from clients, and for deep knowledge of tools. And finally, thank you Shreya for reminding us of the importance of evals and rigorous production practices and for bringing her research and original results to this piece.

Finally, the authors would like to thank all the teams who so generously shared your challenges and lessons in your own write-ups which we've referenced throughout this series, along with the AI communities for your vibrant participation and engagement with this group.
  `
};

export default project;












