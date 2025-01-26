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




// Create a model based on the schema
const LearningScenarioModel = mongoose.model('LearningScenario', learningScenarioSchema);

// Middleware to parse JSON requests
app.use(bodyParser.json());


const learningPathSchema = new mongoose.Schema({
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
    SkillsConcepts: [Number],
    LearningContext: String,
    TextLearningObjectives: [String],
  },
  Path: {
    TitleLearningPath: String,
    MacroSubject: String,
    LessonPlan: [
      {
        ActivityTitle: String,
        TypeOfAssignment: String,
        TypeOfActivity: String,
        Time: Number,
        Description: String,
        Topic: String,
        Content: {
          OERs: [
            {
              id_oer: Number,
              Title: String,
            },
          ],
          Files: [
            {
              Name: String,
              File: String,
            },
          ],
        },
        Compulsory: Boolean,
        Conditions: {
          Pass: [String],
          Fail: [String],
        },
      },
    ],
    Graph: {
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
  },
}, { timestamps: true }); // This adds createdAt and updatedAt fields

const LearningPath = mongoose.model('LearningPath', learningPathSchema);



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

  const lowercaseKeyword = keyword.toLowerCase();
  const timestamp = new Date().toISOString(); // Current timestamp

  try {
    // Update or insert the keyword, updating timestamps
    const savedKeyword = await Keyword.findOneAndUpdate(
      { value: lowercaseKeyword },
      {
        value: lowercaseKeyword,
        $setOnInsert: { createdAt: timestamp }, // Set createdAt only when inserting
        lastUpdated: timestamp, // Update lastUpdated on every save
      },
      { upsert: true, new: true }
    );

    console.log(`[${timestamp}] Keyword saved: ${lowercaseKeyword}`); // Log the save operation
    res.json({
      message: 'Keyword saved successfully.',
      keyword: savedKeyword.value,
      lastUpdated: savedKeyword.lastUpdated,
    });
  } catch (error) {
    console.error('Error saving keyword:', error);
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

  const timestamp = new Date().toISOString(); // Add timestamp

  try {
    let existingOER = await OER.findOne({ id });

    if (existingOER) {
      existingOER.count += 1;
      existingOER.lastUpdated = timestamp; // Update timestamp
      await existingOER.save();
      console.log(`[${timestamp}] OER updated: ${id}`); // Log timestamp
      res.json({ message: 'OER updated successfully.', oer: existingOER });
    } else {
      const savedOER = await OER.create({ id, title, description, createdAt: timestamp });
      console.log(`[${timestamp}] OER created: ${id}`); // Log timestamp
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
    // Find the OER by its ID
    const oer = await OER.findOne({ id });

    if (oer) {
      // If OER exists, return the likes count
      res.json({ likes: oer.likes });
    } else {
      // If OER does not exist, skip further processing and return default response
      res.status(404).json({ message: `No OER found with ID: ${id}. Skipping operation.` });
    }
  } catch (error) {
    // Handle server errors
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

  const timestamp = new Date().toISOString(); // Add timestamp

  try {
    const learningScenario = new LearningScenarioModel({ ...data, createdAt: timestamp });
    const savedLearningScenario = await learningScenario.save();

    console.log(`[${timestamp}] Learning scenario saved`); // Log timestamp
    res.json({ message: 'Learning scenario saved successfully.', learningScenario: savedLearningScenario });
  } catch (error) {
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
 *       textLearningObjective:
 *         type: string
 */

/**
 * @swagger
 * /api/updateLearningObjective/{id}:
 *   put:
 *     summary: Update learning objective of a learning scenario
 *     description: Endpoint to update the learning objective of a learning scenario in the database.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Learning Scenarios
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the learning scenario to update.
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: body
 *         description: Request body for updating the learning objective.
 *         required: true
 *         schema:
 *           $ref: '#/definitions/LearningObjective'
 *     responses:
 *       200:
 *         description: Learning objective updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 updatedLearningObjective:
 *                   $ref: '#/definitions/LearningObjective'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       404:
 *         description: Learning scenario not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

app.put('/api/updateLearningObjective/:id', async (req, res) => {
  const { id } = req.params;
  
  const { BloomLevel, Skills, LearningContext, textLearningObjective } = req.body;

  try {
    // Find the learning scenario by ID
    const learningScenario = await LearningScenarioModel.findById(id);

    if (!learningScenario) {
      return res.status(404).json({ error: 'Learning scenario not found.' });
    }

    // Update the learning objective
    learningScenario.Objective = { BloomLevel, Skills, LearningContext, textLearningObjective };

    // Save the updated learning scenario
    await learningScenario.save();

    res.json({
      message: 'Learning objective updated successfully.',
      updatedLearningObjective: { BloomLevel, Skills, LearningContext, textLearningObjective },
    });
  } catch (error) {
    console.error('Error updating learning objective:', error);
    res.status(500).json({ error: 'Internal Server Error.' });
  }
});


/**
 * @swagger
 * definitions:
 *   LearningPath:
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
 *           SkillsConcepts:
 *             type: array
 *             items:
 *               type: number
 *           LearningContext:
 *             type: string
 *           TextLearningObjectives:
 *             type: array
 *             items:
 *               type: string
 *       Path:
 *         type: object
 *         properties:
 *           TitleLearningPath:
 *             type: string
 *           MacroSubject:
 *             type: string
 *           LessonPlan:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 ActivityTitle:
 *                   type: string
 *                 TypeOfAssignment:
 *                   type: string
 *                 TypeOfActivity:
 *                   type: string
 *                 Time:
 *                   type: number
 *                 Description:
 *                   type: string
 *                 Topic:
 *                   type: string
 *                 Content:
 *                   type: object
 *                   properties:
 *                     OERs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_oer:
 *                             type: number
 *                           Title:
 *                             type: string
 *                     Files:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           Name:
 *                             type: string
 *                           File:
 *                             type: string
 *                             format: binary
 *                 Compulsory:
 *                   type: boolean
 *                 Conditions:
 *                   type: object
 *                   properties:
 *                     Pass:
 *                       type: array
 *                       items:
 *                         type: string
 *                     Fail:
 *                       type: array
 *                       items:
 *                         type: string
 *           Graph:
 *             type: object
 *             properties:
 *               Nodes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     ID:
 *                       type: number
 *                     Title:
 *                       type: string
 *                     Type:
 *                       type: string
 *               Edges:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     SourceID:
 *                       type: number
 *                     TargetID:
 *                       type: number
 *                     Type:
 *                       type: string
 */

/**
 * @swagger
 * /api/saveLearningPath:
 *   post:
 *     summary: Save a learning path
 *     description: Endpoint to save a learning path to the database.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Learning Paths
 *     parameters:
 *       - in: body
 *         name: body
 *         description: JSON object containing a LearningPath property.
 *         required: true
 *         schema:
 *           $ref: '#/definitions/LearningPath'
 *     responses:
 *       200:
 *         description: Learning path saved successfully
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: Success message
 *             learningPath:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID of the saved learning path
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

app.post('/api/saveLearningPath', async (req, res) => {
  const data = req.body;

  if (!data) {
    return res.status(400).json({ error: 'Learning path data is required.' });
  }

  const timestamp = new Date().toISOString(); // Add timestamp

  try {
    const learningPath = new LearningPath({ ...data, createdAt: timestamp });
    const savedLearningPath = await learningPath.save();

    console.log(`[${timestamp}] Learning path saved`); // Log timestamp
    res.json({
      message: 'Learning path saved successfully.',
      learningPath: { _id: savedLearningPath._id },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error.' });
  }
});



/**
 * @swagger
 * /api/updateLearningPath/{id}:
 *   put:
 *     summary: Update an existing learning path
 *     description: Endpoint to update an existing learning path in the database.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Learning Paths
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the learning path to update
 *         required: true
 *         type: string
 *       - in: body
 *         name: body
 *         description: JSON object containing updated LearningPath properties.
 *         required: true
 *         schema:
 *           $ref: '#/definitions/LearningPath'
 *     responses:
 *       200:
 *         description: Learning path updated successfully
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: Success message
 *             learningPath:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID of the updated learning path
 *       400:
 *         description: Bad request
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *               description: Error message
 *       404:
 *         description: Learning path not found
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
app.put('/api/updateLearningPath/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  if (!updatedData) {
    return res.status(400).json({ error: 'Updated learning path data is required.' });
  }

  try {
    const updatedLearningPath = await LearningPath.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedLearningPath) {
      return res.status(404).json({ error: 'Learning path not found.' });
    }

    res.json({
      message: 'Learning path updated successfully.',
      learningPath: { _id: updatedLearningPath._id },
    });
  } catch (error) {
    console.error('Error updating learning path:', error);
    res.status(500).json({ error: 'Internal Server Error.' });
  }
});



/**
 * @swagger
 * /api/getAllLearningPaths:
 *   get:
 *     summary: Get all learning paths
 *     description: Endpoint to retrieve all learning paths from the database.
 *     produces:
 *       - application/json
 *     tags:
 *       - Learning Paths
 *     responses:
 *       200:
 *         description: Successfully retrieved all learning paths
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               Context:
 *                 type: object
 *                 properties:
 *                   EducatorExperience:
 *                     type: string
 *                   EducationContext:
 *                     type: string
 *                   Dimension:
 *                     type: string
 *                   LearnerExperience:
 *                     type: string
 *               Objective:
 *                 type: object
 *                 properties:
 *                   BloomLevel:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       verbs:
 *                         type: array
 *                         items:
 *                           type: string
 *                   SkillsConcepts:
 *                     type: array
 *                     items:
 *                       type: number
 *                   LearningContext:
 *                     type: string
 *                   TextLearningObjectives:
 *                     type: array
 *                     items:
 *                       type: string
 *               Path:
 *                 type: object
 *                 properties:
 *                   TitleLearningPath:
 *                     type: string
 *                   MacroSubject:
 *                     type: string
 *                   LessonPlan:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         ActivityTitle:
 *                           type: string
 *                         TypeOfAssignment:
 *                           type: string
 *                         TypeOfActivity:
 *                           type: string
 *                         Time:
 *                           type: number
 *                         Description:
 *                           type: string
 *                         Topic:
 *                           type: string
 *                         Content:
 *                           type: object
 *                           properties:
 *                             OERs:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id_oer:
 *                                     type: number
 *                                   Title:
 *                                     type: string
 *                             Files:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   Name:
 *                                     type: string
 *                                   File:
 *                                     type: string
 *                                     format: binary
 *                         Compulsory:
 *                           type: boolean
 *                         Conditions:
 *                           type: object
 *                           properties:
 *                             Pass:
 *                               type: array
 *                               items:
 *                                 type: string
 *                             Fail:
 *                               type: array
 *                               items:
 *                                 type: string
 *                   Graph:
 *                     type: object
 *                     properties:
 *                       Nodes:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             ID:
 *                               type: number
 *                             Title:
 *                               type: string
 *                             Type:
 *                               type: string
 *                       Edges:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             SourceID:
 *                               type: number
 *                             TargetID:
 *                               type: number
 *                             Type:
 *                               type: string
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *               updatedAt:
 *                 type: string
 *                 format: date-time
 *       500:
 *         description: Internal Server Error
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *               description: Error message
 */
app.get('/api/getAllLearningPaths', async (req, res) => {
  try {
    const learningPaths = await LearningPath.find();
    res.json(learningPaths);
  } catch (error) {
    console.error('Error retrieving learning paths:', error);
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