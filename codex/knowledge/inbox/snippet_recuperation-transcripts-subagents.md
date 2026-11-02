---
title: 'Récupérer les rapports de subagents depuis les transcripts JSONL'
date: 2026-11-02
type: snippet
tags: [pi, subagents, jq, debugging, workflow]

**Contexte :** Coupure réseau en pleine fan-out de subagents : statuts « Error: timed out », résultats tronqués à ~300 caractères dans les notifications, et registre nettoyé (« Agent not found » au resume). Les transcripts restent sur disque — tout est récupérable.

**Corps :**
Les fichiers `<task-id>.output` sont du JSONL : records `{type: assistant|toolResult|user, message: {content: [{type: text|thinking|toolCall, ...}]}}`.

Extraire les textes assistant (rapport final = dernier bloc text ; les findings intermédiaires survivent dans les blocs thinking) :

```bash
jq -r 'select(.type=="assistant") | .message.content | map(select(.type=="text") | .text) | join("\n")' <task-id>.output
```

Pour les thinking (contexte de reprise pour un agent neuf) :

```bash
jq -r 'select(.type=="assistant") | .message.content | map(select(.type=="thinking") | .thinking) | join("\n")' <task-id>.output
```

Gotchas : `map(...) | join` est plus robuste que `content[]? | select(...)` (records vides / shapes variables). Un agent fini peut être relancé via `resume <agent-id>` tant que le registre le connaît ; sinon, relancer un agent neuf **amorcé avec les blocs thinking récupérés** pour ne pas repartir de zéro. Les notifications tronquent toujours — récupérer le rapport complet du transcript.

## **Lien codebase :** `/tmp/pi-subagents-*/<session>/tasks/<task-id>.output`
