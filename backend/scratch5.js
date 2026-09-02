const axios = require('axios');

async function testApi() {
  const imdbId = 'tt0499549';
  const firstLetter = imdbId.charAt(0).toLowerCase();
  const url1 = `https://v3.sg.media-imdb.com/suggestion/x/${imdbId}.json`;
  const url2 = `https://v3.sg.media-imdb.com/suggestion/${firstLetter}/${imdbId}.json`;
  
  try {
    const r1 = await axios.get(url1);
    console.log("URL1 'x':", r1.data.d ? r1.data.d.length : 0, "results");
  } catch(e) { console.error("URL1 error", e.message); }

  try {
    const r2 = await axios.get(url2);
    console.log("URL2 't':", r2.data.d ? r2.data.d.length : 0, "results");
  } catch(e) { console.error("URL2 error", e.message); }
}
testApi();
