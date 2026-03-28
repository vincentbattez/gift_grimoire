# Forge documentation generation prompt

You are generating a documentation file (`DOCUMENTATION.md`) for a forge module in the Gift Grimoire project.

## Context

Gift Grimoire is a narrative puzzle game disguised as a romantic gift. The player progresses through "forges" — interactive challenges embedded in a mystical grimoire. Each forge unlocks a rune fragment upon completion.

## Inputs

Fill in the following before using this prompt:

- **Module name**: `{{MODULE_NAME}}` (e.g., "forge-magnet")
- **Forge title**: `{{FORGE_TITLE}}` (e.g., "La chaleur de l'Arc-en-ciel")
- **Lore summary**: `{{LORE_SUMMARY}}` (1-2 sentences describing the narrative/poetic framing of this forge)
- **Core mechanic**: `{{CORE_MECHANIC}}` (what the player physically/digitally does to solve the forge)
- **Features list**: `{{FEATURES}}` (list each feature with a short description of its behavior)

## Expected output

Generate a single Markdown file with **exactly three sections**:

### Section 1 — Game explanation

Write a short paragraph (3-4 sentences) explaining:
- What Gift Grimoire is (narrative puzzle game, romantic gift)
- How forges work in the game (interactive challenges, rune fragments)
- What makes this specific forge distinctive (e.g., physical sensor, pure client-side puzzle, audio-driven)

Start with the shared game context, then specialize to this forge's category.

### Section 2 — Module objective

Write 2-3 sentences describing:
- What the player must do to complete this forge
- The lore/narrative framing behind the mechanic
- Any constraints (daily limits, attempt restrictions, time windows)

Use the lore summary and core mechanic inputs.

### Section 3 — Features

For each feature provided in the inputs, write a subsection (`###` heading) with:
- **Name** — A short, descriptive title (e.g., "Daily attempt limit", "FLIP animation system")
- **Description** — 2-5 sentences explaining:
  - What the feature does
  - How it behaves from the player's perspective
  - Key technical details (component names, store keys, entity IDs, timing values) when they aid understanding

## Tone and style rules

- **Language**: English
- **Tone**: Technical but readable — assume the reader is a developer or an LLM consuming the file for code generation
- **Detail level**: Include concrete values (durations in ms, entity IDs, store key names) — avoid vague descriptions
- **No code blocks**: Describe behavior in prose, not code snippets
- **Heading format**: `# Forge — {{FORGE_TITLE}}` as the top-level heading
- **Feature headings**: Use `###` level (H3) for each feature
- **Consistency**: Follow the exact same section order and heading hierarchy across all forge documentation files

## Example structure

```markdown
# Forge — {{FORGE_TITLE}}

## Game explanation

[3-4 sentences]

## Module objective

[2-3 sentences]

## Features

### Feature name A

[2-5 sentences]

### Feature name B

[2-5 sentences]

...
```
