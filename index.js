const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;

// use middleware
app.use(cors());
app.use(express.json())

// console.log("this is passowrd", process.env.DB_PASS)


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hrhwfvt.mongodb.net/?retryWrites=true&w=majority`;

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

        const availableFoodsCollection = client.db('shareFoodDB').collection('AvailableFoods');
        const foodRequestsCollection = client.db('shareFoodDB').collection('foodRequests');


        // to get all the service in a API
        app.get('/available_foods', async (req, res) => {
            const cursor = availableFoodsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        // to get one single data from service API
        app.get('/available_foods/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await availableFoodsCollection.findOne(query);
            res.send(result);
        })

        // get some data of requested foods
        app.get('/foodRequests', async (req, res) => {
            console.log(req.query.email);
            let query = {}
            if (req.query?.User_email) {
                query = { User_email: req.query.User_email }
            }
            const result = await foodRequestsCollection.find(query).toArray();
            res.send(result);
        })



        // post requested data to the database collection
        app.post('/foodRequests', async (req, res) => {
            const foodRequests = req.body;
            console.log(foodRequests);
            const result = await foodRequestsCollection.insertOne(foodRequests);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Share Food server is running')
})

app.listen(port, (req, res) => {
    console.log(`Listening to the port ${port}`)
})