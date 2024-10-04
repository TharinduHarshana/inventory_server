const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Store the selected MongoDB URI (default to Store1)
let mongoUri = process.env.MONGO_URI;

// Helper function to disconnect and reset Mongoose models and caches
const clearMongooseCache = async () => {
    try {
        // Disconnect if currently connected
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
            console.log('Disconnected from MongoDB.');
        }
        
        // Clear the connection pool
        await mongoose.connection.close();
        console.log('Connection pool cleared.');

        // Clear Mongoose's internal models and schemas caches
        mongoose.models = {};
        mongoose.modelSchemas = {};
        console.log('Mongoose model caches cleared.');
    } catch (err) {
        console.error('Error clearing Mongoose cache:', err);
    }
};

// Function to connect to MongoDB and load models
const connectToMongoDB = async (uri) => {
    try {
        // Clear previous connection, model caches, and pools
        await clearMongooseCache();

        // Connect to the new MongoDB instance
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log(`MongoDB connected to ${uri}`);

        // Dynamically reload models after switching databases
        require('./models/SuppliersModel');
        require('./models/customerModel');
        require('./models/expenseModel');
        require('./models/inventoryModel');
        require('./models/saleModel');
        console.log('Models reloaded successfully.');
    } catch (err) {
        console.error(`Error connecting to MongoDB:`, err);
        throw err;
    }
};

// Initial MongoDB connection
connectToMongoDB(mongoUri);

// Endpoint to change the MongoDB connection
app.post('/set-store', async (req, res) => {
    const { store } = req.body;
    console.log(`Store selected: ${store}`); // Log store selection for debugging

    // Set the correct MongoDB URI based on the store
    if (store === 'store1') {
        mongoUri = process.env.MONGO_URI;
    } else if (store === 'store2') {
        mongoUri = process.env.MONGO_URI1;
    } else {
        return res.status(400).send({ message: 'Invalid store selection.' });
    }

    try {
        // Reconnect to the new database and clear models
        await connectToMongoDB(mongoUri);
        res.status(200).send({ message: `Switched to ${store} and connected to the new database.` });
    } catch (err) {
        console.error(`Failed to switch MongoDB: ${err}`);
        res.status(500).send({ message: 'Failed to switch store and reconnect to the database.' });
    }
});

// Basic route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Routes (import your routes as necessary)
const userRouter = require('./routes/loginRoute');
const inventoryRouter = require('./routes/inventoryRoutes');
const supplierRouter = require('./routes/SuplierRoutes');
const expenseRouter = require('./routes/expeseRoutes');
const customerRouter = require('./routes/customerRoutes');
const saleRouter = require('./routes/saleRoutes');
const reportRouter = require('./routes/reportRoute');

app.use('/user', userRouter);
app.use('/inventory', inventoryRouter);
app.use('/supplier', supplierRouter);
app.use('/expense', expenseRouter);
app.use('/customer', customerRouter);
app.use('/sale', saleRouter);
app.use('/report', reportRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
