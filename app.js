const express = require('express');
const path = require('path');
const axios = require('axios');
const fetch = require('node-fetch'); // เพิ่มเติมการเรียกใช้งาน node-fetch

const app = express();

let laundryData = [
  { id: 1, name: 'Laundry 1', status: 'Available' },
  { id: 2, name: 'Laundry 2', status: 'Available' },
  { id: 3, name: 'Laundry 3', status: 'Available' },
];

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/laundry', (req, res) => {
  res.json(laundryData);
});

app.post('/api/start/:id', (req, res) => {
  const { id } = req.params;
  const laundry = laundryData.find(l => l.id === parseInt(id));
  if (laundry) {
    laundry.status = 'In use';
    res.json({ message: `Laundry ${id} has started` });

    const timeoutId = setInterval(() => {
      laundry.status = 'Available';
      clearInterval(timeoutId);
    }, 300000); // 5 minutes

    startCountdown(id);
  } else {
    res.status(404).json({ error: 'Laundry not found' });
  }
});

function notifyLine(id) {
  const message = `Laundry ${id} จะซักเสร็จภายใน 1 นาที รอซักกำค่าา`;
  const lineNotifyAccessToken = 'UUI2pgYzOWTwwjomCk5gs3gsD4KsM4S5CyYgquQiS9H'; // Replace with your LINE Notify access token

  const url = 'https://notify-api.line.me/api/notify';
  const headers = {
    'Authorization': `Bearer ${lineNotifyAccessToken}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  axios.post(url, `message=${message}`, { headers: headers })
    .then(response => {
      console.log('LINE notify success:', response.data);
    })
    .catch(error => {
      console.error('LINE notify error:', error);
    });
}

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

axios.get('https://jsonplaceholder.typicode.com/posts/1')
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });

async function fetchLaundryStatus() {
  try {
    const response = await fetch('http://localhost:3000/api/laundry'); // เรียกใช้งาน fetch และ URL ใน Node.js
    const laundryData = await response.json();
    console.log('Laundry status:', laundryData);
  } catch (error) {
    console.error('Error fetching laundry status:', error);
  }
}

function startCountdown(id) {
  const targetTime = new Date().getTime() + 300000; // 5 minutes from now
  let timeoutId;

  const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = targetTime - now;

    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    console.log(`Time left for Laundry ${id}: ${minutes} minutes ${seconds} seconds`);

    if (distance < 0) {
      clearInterval(timeoutId);
      console.log('Time expired for Laundry', id);
    } else if (distance <= 60000 && distance >= 59000) { // 1 minute remaining
      notifyLine(id);
    }
  };

  timeoutId = setInterval(updateCountdown, 1000);
}

fetchLaundryStatus();
