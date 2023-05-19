const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()


const app = express();
const port = process.env.PORT || 1000;

// cors
app.use(cors());

app.use(express.json());





// mongodb


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster369.swbratv.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // database 
    const toysCollection = client.db('toysDB').collection('toys');



    app.get('/toys', async (req, res) => {
      const types = toysCollection.find();
      const result = await types.toArray();
      res.send(result);
    });
    

// POST ... 

app.post('/toys', async (req, res) => {
  const newToy = req.body;
  console.log(newToy);

  const result = await toysCollection.insertOne(newToy);
  res.send(result)
});





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    
    // 
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Toy Cars Are Running')
  })


app.listen(port, () => {
  console.log(`Toy Car World is running on port, ${port}`)
})

