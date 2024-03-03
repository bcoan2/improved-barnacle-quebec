require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 5500;
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser')
// set the view engine to ejs
let path = require('path');




app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'))
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }))

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function getJobData() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    const result = await client.db("quebec-database").collection("quebec-collection").find().toArray();
    console.log("mongo call await inside f/n: ", result);
    return result;
  }
  catch (err) {
    console.log("getJob() error: ", err);
  }
  finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}

//reading from mongo
app.get('/', async (req, res) => {

  let result = await getJobData().catch(console.error);;

  console.log("getJobData() Result: ", result);

  res.render('index', {

    pageTitle: "brodys jobs",
    jobData: result
  });
});

//create to mongo 
app.post('/addJob', async (req, res) => {
  try {
    client.connect;
    const collection = client.db("quebec-database").collection("quebec-collection");
    //draws from body parser 
    console.log(req.body);
    await collection.insertOne(req.body);
    res.redirect('/');
  }
  catch (err) {
    console.log(err)
  }
  finally {
    // client.close()
  }
})


// START OF TESTING
app.post('/deleteJob', async (req, res) => {
  try {
    const devId = req.body.devId;
    console.log("Received request to delete user with ID:", devId);

    const collection = client.db("quebec-database").collection("quebec-collection");
    const objectId = new ObjectId(devId);

    const result = await collection.findOneAndDelete({ _id: objectId });

    console.log("Result:", result);
    res.redirect('/');
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});





app.listen(port, () => {
  console.log(`brodys job (quebec) app listening on port ${port}`)
})