const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const translationRoutes = require('./routes/translationRoutes');

app.use('/api/auth', authRoutes);
app.use("/api", translationRoutes); // Add the translation routes here


const ocrRoutes = require('./routes/ocrRoutes');
app.use("/api", ocrRoutes);



mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(5000, () => console.log('Server running on port 5000'));
  })
  .catch(err => console.error(err));
