const express = require('express')
const app = express()
const cors = require('cors')

const dotsenv = require('dotenv')
dotsenv.config()
const port = process.env.PORT
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGO_URL

app.use(cors())
app.use(express.json())

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



async function run() {
  try {
   const db = client.db('doctorappoinmentspage')
   const Allappoinment = db.collection('allappoinments')
   const AllBooking = db.collection('allbooking')
  

   app.patch('/allbookings/:id' , async (req , res ) => {
    const {id} = req.params 
    const NewData = req.body 
    const result = await AllBooking.updateOne(
      { _id : new ObjectId(id)},
    {$set : NewData })
    console.log(result)
    res.send(result)
   })

   app.delete('/allbookings/:id' , async (req , res ) => {

    const {id} = req.params 
    const result = await AllBooking.deleteOne({ _id : new ObjectId(id)});
    console.log(result)

    res.send(result)

   })
  

   app.get('/allbookings' , async (req , res ) => {
    const result = await AllBooking.find().toArray()
    res.send(result)
   })

   app.post('/allbookings' , async (req , res ) => {
    const Data = req.body
    const result = await AllBooking.insertOne(Data)
    console.log(result)
    res.send(result)
   })
   

   app.get('/featured' , async (req , res ) => {
    const result = await Allappoinment.find().limit(3).toArray()
    res.send(result)
   })

   app.get('/allappoinmets/:id' , async (req , res ) => {
    const {id} = req.params
    const result = await Allappoinment.findOne({ _id : new ObjectId(id)});
    // console.log(result)
    res.send(result)
    
   })




   app.get('/allappoinmets' , async (req , res) => {
    const result = await Allappoinment.find().toArray();
    res.send(result)
   })

   



   
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
