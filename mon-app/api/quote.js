export default async function handler(req, res) {
  // Sécurité : on n'accepte que les POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { theme, daysLeft } = req.body;

  if (!theme || daysLeft === undefined) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY manquante côté serveur' });
  }

  const urgency =
    daysLeft <= 7 ? "urgente et intense" :
    daysLeft <= 30 ? "motivante et proche" :
    "patiente et inspirante";

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // La clé reste côté serveur, jamais exposée au client
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 120,
        response_format: { type: "json_object" },
        messages: [
          {
            role: 'system',
            content: `Tu es un assistant qui génère des citations célèbres et courtes au format JSON. 
            Structure : {"text": "...", "author": "..."}`
          },
          {
            role: 'user',
            content: `Thème : "${theme}". Jours restants : ${daysLeft}. Tonalité : ${urgency}.`
          },
        ],
      }),
    });

    if (!response.ok) {
      let message = 'OpenAI error';
      try {
        const error = await response.json();
        message = error?.error?.message || error?.message || message;
      } catch {
        // Réponse non JSON, on garde le message générique.
      }
      return res.status(response.status).json({ error: message });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(502).json({ error: 'Réponse OpenAI incomplète' });
    }

    const quote = JSON.parse(content);
    if (!quote?.text) {
      return res.status(502).json({ error: 'Format JSON de citation invalide' });
    }

    return res.status(200).json(quote);

  } catch (error) {
    console.error('Quote API error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
