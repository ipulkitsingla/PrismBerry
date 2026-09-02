const axios = require('axios');

async function testApi() {
  const imdbId = 'tt0499549';
  const url = `https://v3.sg.media-imdb.com/suggestion/x/${imdbId}.json`;
  console.log("Fetching:", url);
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    if (!response.data || !response.data.d || response.data.d.length === 0) {
      console.log('Could not find IMDb data.');
      return;
    }

    const data = response.data.d[0];
    console.log("Raw Data:", JSON.stringify(data, null, 2));
    
    const title = data.l || '';
    const description = data.s ? `Starring: ${data.s}. Released: ${data.y}` : 'No description available.';
    const posterUrl = data.i ? data.i.imageUrl : '';
    const genre = data.q === 'feature' ? 'Movie' : (data.q || 'Unknown');

    console.log("Extracted:", { title, description, posterUrl, genre, imdbId });
  } catch(e) {
    console.error("Error:", e.message);
  }
}
testApi();
