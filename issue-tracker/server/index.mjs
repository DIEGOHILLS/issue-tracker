import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: '15kb' })); // small body size

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30               // limit each IP to 30 requests per minute
});
app.use(limiter);


function extractJsonFromText(text) {
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) return null;
  const jsonStr = text.slice(first, last + 1);
  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    return null;
  }
}

// validate/sanitize function
function normalizeSuggestionPriority(raw) {
  if (!raw) return null;
  const s = raw.toString().trim().toLowerCase();
  if (s.includes('high')) return 'high';
  if (s.includes('medium')) return 'medium';
  if (s.includes('low')) return 'low';
  return null;
}
function normalizeSuggestionStatus(raw) {
  if (!raw) return null;
  const s = raw.toString().trim().toLowerCase();
  if (s.includes('open')) return 'open';
  if (s.includes('in_progress') || s.includes('in progress') || s.includes('progress')) return 'in_progress';
  if (s.includes('closed')) return 'closed';
  return null;
}

app.post('/api/analyze-issue', async (req, res) => {
  try {
    const { title = '', description = '' } = req.body;
    if (!description && !title) return res.status(400).json({ ok: false, error: 'title or description required' });


    const userPrompt = `
Return ONLY valid JSON. No extra commentary.
Analyze this software issue (title + description) and produce:
{
  "summary": "<1-2 sentence summary>",
  "suggestedPriority": "low|medium|high",
  "suggestedStatus": "open|in_progress|closed",
  "hints": ["short actionable hint 1", "hint 2"]
}
Title: ${title}
Description: ${description}
`;

    // call OpenAI Chat Completions endpoint via fetch (stable)
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', 
        messages: [
          { role: 'system', content: 'You are an assistant that helps triage software issues. Only emit JSON when asked.' },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 300
      })
    });

    const json = await resp.json();
    const text = (json.choices?.[0]?.message?.content) ?? '';

    // try to parse JSON strictly; fallback to building a simple object
    let parsed = extractJsonFromText(text);
    if (!parsed) {
      // fallback: assume the full response is a natural language summary -> put that into summary
      parsed = {
        summary: text.trim(),
        suggestedPriority: null,
        suggestedStatus: null,
        hints: []
      };
    }

    // normalize values to our allowed values
    parsed.suggestedPriority = normalizeSuggestionPriority(parsed.suggestedPriority) || null;
    parsed.suggestedStatus = normalizeSuggestionStatus(parsed.suggestedStatus) || null;
    parsed.hints = Array.isArray(parsed.hints) ? parsed.hints.slice(0, 5) : [];

    return res.json({ ok: true, data: parsed });
  } catch (err) {
    console.error('AI analyze error', err?.message || err);
    return res.status(500).json({ ok: false, error: 'AI analyze failed' });
  }
});

app.get('/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));

app.listen(PORT, () => console.log(`AI server listening on http://localhost:${PORT}`));
