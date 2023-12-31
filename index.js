const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Update the MongoDB connection options
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  

// Connect to MongoDB
mongoose.connect(process.env.ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
  console.log('Connected to MongoDB');
});

// Enable CORS for all routes
app.use(require('cors')());

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




const options = {
    swaggerDefinition: {
      info: {
        title: 'ENCORE DATA-LOG API',
        version: '1.0.0',
        description: 'API documentation for the ENCORE APIs to save DATA',
      },
      basePath: '/',
    },
    apis: ['index.js'], // replace with the path to your main application file
    tags: [
      {
        name: 'Keywords', // Change this to the desired name for the group
        description: 'APIs related to managing keywords',
      },
    ],
  };
  
  const swaggerSpec = swaggerJSDoc(options);

// Serve Swagger documentation
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /api/saveKeyword:
 *   post:
 *     summary: Save a keyword
 *     description: Endpoint to save a keyword to the database.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Keywords
 *     parameters:
 *       - in: body
 *         name: body
 *         description: JSON object containing a keyword property.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             keyword:
 *               type: string
 *     responses:
 *       200:
 *         description: Keyword saved successfully
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: Success message
 *             keyword:
 *               type: string
 *               description: The saved keyword value
 *         examples:
 *           application/json:
 *             message: Keyword saved successfully.
 *             keyword: example_keyword
 *       400:
 *         description: Bad request
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *               description: Error message
 *         examples:
 *           application/json:
 *             error: Keyword is required.
 *       409:
 *         description: Keyword already exists
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *               description: Error message
 *         examples:
 *           application/json:
 *             error: Keyword already exists.
 *       500:
 *         description: Internal Server Error
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *               description: Error message
 *         examples:
 *           application/json:
 *             error: Internal Server Error.
 */
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

/**
 * @swagger
 * /api/deleteAllKeywords:
 *   post:
 *     summary: Delete all keywords
 *     description: Endpoint to delete all keywords from the database.
 *     tags:
 *       - Keywords
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: All keywords deleted successfully
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: Success message
 *         examples:
 *           application/json:
 *             message: All keywords deleted successfully.
 *       500:
 *         description: Internal Server Error
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *               description: Error message
 *         examples:
 *           application/json:
 *             error: Internal Server Error.
 */
app.post('/api/deleteAllKeywords', async (req, res) => {
    try {
      // Remove all documents from the Keyword collection
      await Keyword.deleteMany({});
      res.json({ message: 'All keywords deleted successfully.' });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error.' });
    }
  });
  

// Start the server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
