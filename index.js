const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const { bool } = require("jshint/src/options");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;
const cors = require('cors');




// DB connection
const uri = process.env.ATLAS_URI;


mongoose.connect(uri);

const connection = mongoose.connection;

connection.once('open', () => {

    console.log("Connected Database Successfully");
});


// Enable CORS for all routes
app.use(cors());


// Define a simple schema for keywords
const keywordSchema = new mongoose.Schema({
    value: {
      type: String,
      unique: true, // Ensures uniqueness
      required: true,
    },
  });
  
  const Keyword = mongoose.model('Keyword', keywordSchema);
  
  // Middleware to parse JSON requests
  app.use(bodyParser.json());
  
  // API endpoint to save a keyword
  app.post('/api/saveKeyword', async (req, res) => {
    const { keyword } = req.body;
  
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required.' });
    }
  
    try {
      // Try to create a new keyword; if it already exists, catch the error
      const savedKeyword = await Keyword.create({ value: keyword });
      res.json({ message: 'Keyword saved successfully.', keyword: savedKeyword.value });
    } catch (error) {
      // Handle duplicate key error (keyword already exists)
      if (error.code === 11000) {
        return res.status(409).json({ error: 'Keyword already exists.' });
      }
  
      // Handle other errors
      res.status(500).json({ error: 'Internal Server Error.' });
    }
  });
  
  // API endpoint to retrieve all saved keywords
  app.get('/api/getKeywords', async (req, res) => {
    try {
      const keywords = await Keyword.find({}, 'value');
      res.json({ keywords: keywords.map((kw) => kw.value) });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error.' });
    }
  });


// Start the server
app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on port ${port}`);
});
