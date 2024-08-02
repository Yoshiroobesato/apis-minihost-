const express = require('express');
const { obtenerEnlacesDeYouTube } = require('./youtube');

const app = express();
const port = 3000;
const apiKey = 'AIzaSyA8n0AZJZuvzeFzdBYkDJsMHa3qiZMdQ7Y';

// Ruta principal para manejar las solicitudes
app.get('/api', async (req, res) => {
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
    console.log(`Servidor escuchando en http://localhost:${port}/api`);
});
