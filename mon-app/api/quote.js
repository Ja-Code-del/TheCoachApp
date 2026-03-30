const PROMPTS = {
  fr: {
    system: `Tu es un assistant spécialisé dans les citations inspirantes issues de la littérature, de la philosophie et des textes bibliques.
Tu dois générer une citation courte (maximum 300 caractères).
Si la citation est authentique et célèbre, elle doit être exacte et attribuée correctement.
Sinon, crée une citation originale inspirée du style d’un grand auteur et indique "Inspiration : Nom de l’auteur".
Réponds uniquement au format JSON.
Structure : {"text": "...", "author": "..."}
Adapte la citation au fait que le temps est compté si les jours restants sont faibles.`,
    user: (theme, daysLeft, urgency) =>
      `Thème : "${theme}". Jours restants : ${daysLeft}. Tonalité : ${urgency}.`,
    urgency: (daysLeft) =>
      daysLeft <= 7 ? "urgente et intense" :
      daysLeft <= 30 ? "motivante et proche" :
      "patiente et inspirante",
  },
  en: {
    system: `You are an assistant specialized in inspiring quotes from literature, philosophy, and biblical texts.
You must generate a short quote (maximum 300 characters).
If the quote is authentic and famous, it must be exact and correctly attributed.
Otherwise, create an original quote inspired by the style of a great author and indicate "Inspired by: Author’s name".
Respond only in JSON format.
Structure: {"text": "...", "author": "..."}
Adapt the quote to the sense of urgency if the remaining days are few.`,
    user: (theme, daysLeft, urgency) =>
      `Theme: "${theme}". Days left: ${daysLeft}. Tone: ${urgency}.`,
    urgency: (daysLeft) =>
      daysLeft <= 7 ? "urgent and intense" :
      daysLeft <= 30 ? "motivating and close" :
      "patient and inspiring",
  },
};

export default async function handler(req, res) {
  if (req.method !== ‘POST’) {
    return res.status(405).json({ error: ‘Method not allowed’ });
  }

  const { theme, daysLeft, lang } = req.body;

  if (!theme || daysLeft === undefined) {
    return res.status(400).json({ error: ‘Missing parameters’ });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: ‘OPENAI_API_KEY missing on server’ });
  }

  const prompts = PROMPTS[lang] || PROMPTS.fr;
  const urgency = prompts.urgency(daysLeft);

  try {
    const response = await fetch(‘https://api.openai.com/v1/chat/completions’, {
      method: ‘POST’,
      headers: {
        ‘Content-Type’: ‘application/json’,
        ‘Authorization’: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: ‘gpt-4o-mini’,
        max_tokens: 120,
        response_format: { type: "json_object" },
        messages: [
          { role: ‘system’, content: prompts.system },
          { role: ‘user’, content: prompts.user(theme, daysLeft, urgency) },
        ],
      }),
    });

    if (!response.ok) {
      let message = ‘OpenAI error’;
      try {
        const error = await response.json();
        message = error?.error?.message || error?.message || message;
      } catch {
        // Non-JSON response, keep generic message.
      }
      return res.status(response.status).json({ error: message });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(502).json({ error: ‘Incomplete OpenAI response’ });
    }

    const quote = JSON.parse(content);
    if (!quote?.text) {
      return res.status(502).json({ error: ‘Invalid quote JSON format’ });
    }

    return res.status(200).json(quote);

  } catch (error) {
    console.error(‘Quote API error:’, error);
    return res.status(500).json({ error: ‘Server error’ });
  }
}
