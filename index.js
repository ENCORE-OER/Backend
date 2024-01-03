const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;



  
 // Connect to MongoDB
mongoose.connect(process.env.ATLAS_URI);




// Connect to MongoDB
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

// Define a schema for OERs with count and description
const oerSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    count: {
        type: Number,
        default: 1,
    },
});

const OER = mongoose.model('OER', oerSchema);


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
 * /api/getAllKeywords:
 *   get:
 *     summary: Get all keywords
 *     tags:
 *       - Keywords
 *     description: Endpoint to retrieve all keywords from the database.
 *     responses:
 *       200:
 *         description: Keywords retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               keywords: ['keyword1', 'keyword2', 'keyword3']
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: Internal Server Error.
 */
app.get('/api/getAllKeywords', async (req, res) => {
    try {
      // Retrieve all documents from the Keyword collection
      const keywords = await Keyword.find({}, 'value');
  
      // Extract the values and send them in the response
      const keywordValues = keywords.map((kw) => kw.value);
      res.json({ keywords: keywordValues });
    } catch (error) {
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


/**
 * @swagger
 * /api/saveOER:
 *   post:
 *     summary: Save an OER
 *     description: Endpoint to save an OER selected to the database.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - OERs
 *     parameters:
 *       - in: body
 *         name: body
 *         description: JSON object containing an OER property.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             title: 
 *               type: string
 *             description:
 *               type: string
 *     responses:
 *       200:
 *         description: OER saved successfully
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: Success message
 *             OER:
 *               type: string
 *               description: The saved OER value
 *         examples:
 *           application/json:
 *             message: OER saved successfully.
 *             keyword: example_oer
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
 *             error: OER is required.
 *       409:
 *         description: OER already exists
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *               description: Error message
 *         examples:
 *           application/json:
 *             error: OER already exists.
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
app.post('/api/saveOER', async (req, res) => {
    const { id, title, description } = req.body;

    if (!id || !title) {
        return res.status(400).json({ error: 'ID and title are required.' });
    }

    try {
        // Check if the OER already exists
        let existingOER = await OER.findOne({ id });

        if (existingOER) {
            // If the OER already exists, increment the count
            existingOER.count += 1;
            await existingOER.save();
            res.json({ message: 'OER updated successfully.', oer: existingOER });
        } else {
            // If the OER does not exist, create a new one
            const savedOER = await OER.create({ id, title, description });
            res.json({ message: 'OER saved successfully.', oer: savedOER });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});

/**
 * @swagger
 * /api/getAllOERs:
 *   get:
 *     summary: Get all OERs
 *     description: Endpoint to retrieve all saved OERs from the database.
 *     tags:
 *       - OERs
 *     responses:
 *       200:
 *         description: OERs retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               oers: [{ id: "uniqueId1", title: "OER Title 1", description: "OER Description 1", count: 3 },
 *                      { id: "uniqueId2", title: "OER Title 2", description: "OER Description 2", count: 1 }]
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: Internal Server Error.
 */
app.get('/api/getAllOERs', async (req, res) => {
    try {
        const allOERs = await OER.find({});
        res.json({ oers: allOERs });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});

/**
 * @swagger
 * /api/getMaxCountOERs:
 *   get:
 *     summary: Get OERs with max count
 *     description: Endpoint to retrieve OERs with the maximum count from the database.
 *     tags:
 *       - OERs
 *     responses:
 *       200:
 *         description: OERs with max count retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               maxCountOERs: [{ id: "uniqueId1", title: "OER Title 1", description: "OER Description 1", count: 3 },
 *                             { id: "uniqueId3", title: "OER Title 3", description: "OER Description 3", count: 3 }]
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: Internal Server Error.
 */
app.get('/api/getMaxCountOERs', async (req, res) => {
    try {
        const maxCountOERs = await OER.find({}).sort({ count: -1 }).limit(2); // Adjust the limit as per your requirement
        res.json({ maxCountOERs });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});



/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Get health status
 *     description: Endpoint to verify health status of the server.
 *     tags:
 *       - System
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Health status
 */
app.get('/api/health', async (req, res) => {
  res.status(200).json();
});
  

// Start the server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
