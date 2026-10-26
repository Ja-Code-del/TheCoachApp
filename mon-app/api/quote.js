// ── Config par locale ──────────────────────────────────────────────────────
const LOCALE_CONFIG = {
  fr: {
    outputLang: 'French (français)',
    geoLit: `French and Francophone literature:
- French classics: Hugo, Camus, Prévert, de Beauvoir, Montaigne, Voltaire, Proust, Rimbaud
- Francophone Africa: Senghor, Césaire, Kourouma, Oyono, Bâ
- Quebec, Belgium, Switzerland: Nelligan, Simenon, Ramuz`,
    proverbs: 'French and African proverbs, Francophone anonymous sayings',
  },
  en: {
    outputLang: 'English',
    geoLit: `Anglophone literature:
- British classics: Shakespeare, Dickens, Wilde, Woolf, Orwell, Keats, Tennyson
- American: Emerson, Whitman, Maya Angelou, Thoreau, Fitzgerald, Toni Morrison
- Irish, Australian, Canadian: Yeats, Beckett, Atwood`,
    proverbs: 'English proverbs, American and British anonymous sayings',
  },
};

// Angles de variété : on en tire un au hasard à chaque appel pour éviter de
// retomber sur les mêmes auteurs / citations célèbres jour après jour.
const ANGLES = [
  'Favor a poet or novelist rather than a philosopher.',
  'Favor a stoic or eastern philosophy source (Seneca, Marcus Aurelius, Lao Tzu, Rumi).',
  'Favor an athlete, explorer or artist talking about effort and perseverance.',
  'Favor a scientist, inventor or thinker.',
  'Favor an authentic proverb or a piece of traditional wisdom.',
  'Favor a woman author or historical figure.',
  'Favor a 20th or 21st century voice rather than an ancient one.',
  'Favor a lesser-known but striking quote over a world-famous one.',
  'Favor a spiritual or contemplative source.',
  'Favor a quote about time, patience and the passing of days.',
];

function buildPrompts({ theme, daysLeft, locale, avoid }) {
  const cfg = LOCALE_CONFIG[locale] ?? LOCALE_CONFIG.en;

  const urgency =
    daysLeft === 0  ? 'celebratory and triumphant — the big day is here' :
    daysLeft <= 3   ? 'very urgent and intense — the moment is imminent' :
    daysLeft <= 7   ? 'urgent and motivating — the countdown is almost over' :
    daysLeft <= 30  ? 'encouraging and close — the goal is within reach' :
    daysLeft <= 90  ? 'determined and steady — the journey is underway' :
                      'patient, visionary and inspiring — a long road ahead';

  const angle = ANGLES[Math.floor(Math.random() * ANGLES.length)];
  const seed = Math.random().toString(36).slice(2, 8);

  // Liste anti-répétition : citations récemment servies à cet utilisateur.
  const avoidList = Array.isArray(avoid)
    ? avoid.filter(q => q && q.text).slice(-25)
    : [];
  const avoidBlock = avoidList.length
    ? `\n\nDo NOT reuse any of these recently shown quotes (different text AND, ideally, a different author):\n${
        avoidList.map(q => `- "${String(q.text).slice(0, 80)}"${q.author ? ` — ${q.author}` : ''}`).join('\n')
      }`
    : '';

  const systemPrompt = `You are a specialist in literary quotes and inspirational citations.

Your task: generate ONE short quote (max 250 characters) written entirely in ${cfg.outputLang}, perfectly suited to the theme and urgency level provided.

Source priority order:
1. REAL quotes — verbatim, from ${cfg.geoLit}
2. REAL quotes — international figures (stoic philosophers, athletes, spiritual leaders, scientists)
3. ${cfg.proverbs}
4. Original quote — only if no real quote fits well; set author to "Inspired by [Author]"

Strict rules:
- Real quotes must be VERBATIM and correctly attributed. If unsure, do NOT use it.
- Never invent or paraphrase a real author's words and present them as verbatim.
- Prefer lesser-known but authentic quotes over overused clichés.
- The quote must feel emotionally resonant with the theme, not generic.
- Vary your choices strongly from one request to the next: avoid the handful of
  most famous quotes on this theme, and avoid repeating the same authors.
- ALWAYS respond with valid JSON only, no extra text: {"text": "...", "author": "..."}`;

  const userPrompt = `Theme: "${theme}"
Days remaining: ${daysLeft}
Urgency: ${urgency}
Locale: ${locale}
Variation angle for this request: ${angle}
Randomness seed (pick a fresh, non-obvious quote; do not output this): ${seed}${avoidBlock}`;

  return { systemPrompt, userPrompt };
}

// ── Fournisseurs ────────────────────────────────────────────────────────────
async function generateWithOpenAI({ systemPrompt, userPrompt }) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      max_tokens: 150,
      temperature: 1,
      top_p: 0.95,
      frequency_penalty: 0.6,
      presence_penalty: 0.6,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    let message = 'OpenAI error';
    try { message = (await response.json())?.error?.message ?? message; } catch { /* non-JSON */ }
    const err = new Error(message); err.status = response.status; throw err;
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content;
}

async function generateWithAnthropic({ systemPrompt, userPrompt }) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5',
      max_tokens: 200,
      temperature: 1,
      system: `${systemPrompt}\n\nOutput ONLY the raw JSON object, with no markdown fences and no surrounding text.`,
      messages: [
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    let message = 'Anthropic error';
    try { message = (await response.json())?.error?.message ?? message; } catch { /* non-JSON */ }
    const err = new Error(message); err.status = response.status; throw err;
  }

  const data = await response.json();
  // Concatène les blocs texte de la réponse.
  return (data?.content ?? []).filter(b => b?.type === 'text').map(b => b.text).join('').trim();
}

// ── Handler ─────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { theme, daysLeft, locale: rawLocale = 'en', avoid = [] } = req.body;

  if (!theme || daysLeft === undefined) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  // Normalise une locale régionale (fr-FR → fr) et borne aux langues connues.
  const base = String(rawLocale).split('-')[0];
  const locale = LOCALE_CONFIG[base] ? base : 'en';

  // Choix du fournisseur : QUOTE_PROVIDER explicite, sinon selon la clé présente.
  const provider = (process.env.QUOTE_PROVIDER || '').toLowerCase()
    || (process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'openai');

  if (provider === 'anthropic' && !process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }
  if (provider === 'openai' && !process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
  }

  const prompts = buildPrompts({ theme, daysLeft, locale, avoid });

  try {
    const content = provider === 'anthropic'
      ? await generateWithAnthropic(prompts)
      : await generateWithOpenAI(prompts);

    if (!content) {
      return res.status(502).json({ error: 'Empty model response' });
    }

    let quote;
    try {
      // Retire d'éventuelles balises markdown ```json … ``` avant parsing.
      const clean = content.trim().replace(/^```(?:json)?\s*|\s*```$/g, '');
      quote = JSON.parse(clean);
    } catch {
      return res.status(502).json({ error: 'Invalid JSON from model' });
    }

    if (!quote?.text || !quote?.author) {
      return res.status(502).json({ error: 'Incomplete quote format' });
    }

    quote.text   = quote.text.trim().replace(/^["«]|["»]$/g, '');
    quote.author = quote.author.trim();

    return res.status(200).json(quote);

  } catch (error) {
    console.error('[quotes] Error:', error);
    return res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
  }
}
