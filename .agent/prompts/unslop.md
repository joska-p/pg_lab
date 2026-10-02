# Unslop

Edits remove AI patterns and restore human voice.

## Process

1. The scan covers the catalog below.
2. The rewrite preserves meaning and matches intended tone.
3. Soul goes in (next section).
4. The self-audit asks one question: "what makes this obviously AI generated?" Remaining tells get fixed.

## Soul

Removal is half the job; sterile, voiceless writing is its own kind of obvious.

- Opinions live in the text: facts meet reactions rather than neutral pro-con lists.
- Rhythm varies: short sentences, then longer ones taking their time.
- Complexity gets acknowledged: "impressive but also kind of unsettling" beats "impressive".
- "I" appears where it fits; first person costs nothing professionally.
- Some mess stays in; perfect structure reads machine-made.
- Specificity wins: "there's something unsettling about agents churning away at 3am" says more than "this is concerning".

## Catalog

### Content

1. **Puffery.** "pivotal moment", "testament to", "evolving landscape", "setting the stage for", "indelible mark", "deeply rooted". The fix states what happened.
2. **Name-dropping.** Media outlets listed without context. One outlet gets picked, its claim stated.
3. **Superficial -ing phrases.** "highlighting...", "ensuring...", "reflecting...", "showcasing...", "fostering...". Deletion, or expansion with real sources.
4. **Promotional language.** "nestled", "vibrant", "breathtaking", "groundbreaking", "renowned", "stunning", "must-visit". Neutral descriptions take over.
5. **Vague attributions.** "Experts believe", "Industry reports suggest", "Some critics argue". The source gets named or the sentence goes.
6. **Formulaic challenges.** "Despite challenges... continues to thrive." Specific facts take their place.

### Language

7. **AI vocabulary.** Additionally, crucial, delve, enduring, enhance, fostering, garner, interplay, intricate, landscape (abstract), pivotal, showcase, tapestry (abstract), testament, underscore, vibrant. Plain words replace them.
8. **Fancy ways to say "is".** "serves as", "stands as", "boasts", "features". "Is" or "has" does the job.
9. **"Not just X, but Y."** The point stands on its own.
10. **Rule of three.** Ideas forced into groups of three. The natural number wins.
11. **Synonym cycling.** Protagonist, main character, central figure, hero in one paragraph. One term, repeated.
12. **False ranges.** "from X to Y" where X and Y sit off any meaningful scale. Topics get listed directly.

### Style

13. **Em dash overuse.** Periods and commas carry separation; parentheses, en dashes, and hyphen-as-dash substitutes stay out with them. A thought needing separation ends the sentence or takes a comma.
14. **Colon overuse.** Colons introduce lists and examples; mid-sentence comparison framing dissolves into plain statements.
15. **Boldface overuse.** Bold marks genuinely new lead-ins; proper nouns and acronyms stay regular weight.
16. **Inline-header lists.** The bold label plus colon restating its own line converts to prose. A bold lead-in ending in a period, naming the item, followed by genuinely new detail ("**Schema in TypeScript.** Tables live in one file.") is the healthy form.
17. **Title case headings.** Sentence case throughout.
18. **Decorative emojis.** Headings and bullets carry text alone.
19. **Curly quotes.** Straight quotes everywhere.

### Communication artifacts

20. **Chatbot phrases.** "I hope this helps!", "Let me know if...", "Of course!", "Certainly!", "Found the smoking gun!" Gone.
21. **Cutoff disclaimers.** "While specific details are limited..." Sources or removal.
22. **Sycophantic tone.** "Great question! You're absolutely right!" The response addresses the content directly.

### Filler

23. **Filler phrases.** "In order to" becomes "To". "Due to the fact that" becomes "Because". "It is important to note that" vanishes.
24. **Excessive hedging.** "could potentially possibly be argued that it might" becomes "may".
25. **Generic conclusions.** "The future looks bright." Specific plans or facts close the piece.

### Jargon

26. **Abstract metaphor nouns.** Substrate, wedge, vector, locus, vantage, nexus, primitive (as noun), harness (as metaphor), surface (as in "API surface"), bedrock, scaffolding (as metaphor), modality, paradigm, gold-plating, ratchet (as metaphor), evacuate (for moving code), endgame, north star, flywheel. Each carries a plainer concrete word. "Substrate" becomes "base". "Wedge in" becomes "add". "Vector" becomes "way" or "method". "Gold-plating" becomes "more than the job needs". "Ratchet" becomes the mechanism's real name or "a limit that only tightens". "Evacuate" becomes "move out". "Endgame" becomes "the last phase".

### Plain speech

27. **Say what it does, not how it feels.** Feeling-names ("the database stays close at hand", "SQL you can read") give way to mechanism or number: "`.toSQL()` returns the exact string sent to the database", "a column rename fails the build". The test: a sentence restatable unchanged in another project's docs says nothing about this one and goes.
28. **Dense sentences.** Backtrack-prone sentences split in two or drop clauses. One idea per sentence.
29. **Active voice.** "is/are/was/were + past participle" hands the actor its verb: "queries are validated" becomes "the compiler validates queries", "the file is parsed by the loader" becomes "the loader parses the file". Passive survives where the actor is unknown or beside the point.
30. **Adverbs.** An adverb propping up a weak verb points at the wrong verb: "runs quickly" becomes "is fast" or the number, "significantly improves" becomes the measured delta.
31. **Plain words.** "utilize" becomes "use", "leverage" becomes "use", "facilitate" becomes "help", "numerous" becomes "many", "in the event that" becomes "if".
