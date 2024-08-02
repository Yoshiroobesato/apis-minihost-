const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

// Función para validar la URL de YouTube
function validateYouTubeUrl(url) {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/|.+\?v=)?([a-zA-Z0-9_-]{11})/;
    return pattern.test(url);
}

// Función para extraer la ID del video de YouTube
function extractYouTubeId(url) {
    let match = url.match(/youtu\.be\/([^\&\?\/]+)/);
    if (match) {
        return match[1];
    }

    match = url.match(/youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)([^\&\?\/]+)/);
    if (match) {
        return match[1];
    }

    return false;
}

// Ruta principal para manejar las solicitudes en /api
app.get('/api', async (req, res) => {
    const url = req.query.url;

    if (!url || !validateYouTubeUrl(url)) {
        return res.status(400).json({ error: 'URL de YouTube inválida.' });
    }

    const videoId = extractYouTubeId(url);
    if (!videoId) {
        return res.status(400).json({ error: 'No se pudo extraer la ID del video.' });
    }

    const apiUrl = `https://youtube-media-downloader.p.rapidapi.com/v2/video/details?videoId=${videoId}`;

    const options = {
        method: 'GET',
        url: apiUrl,
        headers: {
            'X-RapidAPI-Host': 'youtube-media-downloader.p.rapidapi.com',
            'X-RapidAPI-Key': 'd72eda9e5cmsh81e272d21ea8f41p1146c4jsn84c83d8ab734'
        }
    };

    try {
        const response = await axios.request(options);
        const data = response.data;
        const videoUrl = data.videos && data.videos.items && data.videos.items[0] && data.videos.items[0].url || '';
        res.json({ video_url: videoUrl });
    } catch (error) {
        res.status(500).json({ error: 'Error: ' + error.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}/api`);
});
