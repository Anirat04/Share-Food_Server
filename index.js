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
        // app.get('/available_foods', async (req, res) => {
        //     const cursor = availableFoodsCollection.find();
        //     const result = await cursor.toArray();
        //     res.send(result);
        // })
        app.get('/available_foods', async (req, res) => {
            console.log(req.query.email);
            const options = {
                Food_status: 'Available'
            };
            let query = options
            if (req.query?.Donator_email) {
                query = { Donator_email: req.query.Donator_email }
            }
            const result = await availableFoodsCollection.find(query, options).toArray();
            res.send(result);
        })
        // to get one single data from service API
        app.get('/available_foods/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await availableFoodsCollection.findOne(query);
            res.send(result);
        })
        // post new available food from the Add Food route
        app.post('/available_foods', async (req, res) => {
            const addedData = req.body;
            console.log(addedData)
            const result = await availableFoodsCollection.insertOne(addedData);
            res.send(result);
        })
        // delete one data from available foods collection \\ from React-Table in Manage My foods route
        app.delete('/available_foods/:id', async (req, res) => {
            id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await availableFoodsCollection.deleteOne(query);
            res.send(result)
        })
        // for updating available foods from manage my food route edit button
        app.patch('/available_foods/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }

            const updatedData = req.body;
            console.log(updatedData);
            const updateDoc = {
                $set: {
                    Food_name: updatedData.Food_name,
                    Food_img: updatedData.Food_img,
                    Food_quantity: updatedData.Food_quantity,
                    Pickup_location: updatedData.Pickup_location,
                    Expired_date: updatedData.Expired_date,
                    Additional_notes: updatedData.Additional_notes,
                    Food_status: updatedData.Food_status
                },
            };
            const result = await availableFoodsCollection.updateOne(filter, updateDoc);
            res.send(result)
        })


        app.patch('/foodRequests/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const filter = { Food_id: id };
                const query = { _id: new ObjectId(id) };

                const updatedData = req.body;
                console.log(updatedData);
                const updateDoc = {
                    $set: {
                        Food_status: updatedData.Food_status,
                    },
                };

                const [result1, result2] = await Promise.all([
                    foodRequestsCollection.updateOne(filter, updateDoc),
                    availableFoodsCollection.updateOne(query, updateDoc),
                ]);

                console.log(result1, result2);
                res.send({ result1, result2 });
            } catch (error) {
                console.error('Error in PATCH request:', error);
                res.status(500).send('Internal Server Error');
            }
        });
        // app.patch('/foodRequests/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { Food_id: id }
        //     const query = { _id: new ObjectId(id) }

        //     const updatedData = req.body;
        //     console.log(updatedData);
        //     const updateDoc = {
        //         $set: {
        //             Food_status: updatedData.Food_status
        //         },
        //     };
        //     const result = await foodRequestsCollection.updateOne(filter, updateDoc);
        //     const result2 = await availableFoodsCollection.updateOne(query, updateDoc);
        //     console.log(result, result2)
        //     res.send(result, result2)
        // })


        // request related
        // get some data of requested foods
        app.get('/foodRequests', async (req, res) => {
            console.log(req.query.email);
            let query = {}
            if (req.query.Requester_email) {
                // If Food_name is provided, query using Food_name
                query = {
                    Requester_email: req.query.Requester_email
                };
            }
            else if (req.query.Food_id) {
                // If Food_name is provided, query using Food_name
                query = {
                    Food_id: req.query.Food_id
                };
            }
            const result = await foodRequestsCollection.find(query).toArray();
            res.send(result);
        })
        // get data for single foods
        app.get('/foodRequests/:id', async (req, res) => {
            const id = req.params.id;
            const query = { Food_id: id }
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
        // delete from requested data
        app.delete('/foodRequests/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await foodRequestsCollection.deleteOne(query)
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