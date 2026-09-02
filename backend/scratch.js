const axios = require('axios');
const cheerio = require('cheerio');

async function testScrape() {
  const response = await axios.get('https://www.imdb.com/title/tt1375666/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.5'
    }
  });
  const $ = cheerio.load(response.data);
  let title = $('h1').text().trim();
  
  // Alternative: JSON-LD
  let jsonData = {};
  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      const data = JSON.parse($(el).html());
      if (data['@type'] === 'Movie' || data['@type'] === 'TVSeries') {
        jsonData = data;
      }
    } catch (e) {}
  });

  console.log("Title from H1:", title);
  console.log("Data from JSON-LD:", jsonData.name);
  console.log("Poster:", jsonData.image);
  console.log("Description:", jsonData.description);
  console.log("Genre:", jsonData.genre);
}

testScrape();
