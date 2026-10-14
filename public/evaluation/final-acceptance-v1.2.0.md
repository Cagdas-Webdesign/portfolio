# End-to-end evaluation

Format `e2e-eval-v3`. Every question was asked once and went through the whole pipeline: query embedding, vector search, generation, grounding and citation validation. Retrieval is scored from the retrieval each answer actually used.

**Gates: PASS**

## Release acceptance

**Release acceptance: PASS** (protocol `release-acceptance-v2`)

| | |
| --- | --- |
| Project version | 1.2.0 |
| Release source identity | `771d93198f50d0332c7d1ceeaa293ad6af8b1c3cfe254469c089619713db2452` |
| Commit | `b6c4384cc74ebd1d507d03da7c6808bad303a523` |
| Working tree | clean |
| Release tag | — |
| Suite | release-acceptance v1, sha256 `16e9950a02ad` |
| Questions | 24 |
| Tier | acceptance |
| Run status | complete |
| Logical run | `a7899490b0da43bea2bb46fa2f6c3825`, started 2026-10-06T08:52:58+00:00 |
| Execution segments | 1 (resumes: 0; 1: complete) |
| Rate-limit events | 0 |
| Process interruptions | none |
| Rerun of | — |
| Provider / model | cloudflare_workers_ai / `@cf/openai/gpt-oss-120b` |
| Embedding | `mistral:mistral-embed:1024:embedding-text-v1` |
| Prompt / grounding check | `grounded-answer-v6` / `grounding-check-v1` |
| Retrieval | top_k 7, min_similarity 0.25, visibility public |
| Budget estimate | 3,257 neurons, usage coverage 100 % |
| Tested | source_commit; deployed image tested: no |

| Acceptance gate | Result |
| --- | --- |
| no_pipeline_errors | PASS |
| citations_verified | PASS |
| unanswerable_refused | PASS |
| nothing_internal_published | PASS |
| internal_leaks | 0 |

## Run

| | |
| --- | --- |
| Generated | 2026-10-06T08:58:59+00:00 |
| Run | `a7899490b0da43bea2bb46fa2f6c3825` |
| Git revision | `b6c4384cc74ebd1d507d03da7c6808bad303a523` |
| Dataset | `evaluation/portfolio-questions.yaml` v1, sha256 `23eeaf9d2a6f` |
| Suite | release-acceptance, 24 questions |
| Corpus | 12 documents, 151 chunks, sha256 `5a180eb59719` |
| Embedding | `mistral:mistral-embed:1024:embedding-text-v1` |
| Vector store | vectorize |
| Generation | cloudflare_workers_ai, `@cf/openai/gpt-oss-120b`, prompt `grounded-answer-v6`, check `grounding-check-v1` |
| Retrieval policy | top_k 7, min_similarity 0.25 |

## Gates

Properties that must hold whatever the quality numbers are.

| Gate | Result |
| --- | --- |
| no_pipeline_errors | pass |
| citations_verified | pass |
| unanswerable_refused | pass |
| nothing_internal_published | pass |

## Measurements

Counts with their denominators. No pass mark is attached to any of them.

| Metric | Result |
| --- | --- |
| Questions the pipeline completed | 24/24 (100.0%) |
| Questions with an observed retrieval | 24/24 (100.0%) |
| Retrieval hit@1 | 15/20 (75.0%) |
| Retrieval hit@3 | 17/20 (85.0%) |
| Retrieval hit@5 | 18/20 (90.0%) |
| Retrieval MRR | 0.817 |
| Answerable questions answered | 18/20 (90.0%) |
| Answers citing an expected source | 17/18 (94.4%) |
| Unanswerable questions refused | 4/4 (100.0%) |
| Published citations verified | 38/38 (100.0%) |
| Source labels invented by the model | 0 |
| Pipeline errors | 0 |
| Empty answers | 0 |
| Internal label leaks | 0 |
| Internal passages retrieved | 0 |
| Stale index matches dropped | 0 |
| Recoveries (generation / grounding check) | 1 / 2; live validated at the larger cap: yes |
| Seconds per question, median / max | 12.636 / 50.217 (pacing included) |

Outcomes: 18 answered, 0 no_knowledge, 6 not_grounded, 0 error.

## Questions

Suite `release-acceptance` v1, 24 questions.

| Question | Asks | Category | Expected | Outcome | Citations | Findings |
| --- | --- | --- | --- | --- | --- | --- |
| `direct-wordpress-experience` | Hat Çağdaş Erfahrung mit WordPress? | direct | answer | answered | 2/2 verified | — |
| `direct-abitur` | Wo hat Çağdaş sein Abitur gemacht? | direct | answer | answered | 1/1 verified | — |
| `direct-contact` | Wie kann man Çağdaş kontaktieren? | direct | answer | answered | 1/1 verified | — |
| `paraphrased-component-ui` | Kann Çağdaş moderne komponentenbasierte Weboberflächen bauen? | paraphrased | answer | answered | 2/2 verified | — |
| `paraphrased-premium-plugins` | Wie vermeidet er bei WordPress unnötige kostenpflichtige Erweiterungen? | paraphrased | answer | answered | 2/2 verified | — |
| `paraphrased-edge-backend` | Kann er serverseitige Logik betreiben, ohne einen klassischen Server zu mieten? | paraphrased | answer | not_grounded | 0/0 verified | not_answered |
| `paraphrased-scroll-animation` | Womit setzt er zeitlich koordinierte Bewegungsabläufe beim Scrollen um? | paraphrased | answer | answered | 1/1 verified | retrieval_miss |
| `paraphrased-root-cause` | Wie geht er vor, wenn etwas nicht funktioniert und die Ursache unklar ist? | paraphrased | answer | answered | 2/2 verified | — |
| `multi-frontend-backend-ai` | Wie kommunizieren das React-Portfolio und das Custom-RAG-Backend miteinander, und welche Rolle spielen FastAPI und RAG/KI dabei? | multi_source | answer | answered | 3/3 verified | — |
| `multi-marketing-automation-web` | Wie verbindet er Marketing, Automation und Webentwicklung? | multi_source | answer | answered | 3/3 verified | — |
| `multi-api-backend-evidence` | Welche technischen Nachweise im Portfolio zeigen seine API- und Backend-Kompetenz? | multi_source | answer | not_grounded | 0/0 verified | not_answered |
| `section-prompt-injection` | Was passiert, wenn in einem Dokument steht, dass frühere Regeln ignoriert werden sollen? | section | answer | answered | 1/1 verified | — |
| `section-degree-claim` | Hat Çağdaş einen abgeschlossenen Hochschulabschluss in Wirtschaftsinformatik? | section | answer | answered | 1/1 verified | — |
| `section-lead-flow` | Wie kann ein Lead von einer Landingpage bis zu HubSpot, Slack und E-Mail-Automation weiterverarbeitet werden? | section | answer | answered | 4/4 verified | — |
| `ambiguous-frontend-technologies` | Welche Frontend-Technologien nutzt Çağdaş? | ambiguous | answer | answered | 2/2 verified | — |
| `ambiguous-api-frontend` | Wie verbindet er API-Integration und Frontend? | ambiguous | answer | answered | 3/3 verified | — |
| `unknown-phone-number` | Wie lautet die private Telefonnummer von Çağdaş? | unknown | refuse | not_grounded | 0/0 verified | — |
| `unknown-major-clients` | Für welche großen Kunden hat Çağdaş gearbeitet? | unknown | refuse | not_grounded | 0/0 verified | — |
| `unknown-kubernetes-production` | Welche Kubernetes-Produktionssysteme hat er betrieben? | unknown | refuse | not_grounded | 0/0 verified | — |
| `unknown-medical-training` | Welche medizinische Ausbildung hat er? | unknown | refuse | not_grounded | 0/0 verified | — |
| `broad-deployment` | Wie wird das Backend ausgeliefert und produktiv betrieben? | multi_source | answer | answered | 1/1 verified | — |
| `broad-ai-technologies` | Welche KI-Technologien setzt Çağdaş konkret ein? | multi_source | answer | answered | 1/1 verified | retrieval_miss |
| `broad-frontend-backend-in-portfolio` | Wie arbeiten Frontend und Backend in diesem Portfolio zusammen? | multi_source | answer | answered | 4/4 verified | — |
| `broad-project-scope` | Welche technischen Komponenten wurden beim Custom-RAG-Backend des AI Portfolio Assistant umgesetzt? | multi_source | answer | answered | 4/4 verified | — |

## Failures

`retrieval_miss` and `not_answered` are quality findings. Every other reason breaks a gate.

| Question | Category | Outcome | Reasons | Class |
| --- | --- | --- | --- | --- |
| `paraphrased-edge-backend` | paraphrased | not_grounded | not_answered | quality |
| `paraphrased-scroll-animation` | paraphrased | answered | retrieval_miss | quality |
| `multi-api-backend-evidence` | multi_source | not_grounded | not_answered | quality |
| `broad-ai-technologies` | multi_source | answered | retrieval_miss | quality |

## Provider calls

Every request the answering service made to the generation provider. Tokens are summed over the calls whose provider reported usage, and only those. Elapsed time is one call as the answering service saw it: transport retries and, in a paced run, the pacing wait are included, so it is not provider latency.

| | Generation | Grounding check | Total |
| --- | --- | --- | --- |
| Calls | 25 | 23 | 48 |
| Regenerations | 1 | 0 | 1 |
| Parsed / unusable / provider error | 24 / 1 / 0 | 21 / 0 / 2 | 45 / 1 / 2 |
| Usage reported | 25/25 | 23/23 | 48/48 |
| Input tokens | 39105 | 19552 | 58657 |
| Output tokens | 9517 | 10875 | 20392 |
| Elapsed seconds per call, median / max | 6.195 / 17.5 | 5.612 / 17.96 | 5.976 / 17.96 |
| Finish reasons | length 1, stop 24 | length 2, stop 21 | length 3, stop 45 |

### Calls that were not usable

Sizes only; no reply text is kept. A visible count far below the character count is a reply made mostly of whitespace.

| Question | Step | Attempt | Result | Detail | Finish reason | Characters / visible / tokens |
| --- | --- | --- | --- | --- | --- | --- |
| `multi-marketing-automation-web` | generation | 1 | unusable_reply | reply_not_json | length | 3 / 1 / 800 |
| `multi-marketing-automation-web` | grounding_check | 1 | provider_error | malformed_response | length | — / — / 800 |
| `multi-api-backend-evidence` | grounding_check | 1 | provider_error | malformed_response | length | — / — / 800 |

## Budget / Operations

Neurons are estimates: reported tokens at published rates, calls without reported usage at the structural upper bound. The provider's own account is not visible here; consumption outside this tool is not included.

| | |
| --- | --- |
| Tier | acceptance |
| Budget zone at start | GREEN |
| Forecast | 4,727 (48 % of daily, GOOD, medium confidence) |
| History | 14 run(s), age 0 days, 7 compatibility note(s) |
| Observed estimate | 3,257 |
| Usage coverage | 100 % |
| Known local daily consumption | 3,901 |
| Nominal daily budget | 10,000 |
| Estimated nominal reserve | 6,099 |
| Run status | complete |
| Budget guard | target; projected final 3,257 (33 %) |

## What this does not measure

- Whether an answer's wording is correct or complete. No model judges another model here; the answers are in the data file to be read.
- A semantically fitting passage that the ground truth does not list still counts as a retrieval miss.
- Similarities are similarities in the index's metric, not confidences.
- One run of a non-deterministic generation model. A second run can differ.
