const axios = require('axios');

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

module.exports = { obtenerEnlacesDeYouTube };
