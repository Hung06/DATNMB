// File: backend/app.js

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || 5000
const authRoutes = require('./routes/authRoutes');
const parkingLotRoutes = require('./routes/parkingLotRoutes');
const parkingSpotRoutes = require('./routes/parkingSpotRoutes');


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(express.json())
app.use('/api', authRoutes);
app.use('/api', parkingLotRoutes);
app.use('/api', parkingSpotRoutes);

app.get('/', (req, res) => {
  res.send('API server is running');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});

