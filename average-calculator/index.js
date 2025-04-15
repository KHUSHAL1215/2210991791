const express = require('express');
const axios = require('axios');

const app = express();
const port = 9876;

const WINDOW_SIZE = 10;
const TIMEOUT_MS = 500;

// my token is here
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ0NzAwMTM3LCJpYXQiOjE3NDQ2OTk4MzcsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjgyMjk0NWFhLTZlNGMtNGEwMy05MWRmLTE3YzQ2ZWU1ZjE4NyIsInN1YiI6ImtodXNoYWwxNzkxLmJlMjJAY2hpdGthcmEuZWR1LmluIn0sImVtYWlsIjoia2h1c2hhbDE3OTEuYmUyMkBjaGl0a2FyYS5lZHUuaW4iLCJuYW1lIjoia2h1c2hhbCBnb3lhbCIsInJvbGxObyI6IjIyMTA5OTE3OTEiLCJhY2Nlc3NDb2RlIjoiUHd6dWZHIiwiY2xpZW50SUQiOiI4MjI5NDVhYS02ZTRjLTRhMDMtOTFkZi0xN2M0NmVlNWYxODciLCJjbGllbnRTZWNyZXQiOiJlYlFOZFJFSmp3UFhVTUdqIn0.15AFxjh5gbsxTempdN5E01PlCWKkKhMkIQMKcrWrb3c'; // ⬅️ Replace this with the real token


// make key value pair of test-server routes
const ENDPOINT = {
  p: 'http://20.244.56.144/evaluation-service/primes',
  f: 'http://20.244.56.144/evaluation-service/fibo',
  e: 'http://20.244.56.144/evaluation-service/even',
  r: 'http://20.244.56.144/evaluation-service/rand'
};

let winstate = [];

function updateWindow(newNumbers) {
  const existing = new Set(winstate);
  const filtered = newNumbers.filter(n => !existing.has(n));
  let updated = [...winstate, ...filtered];

  if (updated.length > WINDOW_SIZE) {
    updated = updated.slice(updated.length - WINDOW_SIZE);
  }

  return updated;
}

function calculateAverage(numbers) {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return parseFloat((sum / numbers.length).toFixed(2));
}


// routes 
app.get('/numbers/:type', async (req, res) => {
  const type = req.params.type;
  const url = ENDPOINT[type];

  if (!url) {
    return res.status(400).json({ error: 'Invalid number ID' });
  }

  const prevState = [...winstate];

  try {
    const response = await axios.get(url, {
      timeout: TIMEOUT_MS,
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`
      }
    });

    const newNumbers = response.data.numbers || [];

    winstate = updateWindow(newNumbers);

    return res.json({
      windowPrevState: prevState,
      windowCurrState: winstate,
      numbers: newNumbers,
      avg: calculateAverage(winstate)
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error come in  fetching numbers or timeout exceeds' });
  }
});



//  Start the server
app.listen(port, () => {
  console.log(`Server runs at http://localhost:${port}`);
});
