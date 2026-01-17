# API Documentation

## Overview

The notCringe API provides reply generation endpoints for creating high-quality, non-cringe social media comments. All endpoints return JSON responses.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

Currently, the API is open (no authentication required for MVP). Future versions will implement rate limiting and API keys.

---

## Endpoints

### POST /api/generate

Generate ranked reply suggestions for a social media post.

#### Request

**Headers:**

```
Content-Type: application/json
```

**Body:**

```typescript
{
  postText: string,           // Required: 1-5000 characters
  vibe?: "diplomatic" | "direct" | "playful" | "nerdy" | "contrarian",
  risk?: "safe" | "medium" | "bold",
  length?: "one-liner" | "two-three" | "paragraph",
  cta?: "none" | "question" | "invite" | "resource",
  persona?: "builder" | "designer" | "pm" | "founder" | "recruiter",
  noCringe?: boolean          // Default: true
}
```

**Field Descriptions:**

| Field      | Type    | Default      | Description                                               |
| ---------- | ------- | ------------ | --------------------------------------------------------- |
| `postText` | string  | -            | The original post text to generate replies for. Required. |
| `vibe`     | enum    | "diplomatic" | The tone/style of the replies                             |
| `risk`     | enum    | "medium"     | How bold/safe the replies should be                       |
| `length`   | enum    | "two-three"  | Target length for replies                                 |
| `cta`      | enum    | "none"       | Whether to include a call-to-action                       |
| `persona`  | enum    | "builder"    | The professional voice to use                             |
| `noCringe` | boolean | true         | Enable safety filters to prevent cringe content           |

**Example Request:**

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "postText": "Shipping fast is less about speed and more about removing hidden approval steps. Most teams already have the talent. They just need fewer gates.",
    "vibe": "nerdy",
    "risk": "medium",
    "length": "two-three",
    "cta": "question",
    "persona": "builder"
  }'
```

#### Response

**Success (200):**

```typescript
{
  replies: Array<{
    category: "SAFE" | "INTERESTING" | "BOLD",
    text: string,
    tags: string[],           // 2-3 tags explaining why it works
    lengthLabel: "short" | "medium" | "long",
    score?: number            // 0-1 ranking score
  }>,
  latencyMs?: number          // Generation time in milliseconds
}
```

**Response Structure:**

The replies array is organized as follows:

- **SAFE** (3-5 replies): Supportive, specific, low-risk
- **INTERESTING** (4-8 replies): Adds frameworks, nuance, or examples
- **BOLD** (2-5 replies): Tasteful contrarian or strong POV

**Example Response:**

```json
{
  "replies": [
    {
      "category": "SAFE",
      "text": "The point about approval steps is spot-on. Even small reductions in review cycles can dramatically improve velocity.",
      "tags": ["specific", "tone-fit", "value-add"],
      "lengthLabel": "medium",
      "score": 0.92
    },
    {
      "category": "INTERESTING",
      "text": "This maps to the 'gates vs guardrails' framework—guardrails are automated checks that don't slow you down. Most teams just stack gates.",
      "tags": ["framework", "specific", "actionable"],
      "lengthLabel": "medium",
      "score": 0.88
    },
    {
      "category": "BOLD",
      "text": "Hot take: the problem isn't approval steps, it's that most teams don't trust their own talent. Remove trust issues, not just processes.",
      "tags": ["contrarian", "specific", "thought-provoking"],
      "lengthLabel": "medium",
      "score": 0.84
    }
  ],
  "latencyMs": 2847
}
```

#### Error Responses

**400 Bad Request:**

```json
{
  "error": "Invalid request",
  "details": "postText must be between 1 and 5000 characters"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Generation failed",
  "message": "Unable to generate replies. Please try again."
}
```

---

## Rate Limits

| Tier          | Rate Limit         | Notes                               |
| ------------- | ------------------ | ----------------------------------- |
| MVP (current) | Unlimited          | No rate limiting in current version |
| Free          | 20 requests/hour   | Planned for production              |
| Pro           | 500 requests/hour  | Planned for production              |
| Team          | 2000 requests/hour | Planned for production              |

---

## Reply Tags

Possible tags that explain why a reply works:

- `specific` - References concrete details from the post
- `value-add` - Adds tools, patterns, nuance, or examples
- `conversational` - Includes inviting questions or prompts
- `tone-fit` - Matches chosen vibe/persona
- `brief` - Concise and readable
- `framework` - Introduces a mental model
- `actionable` - Provides practical steps
- `contrarian` - Respectfully disagrees
- `thought-provoking` - Invites deeper thinking
- `relatable` - Uses personal anecdotes

---

## Safety Filters

When `noCringe: true` (default), the API blocks:

- Harassment or targeted insults
- Hate speech or identity attacks
- Instructions for wrongdoing
- Overly promotional or salesy content
- Generic praise that sounds fake

Note: "Bold" does not mean hostile. Bold replies are contrarian but respectful.

---

## Performance Targets

- **Median latency:** < 4 seconds
- **P95 latency:** < 6 seconds
- **Availability:** 99.5%

---

## Future Endpoints (Roadmap)

### POST /api/generate/followup

Generate follow-up replies to continue a conversation thread.

### GET /api/saved-posts

Retrieve saved posts for later.

### POST /api/feedback

Submit feedback on reply quality (worked/too-cringe/too-long).

### POST /api/voice-profile

Create or update a custom voice profile.

---

## Changelog

### v0.1.0 (Current)

- Initial MVP release
- POST /api/generate endpoint
- Reply ladder (Safe/Interesting/Bold)
- Vibe, risk, length, CTA controls
- Basic safety filters
