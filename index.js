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
    likes: {
        type: Number,
        default: 0,
    },
    
});

const OER = mongoose.model('OER', oerSchema);


// Define a schema for learning objectives
const learningObjectiveSchema = new mongoose.Schema({
  ID: {
    type: Number,
    default: 0,
  },
  BloomLevel: {
    name: String,
    verbs: [String],
  },
  Skills: [Number],
  LearningContext: String,
});

const learningScenarioSchema = new mongoose.Schema({
  Context: {
    EducatorExperience: String,
    EducationContext: String,
    Dimension: String,
    LearnerExperience: String,
  },
  Objective: {
    BloomLevel: {
      name: String,
      verbs: [String],
    },
    Skills: [Number],
    LearningContext: String,
    textLearningObjective: String, 
  },
  Path: {
    Nodes: [
      {
        ID: Number,
        Title: String,
        Type: String,
      },
    ],
    Edges: [
      {
        SourceID: Number,
        TargetID: Number,
        Type: String,
      },
    ],
  },
});





function generateUniqueID() {
  // Implement your logic to generate a unique numeric ID
  // For simplicity, a random number is generated
  return Math.floor(Math.random() * 1000);
}




// Create a model based on the schema
const LearningScenarioModel = mongoose.model('LearningScenario', learningScenarioSchema);

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

  const lowercaseKeyword = keyword.toLowerCase(); // Convert keyword to lowercase

  try {
    // Try to create a new keyword; if it already exists, catch the error
    const savedKeyword = await Keyword.findOneAndUpdate(
      { value: lowercaseKeyword },
      { value: lowercaseKeyword },
      { upsert: true, new: true }
    );

    res.json({ message: 'Keyword saved successfully.', keyword: savedKeyword.value });
  } catch (error) {
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
 * /api/updateCount/{id}:
 *   put:
 *     summary: Update count of an OER and remove when count is 0
 *     description: Endpoint to update the count of an OER by its ID. If the count reaches 0, the OER is removed from the database.
 *     tags:
 *       - OERs
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the OER to be updated.
 *     responses:
 *       200:
 *         description: OER count updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: OER count updated successfully.
 *       404:
 *         description: OER not found
 *         content:
 *           application/json:
 *             example:
 *               error: OER not found.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: Internal Server Error.
 */
app.put('/api/updateCount/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const oerToUpdate = await OER.findOne({ id });

        if (oerToUpdate) {
            // Update the count
            const updatedCount = oerToUpdate.count - 1;

            // If the count is 0, remove the OER
            if (updatedCount === 0) {
                await OER.findOneAndDelete({ id });
                res.json({ message: 'OER count updated successfully. OER removed from the database.' });
            } else {
                // Update the count in the database
                await OER.updateOne({ id }, { $set: { count: updatedCount } });
                res.json({ message: 'OER count updated successfully.' });
            }
        } else {
            res.status(404).json({ error: 'OER not found.' });
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
 * /api/getCount/{id}:
 *   get:
 *     summary: Get the count of an OER by ID
 *     description: Endpoint to retrieve the count of an OER by its ID.
 *     tags:
 *       - OERs
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the OER.
 *     responses:
 *       200:
 *         description: OER count retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               count: 5
 *       404:
 *         description: OER not found
 *         content:
 *           application/json:
 *             example:
 *               error: OER not found.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: Internal Server Error.
 */
app.get('/api/getCount/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const oer = await OER.findOne({ id });

        if (oer) {
            res.json({ count: oer.count });
        } else {
          res.json({ count: 0 });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});

/**
 * @swagger
 * /api/resetAllOERCounts:
 *   put:
 *     summary: Reset counts of all OERs to zero
 *     description: Endpoint to set the count of all OERs to zero.
 *     tags:
 *       - OERs
 *     responses:
 *       200:
 *         description: Counts reset successfully
 *         content:
 *           application/json:
 *             example:
 *               message: 'Counts reset to zero successfully.'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: 'Internal Server Error.'
 */
app.put('/api/resetAllOERCounts', async (req, res) => {
  try {
      // Reset the count of all OERs to zero
      await OER.updateMany({}, { $set: { count: 0 } });
      res.json({ message: 'Counts reset to zero successfully.' });
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error.' });
  }
});


/**
 * @swagger
 * /api/likeOER/{id}:
 *   post:
 *     summary: Like an OER by ID
 *     description: Endpoint to increment the like count of an OER by its ID.
 *     tags:
 *       - OERs
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the OER.
 *     responses:
 *       200:
 *         description: OER liked successfully
 *         content:
 *           application/json:
 *             example:
 *               message: 'OER liked successfully.'
 *       404:
 *         description: OER not found
 *         content:
 *           application/json:
 *             example:
 *               error: 'OER not found.'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: 'Internal Server Error.'
 */
app.post('/api/likeOER/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const oer = await OER.findOne({ id });

      if (oer) {
          oer.likes += 1;
          await oer.save();
          res.json({ message: 'OER liked successfully.' });
      } else {
        oer.likes = 1;
        await oer.save();
        res.json({ message: 'OER liked successfully the first time.' });
      }
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error.' });
  }
});

/**
 * @swagger
 * /api/reduceLike/{id}:
 *   put:
 *     summary: Reduce likes of an OER by one
 *     description: Endpoint to reduce the likes count of an OER by one.
 *     tags:
 *       - OERs
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the OER.
 *     responses:
 *       200:
 *         description: Likes reduced successfully
 *         content:
 *           application/json:
 *             example:
 *               message: 'Like reduced successfully.'
 *       404:
 *         description: OER not found
 *         content:
 *           application/json:
 *             example:
 *               error: 'OER not found.'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: 'Internal Server Error.'
 */
app.put('/api/reduceLike/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const oer = await OER.findOne({ id });

      if (oer) {
          if (oer.likes > 0) {
              oer.likes -= 1;
              await oer.save();
              res.json({ message: 'Like reduced successfully.' });
          } else {
              res.json({ message: 'Likes count is already zero.' });
          }
      } else {
          res.status(404).json({ error: 'OER not found.' });
      }
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error.' });
  }
});


/**
 * @swagger
 * /api/getLikes/{id}:
 *   get:
 *     summary: Get the likes of an OER by ID
 *     description: Endpoint to retrieve the likes count of an OER by its ID.
 *     tags:
 *       - OERs
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the OER.
 *     responses:
 *       200:
 *         description: Likes count retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               likes: 10
 *       404:
 *         description: OER not found
 *         content:
 *           application/json:
 *             example:
 *               error: 'OER not found.'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: 'Internal Server Error.'
 */
app.get('/api/getLikes/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const oer = await OER.findOne({ id });

      if (oer) {
          res.json({ likes: oer.likes });
      } else {
          res.status(404).json({ error: 'OER not found.' });
      }
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error.' });
  }
});


/**
 * @swagger
 * /api/deleteAllOERs:
 *   delete:
 *     summary: Delete all memorized OERs
 *     description: Endpoint to delete all the OERs memorized in the database.
 *     tags:
 *       - OERs
 *     responses:
 *       200:
 *         description: All OERs deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: 'All OERs deleted successfully.'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: 'Internal Server Error.'
 */
app.delete('/api/deleteAllOERs', async (req, res) => {
  try {
      // Delete all memorized OERs
      await OER.deleteMany({});
      res.json({ message: 'All OERs deleted successfully.' });
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error.' });
  }
});

/**
 * @swagger
 * definitions:
 *   LearningScenario:
 *     type: object
 *     properties:
 *       Context:
 *         type: object
 *         properties:
 *           EducatorExperience:
 *             type: string
 *           EducationContext:
 *             type: string
 *           Dimension:
 *             type: string
 *           LearnerExperience:
 *             type: string
 *       Objective:
 *         type: object
 *         properties:
 *           BloomLevel:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               verbs:
 *                 type: array
 *                 items:
 *                   type: string
 *           Skills:
 *             type: array
 *             items:
 *               type: number
 *           LearningContext:
 *             type: string
 *           textLearningObjective:  
 *             type: string        
 *       Path:
 *         type: object
 *         properties:
 *           Nodes:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 ID:
 *                   type: number
 *                 Title:
 *                   type: string
 *                 Type:
 *                   type: string
 *           Edges:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 SourceID:
 *                   type: number
 *                 TargetID:
 *                   type: number
 *                 Type:
 *                   type: string
 */

/**
 * @swagger
 * /api/saveLearningScenario:
 *   post:
 *     summary: Save a learning scenario
 *     description: Endpoint to save a learning scenario to the database.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Learning Scenarios
 *     parameters:
 *       - in: body
 *         name: body
 *         description: JSON object containing a LearningScenario property.
 *         required: true
 *         schema:
 *           $ref: '#/definitions/LearningScenario'
 *     responses:
 *       200:
 *         description: Learning scenario saved successfully
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: Success message
 *             learningScenario:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID of the saved learning scenario
 *                 objective:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: ID of the objective within the learning scenario
 *       400:
 *         description: Bad request
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *               description: Error message
 *       500:
 *         description: Internal Server Error
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *               description: Error message
 */
app.post('/api/saveLearningScenario', async (req, res) => {
  const data = req.body;


  if (!data) {
    return res.status(400).json({ error: 'Learning scenario is required.' });
  }

  try {

    // Create a new instance of the LearningScenario model
    const learningScenario = new LearningScenarioModel(data);

    console.log("Learning Scenario: "+learningScenario);

    // Save the learning scenario
    const savedLearningScenario = await learningScenario.save();

    // Extract relevant information for the response
    const { _id, objective } = savedLearningScenario;

    res.json({
      message: 'Learning scenario saved successfully.',
      learningScenario: { _id, objective },
    });
  } catch (error) {
    console.error('Error saving Learning Scenario:', error);
    res.status(500).json({ error: 'Internal Server Error.' });
  }
});




/**
 * @swagger
 * /api/getAllLearningScenarios:
 *   get:
 *     summary: Get all learning scenarios
 *     description: Endpoint to retrieve all learning scenarios from the database.
 *     produces:
 *       - application/json
 *     tags:
 *       - Learning Scenarios
 *     responses:
 *       200:
 *         description: Successfully retrieved all learning scenarios
 *         schema:
 *           type: object
 *           properties:
 *             learningScenarios:
 *               type: array
 *               items:
 *                 $ref: "#/definitions/LearningScenario"
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
// Get all learning scenarios
app.get('/api/getAllLearningScenarios', async (req, res) => {
  try {
    // Retrieve all learning scenarios from the database
    const allLearningScenarios = await LearningScenarioModel.find();

    res.json({ learningScenarios: allLearningScenarios });
  } catch (error) {
    console.error('Error getting all Learning Scenarios:', error);
    res.status(500).json({ error: 'Internal Server Error.' });
  }
});

/**
 * @swagger
 * /api/deleteAllLearningScenarios:
 *   delete:
 *     summary: Delete all learning scenarios
 *     description: Delete all learning scenarios from the database.
 *     produces:
 *       - application/json
 *     tags:
 *       - Learning Scenarios
 *     responses:
 *       200:
 *         description: Successful operation
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: Success message
 *           examples:
 *             application/json:
 *               message: All learning scenarios deleted successfully.
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
app.delete('/api/deleteAllLearningScenarios', async (req, res) => {
  try {
    // Delete all learning scenarios from the database
    await LearningScenarioModel.deleteMany({});

    res.json({ message: 'All learning scenarios deleted successfully.' });
  } catch (error) {
    console.error('Error deleting all learning scenarios:', error);
    res.status(500).json({ error: 'Internal Server Error.' });
  }
});



/**
 * @swagger
 * definitions:
 *   LearningObjective:
 *     type: object
 *     properties:
 *       ID:
 *         type: number
 *       BloomLevel:
 *         type: object
 *         properties:
 *           name:
 *             type: string
 *           verbs:
 *             type: array
 *             items:
 *               type: string
 *       Skills:
 *         type: array
 *         items:
 *           type: number
 *       LearningContext:
 *         type: string
 *     example:
 *       ID: 1
 *       BloomLevel:
 *         name: "Analyzing"
 *         verbs: ["understand", "analyze"]
 *       Skills: [1, 2, 3]
 *       LearningContext: "Physics"
 */

/**
 * @swagger
 * /api/getAllObjectives:
 *   get:
 *     summary: Get all learning objectives
 *     description: Retrieve all learning objectives from the learning scenarios.
 *     produces:
 *       - application/json
 *     tags:
 *       - Learning Objectives
 *     responses:
 *       200:
 *         description: Successful operation
 *         schema:
 *           type: object
 *           properties:
 *             objectives:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/LearningObjective'
 *         examples:
 *           application/json:
 *             objectives:
 *               - ID: 1
 *                 BloomLevel:
 *                   name: "Analyzing"
 *                   verbs: ["understand", "analyze"]
 *                 Skills: [1, 2, 3]
 *                 LearningContext: "Physics"
 *               - ID: 2
 *                 BloomLevel:
 *                   name: "Evaluating"
 *                   verbs: ["evaluate", "assess"]
 *                 Skills: [4, 5, 6]
 *                 LearningContext: "Chemistry"
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
app.get('/api/getAllObjectives', async (req, res) => {
  try {
    // Retrieve all objectives from the database
    const objectives = await LearningScenarioModel.find({}, 'Objective');

    res.json({ objectives });
  } catch (error) {
    console.error('Error retrieving objectives:', error);
    res.status(500).json({ error: 'Internal Server Error.' });
  }
});


/**
 * @swagger
 * /api/getObjectiveById/{objectiveId}:
 *   get:
 *     summary: Get a learning objective by ID
 *     description: Retrieve a learning objective from the learning scenarios by its ID.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: objectiveId
 *         in: path
 *         description: ID of the learning objective to retrieve
 *         required: true
 *         type: string
 *     tags:
 *       - Learning Objectives
 *     responses:
 *       200:
 *         description: Successful operation
 *         schema:
 *           $ref: '#/definitions/LearningObjective'
 *         examples:
 *           application/json:
 *             _id: "ObjectId"
 *             BloomLevel:
 *               name: "Analyzing"
 *               verbs: ["understand", "analyze"]
 *             Skills: [1, 2, 3]
 *             LearningContext: "Physics"
 *       404:
 *         description: Learning objective not found
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *               description: Error message
 *           examples:
 *             application/json:
 *               error: Learning objective not found.
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
app.get('/api/getObjectiveById/:objectiveId', async (req, res) => {
  const { objectiveId } = req.params;

  try {
    // Retrieve the objective by ID from the database
    const objective = await LearningScenarioModel.findOne(
      { 'Objective._id': objectiveId },
      'Objective'
    );

    if (!objective) {
      return res.status(404).json({ error: 'Learning objective not found.' });
    }

    res.json(objective.Objective);
  } catch (error) {
    console.error('Error retrieving objective by ID:', error);
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
