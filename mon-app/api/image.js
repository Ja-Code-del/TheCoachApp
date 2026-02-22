export default async function handler(req, res) {
  // Sécurité : on n'accepte que les GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { theme } = req.query;

  if (!theme) {
    return res.status(400).json({ error: 'Paramètre theme manquant' });
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(theme)}&orientation=portrait&client_id=${process.env.UNSPLASH_ACCESS_KEY}`
    );

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.errors?.[0] || 'Unsplash error' });
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