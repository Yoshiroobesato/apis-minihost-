const express = require('express');
const axios = require('axios');
const { obtenerEnlacesDeYouTube } = require('./youtube');
const config = require('./config.json');

const app = express();
const port = config.port;

// Ruta /api para obtener enlaces de videos de YouTube a partir de una consulta de búsqueda
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

  const resultados = await obtenerEnlacesDeYouTube(query, duration, language, maxResults);
  res.json(resultados);
});

// Validación y extracción de ID de YouTube
const validateYouTubeUrl = (url) => {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/|.+\?v=)?([a-zA-Z0-9_-]{11})/;
  return pattern.test(url);
};

const extractYouTubeId = (url) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|.+\?v=))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : false;
};

// Ruta /download para obtener detalles de un video de YouTube
app.get('/download', async (req, res) => {
  const url = req.query.url;

  if (!url || !validateYouTubeUrl(url)) {
    return res.status(400).json({ error: 'URL de YouTube inválida.' });
  }

  const videoId = extractYouTubeId(url);
  if (!videoId) {
    return res.status(400).json({ error: 'No se pudo extraer la ID del video.' });
  }

  const apiUrl = `https://youtube-media-downloader.p.rapidapi.com/v2/video/details?videoId=${videoId}`;

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'X-RapidAPI-Host': 'youtube-media-downloader.p.rapidapi.com',
        'X-RapidAPI-Key': 'd72eda9e5cmsh81e272d21ea8f41p1146c4jsn84c83d8ab734'
      }
    });

    const data = response.data;
    const videoUrl = data?.videos?.items?.[0]?.url || '';

    res.json({ video_url: videoUrl });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data from API.' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}/`);
});
