const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

// json web token
// ...........................................
const jwt = require('jsonwebtoken');
// .............................................


// stripe
const stripe = require('stripe')(process.env.SECRET_KEY)


const app = express();
const port = process.env.PORT || 1000;

// cors
app.use(cors());
app.use(express.json());


// jwt 2 .

// verify token 
// .....................................................................................


const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  console.log(req.headers);
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized access' });
  }

  // bearer token ???

  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.TOKEN_SECTRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
  req.decoded = decoded;

  })
  next();
}

// .....................................................................................





// mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster369.swbratv.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    // await client.connect();

    // Database
    const toysCollection = client.db('toysDB').collection('toys');

    const paymentCollection = client.db("toysDB").collection("payments");



// jwt 1

    // ...................................
    // jwt .............
    // ...................................

    app.post('/jwt',  (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.TOKEN_SECTRET, { expiresIn: '1h' })

      res.send({ token })
    })

    // ...........................................


//  verifyJWT,

    app.get('/toys',  async (req, res) => {  
      const result = await toysCollection.find().toArray();
      res.send(result);
    });

    
    app.get('/toyDetails/:id', async (req, res) => {
      const userId = req.query.userId;
      const id = req.params.id;
      const query = { _id: new ObjectId(id), userId: userId };
      const result = await toysCollection.find(query).toArray();
      res.send(result[0]);
      // some confusion in this line.. .
    });

    app.post('/toys', async (req, res) => {
      const newToy = req.body;
      const result = await toysCollection.insertOne(newToy);
      res.send(result);
    });

    app.put('/update/:id', async (req, res) => {
      const userId = req.query.userId;
      const id = req.params.id;
      const toy = req.body;

      const filter = { _id: new ObjectId(id), userId: userId };
      const updatedToy = {
        $set: {
          price: toy.price,
          quantity: toy.quantity,
          description: toy.description,
        },
      };

      const result = await toysCollection.updateOne(filter, updatedToy);
      res.send(result);
    });

    app.delete('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });



    // payment intent 
    
// verifyJWT,

    app.post('/create-payment-intent', verifyJWT, async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      });

      res.send({
        clientSecret: paymentIntent.client_secret
      })
    })

// payment api 

// app.post('/payments', verifyJWT, async (req, res) => {
//   const payment = req.body;
//   const insertResult = await paymentCollection.insertOne(payment);

//   const query = { _id: { $in: payment.cartItems.map(id => new ObjectId(id)) } }
//   const deleteResult = await cartCollection.deleteMany(query)

//   res.send({ insertResult, deleteResult });
// })


app.post('/payments', async(req, res) =>{
  const payment = req.body;
  const result = await paymentCollection.insertOne(payment);
  res.send(result);
})



    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Toy Cars Are Running');
});

app.listen(port, () => {
  console.log(`Toy Car World is running on port ${port}`);
});
