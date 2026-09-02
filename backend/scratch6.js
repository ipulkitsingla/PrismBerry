const axios = require('axios');
async function testOMDB() {
  try {
    const res = await axios.get('https://www.omdbapi.com/?apikey=thewdb&i=tt0499549');
    console.log(res.data);
  } catch(e) { console.error(e.message); }
}
testOMDB();
