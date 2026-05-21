const express = require('express');
const app = express();
const cors = require('cors');
const jose = require('jose-cjs');
const dotenv = require('dotenv');

dotenv.config();

const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = process.env.MONGO_URL;


app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://assignment-nine-client-repo.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


const jwks = jose.createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
);

const Valudateapi = async (req, res, next) => {
  const authheader = req.headers.authorization;

  if (!authheader) {
    return res.status(401).json({ message: 'unauthorized' });
  }

  const token = authheader.split(' ')[1];

  try {
    const { payload } = await jose.jwtVerify(token, jwks);
    req.user = payload;
    next();
  } catch (error) {
    console.log("JWT ERROR:", error);
    return res.status(403).json({ message: error.message });
  }
};


async function run() {
  try {
    await client.connect();

    const db = client.db('doctorappoinmentspage');
    const Allappoinment = db.collection('allappoinments');
    const AllBooking = db.collection('allbooking');

   
    app.get('/allbookings', Valudateapi, async (req, res) => {
      const email = req.query.email;

      let query = {};
      if (email) query = { email };

      const result = await AllBooking.find(query).toArray();
      res.send(result);
    });

   
    app.post('/allbookings', Valudateapi, async (req, res) => {
      const result = await AllBooking.insertOne(req.body);
      res.send(result);
    });

   
    app.patch('/allbookings/:id', Valudateapi, async (req, res) => {
      const { id } = req.params;

      const result = await AllBooking.updateOne(
        { _id: new ObjectId(id) },
        { $set: req.body }
      );

      res.send(result);
    });

   
    app.delete('/allbookings/:id', Valudateapi, async (req, res) => {
      const { id } = req.params;

      const result = await AllBooking.deleteOne({
        _id: new ObjectId(id)
      });

      res.send(result);
    });

    app.get('/featured', async (req, res) => {
      const result = await Allappoinment.find().limit(3).toArray();
      res.send(result);
    });

  
    app.get('/allappointments', async (req, res) => {
      const result = await Allappoinment.find().toArray();
      res.send(result);
    });

    app.get('/allappointments/:id', Valudateapi, async (req, res) => {
      const { id } = req.params;

      const result = await Allappoinment.findOne({
        _id: new ObjectId(id)
      });

      res.send(result);
    });

    console.log("MongoDB connected successfully");

  } catch (error) {
    console.log("DB ERROR:", error);
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});