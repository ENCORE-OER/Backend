const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Connect to MongoDB
mongoose.connect(process.env.ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
  console.log('Connected to MongoDB');
});

// Enable CORS for all routes
app.use(require('cors')());

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Enable Swagger
const options = {
  swaggerDefinition: {
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Documentation for APIs',
    },
    basePath: '/',
  },
  apis: ['index.js'],
};
const swaggerSpec = swaggerJSDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Define Mongoose Schemas with `timestamps`
const keywordSchema = new mongoose.Schema(
  {
    value: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

const oerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    count: { type: Number, default: 1 },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const learningScenarioSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

const learningPathSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

// Define Models
const Keyword = mongoose.model('Keyword', keywordSchema);
const OER = mongoose.model('OER', oerSchema);
const LearningScenarioModel = mongoose.model('LearningScenario', learningScenarioSchema);
const LearningPath = mongoose.model('LearningPath', learningPathSchema);

// POST APIs
app.post('/api/saveKeyword', async (req, res) => {
  const { keyword } = req.body;

  if (!keyword) {
    return res.status(400).json({ error: 'Keyword is required.' });
  }

  try {
    const savedKeyword = await Keyword.findOneAndUpdate(
      { value: keyword.toLowerCase() },
      { value: keyword.toLowerCase() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ message: 'Keyword saved successfully.', keyword: savedKeyword });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error.' });
  }
});

app.post('/api/saveOER', async (req, res) => {
  const { id, title, description } = req.body;

  if (!id || !title) {
    return res.status(400).json({ error: 'ID and title are required.' });
  }

  try {
    const savedOER = await OER.findOneAndUpdate(
      { id },
      { title, description, lastUpdated: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ message: 'OER saved successfully.', oer: savedOER });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error.' });
  }
});

app.post('/api/saveLearningScenario', async (req, res) => {
  const data = req.body;

  if (!data) {
    return res.status(400).json({ error: 'Learning scenario is required.' });
  }

  try {
    const savedLearningScenario = await LearningScenarioModel.create(data);
    res.json({ message: 'Learning scenario saved successfully.', learningScenario: savedLearningScenario });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error.' });
  }
});

app.post('/api/saveLearningPath', async (req, res) => {
  const data = req.body;

  if (!data) {
    return res.status(400).json({ error: 'Learning path data is required.' });
  }

  try {
    const savedLearningPath = await LearningPath.create(data);
    res.json({ message: 'Learning path saved successfully.', learningPath: savedLearningPath });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error.' });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});