const axios = require('axios');

async function testApi() {
  try {
    const res = await axios.get('https://v3.sg.media-imdb.com/suggestion/x/tt4154796.json');
    console.log(res.data.d[0]);
  } catch(e) {
    console.error(e.message);
  }
}
testApi();
