export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { theme, daysLeft, locale = 'en' } = req.body;

  if (!theme || daysLeft === undefined) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
  }

  // ── Config par locale ────────────────────────────────────────────────────
  // outputLang  : langue de la citation générée
  // geoLit      : vivier littéraire prioritaire lié à la zone géo
  // proverbs    : tradition orale/proverbiale locale pour les citations anonymes
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

  // Fallback anglais si locale non supportée
  const cfg = LOCALE_CONFIG[locale] ?? LOCALE_CONFIG.en;

  // ── Urgence selon les jours restants ─────────────────────────────────────
  const urgency =
    daysLeft === 0  ? 'celebratory and triumphant — the big day is here' :
    daysLeft <= 3   ? 'very urgent and intense — the moment is imminent' :
    daysLeft <= 7   ? 'urgent and motivating — the countdown is almost over' :
    daysLeft <= 30  ? 'encouraging and close — the goal is within reach' :
    daysLeft <= 90  ? 'determined and steady — the journey is underway' :
                      'patient, visionary and inspiring — a long road ahead';

  // ── Prompt ────────────────────────────────────────────────────────────────
  // On guide le modèle avec une priorité explicite sur les sources
  // pour éviter les citations génériques ou fausses attributions
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
- ALWAYS respond with valid JSON only, no extra text: {"text": "...", "author": "..."}`;

  const userPrompt = `Theme: "${theme}"
Days remaining: ${daysLeft}
Urgency: ${urgency}
Locale: ${locale}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 150,
        temperature: 0.85, // Un peu de créativité sans dériver
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      let message = 'OpenAI error';
      try {
        const err = await response.json();
        message = err?.error?.message ?? message;
      } catch { /* réponse non-JSON */ }
      return res.status(response.status).json({ error: message });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(502).json({ error: 'Empty OpenAI response' });
    }

    let quote;
    try {
      quote = JSON.parse(content);
    } catch {
      return res.status(502).json({ error: 'Invalid JSON from OpenAI' });
    }

    if (!quote?.text || !quote?.author) {
      return res.status(502).json({ error: 'Incomplete quote format' });
    }

    // Nettoyage : trim et suppression des guillemets externes si le modèle en ajoute
    quote.text   = quote.text.trim().replace(/^["«]|["»]$/g, '');
    quote.author = quote.author.trim();

    return res.status(200).json(quote);

  } catch (error) {
    console.error('[quotes] Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}