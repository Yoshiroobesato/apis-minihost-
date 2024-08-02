const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;
const apiKey = 'AIzaSyA8n0AZJZuvzeFzdBYkDJsMHa3qiZMdQ7Y';

// Función para obtener enlaces de videos de YouTube a partir de una consulta de búsqueda
async function obtenerEnlacesDeYouTube(query, duration, language, maxResults, apiKey) {
    let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${encodeURIComponent(maxResults)}&videoDuration=${encodeURIComponent(duration)}&key=${apiKey}`;

    if (language) {
        url += `&relevanceLanguage=${encodeURIComponent(language)}`;
    }

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (data.error) {
            return { error: `Error: ${data.error.message}` };
        }

        const videoLinks = data.items.map(item => ({
            title: item.snippet.title,
            link: `https://www.youtube.com/watch?v=${item.id.videoId}`
        }));

        return videoLinks;
    } catch (error) {
        return { error: `Error: ${error.message}` };
    }
}

// Ruta principal para manejar las solicitudes
app.get('/', async (req, res) => {
    const query = req.query.catalogo || '';
    const duration = req.query.time || 'any';
    const language = req.query.idioma || '';
    const maxResults = req.query.videos ? parseInt(req.query.videos) : 10;

    if (!query) {
        return res.status(400).json({ error: 'Falta el parámetro catalogo' });
    }

    if (!['any', 'short', 'medium', 'long'].includes(duration)) {
        return res.status(400).json({ error: 'El parámetro time debe ser uno de los siguientes valores: any, short, medium, long' });
    }

    if (maxResults > 200) {
        return res.status(400).json({ error: 'Demasiados resultados solicitados. El máximo es 200.' });
    }

    const resultados = await obtenerEnlacesDeYouTube(query, duration, language, maxResults, apiKey);
    res.json(resultados);
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
