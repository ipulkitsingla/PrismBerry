const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testBackend() {
  try {
    const token = jwt.sign(
      { user: { id: 'dummy_id', role: 'admin' } },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    const res = await axios.get('http://localhost:5000/api/movies/imdb/scrape?title=Avatar', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Backend response:", res.data);
  } catch(e) {
    console.error("Backend error:", e.response ? e.response.data : e.message);
  }
}
testBackend();
