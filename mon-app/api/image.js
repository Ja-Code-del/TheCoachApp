export default async function handler(req, res) {
  // Sécurité : on n'accepte que les GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { theme } = req.query;

  if (!theme) {
    return res.status(400).json({ error: 'Paramètre theme manquant' });
  }

  if (!process.env.UNSPLASH_ACCESS_KEY) {
    return res.status(500).json({ error: 'UNSPLASH_ACCESS_KEY manquante côté serveur' });
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(theme)}&orientation=portrait&client_id=${process.env.UNSPLASH_ACCESS_KEY}`
    );

    if (!response.ok) {
      let message = 'Unsplash error';
      try {
        const error = await response.json();
        message = error?.errors?.[0] || error?.error || message;
      } catch {
        // Réponse non JSON, on garde le message générique.
      }
      return res.status(response.status).json({ error: message });
    }

    const data = await response.json();

    // On ne renvoie que ce dont le front a besoin
    return res.status(200).json({
      url: data.urls.regular,
      photographer: data.user.name,
      photographerUrl: data.user.links.html,
    });

  } catch (error) {
    console.error('Image API error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
