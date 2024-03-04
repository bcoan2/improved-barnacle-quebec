require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 5500;
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// set the view engine to ejs
let path = require('path');

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.set('views', path.join(__dirname, 'views'));

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// CSRF middleware
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

async function getJobData() {
  try {
    await client.connect();
    const result = await client
      .db('quebec-database')
      .collection('quebec-collection')
      .find()
      .toArray();
    console.log('mongo call await inside f/n: ', result);
    return result;
  } catch (err) {
    console.log('getJob() error: ', err);
  }
}

app.get('/', async (req, res) => {
  try {
    let result = await getJobData().catch(console.error);
    console.log('getJobData() Result: ', result);

    res.render('index', {
      pageTitle: 'brodys jobs',
      jobData: result,
      csrfToken: req.csrfToken(), // Include CSRF token in the render
    });
  } catch (error) {
    console.error('Error rendering view:', error);
    res.status(500).send('Internal Server Error');
  }
});


// add that job
app.post('/addJob', async (req, res) => {
  try {
    const collection = client
      .db('quebec-database')
      .collection('quebec-collection');
    console.log(req.body);
    await collection.insertOne(req.body);
    res.redirect('/');
  } catch (err) {
    console.log(err);
  }
});

// ... (your existing code)

// update that job (render the update form)
app.get('/updateJob', async (req, res) => {
  try {
    const devId = req.query.devId;
    console.log('Received request to update job with ID:', devId);

    const collection = client
      .db('quebec-database')
      .collection('quebec-collection');
    const objectId = new ObjectId(devId);

    const jobToUpdate = await collection.findOne({ _id: objectId });

    res.render('update', {
      pageTitle: 'Update Job',
      jobData: jobToUpdate,
      csrfToken: req.csrfToken(), // Include CSRF token in the render
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// handle the update job form submission
app.post('/updateJob', async (req, res) => {
  try {
    const devId = req.body.devId;
    console.log('Received request to update job with ID:', devId);

    const collection = client
      .db('quebec-database')
      .collection('quebec-collection');
    const objectId = new ObjectId(devId);

    // Update the job with new data from the form
    await collection.updateOne(
      { _id: objectId },
      { $set: { jobName: req.body.jobName, origin: req.body.origin, todo: req.body.todo } }
    );

    res.redirect('/');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});


// delete that job
app.post('/deleteJob', async (req, res) => {
  try {
    const devId = req.body.devId;
    console.log('Received request to delete user with ID:', devId);

    const collection = client
      .db('quebec-database')
      .collection('quebec-collection');
    const objectId = new ObjectId(devId);

    const result = await collection.findOneAndDelete({ _id: objectId });

    console.log('Result:', result);
    res.redirect('/');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`brodys job (quebec) app listening on port ${port}`);
});
