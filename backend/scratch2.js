const axios = require('axios');

async function testApi() {
  try {
    const response = await axios.get('https://search.imdbot.workers.dev/?tt=tt1375666');
    console.log(response.data);
  } catch (err) {
    console.error(err.message);
  }
}

testApi();
