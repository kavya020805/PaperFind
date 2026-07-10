# Hybrid Search: A Deep Dive

PaperFind utilizes a **Hybrid Search** ranking approach to find the most relevant academic papers for any given query. This approach combines two radically different paradigms of search into one unified score.

## 1. Semantic Vector Search (`<=>`)
When a user inputs a query, we use the HuggingFace `all-MiniLM-L6-v2` model to embed the query into a 384-dimensional dense vector space.

Inside our PostgreSQL database (via `pgvector`), every document's abstract has already been embedded into this same vector space. We calculate the mathematical distance between the query vector and the document vectors using the **Cosine Distance Operator (`<=>`)**. 

A distance of `0` means identical vectors. To convert this into a "similarity score" (where higher is better), we do: `1 - (<=>)`.

*Strengths: Understands context, synonyms, and the underlying meaning of the text.*
*Weaknesses: Can sometimes miss exact terminology or specific jargon.*

## 2. Keyword Search (`ts_rank`)
To supplement the semantic search, we use PostgreSQL's native Full-Text Search. We convert the document abstracts into a `tsvector` (a sorted list of lexemes), and the user's query into a `tsquery`.

We then rank the matches using `ts_rank`, which calculates a score based on how frequently the keywords appear in the document.

*Strengths: Exact matches, specific terminology, and jargon.*
*Weaknesses: Cannot understand synonyms (e.g., "AI" vs "Artificial Intelligence").*

## 3. The Hybrid Score Formula
To get the best of both worlds, our SQL query calculates both scores and combines them using a weighted formula:

```sql
(semantic_score * 0.7) + (keyword_score * 0.3) AS hybrid_score
```

We weigh the semantic score heavier (70%) because academic concepts are often highly contextual, but we keep a 30% keyword weight to ensure exact matches are boosted to the top of the list!
