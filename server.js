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

// Helper function to clear Mongoose's internal state, connections, and caches
const advancedClearMongoose = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            // Disconnect from the current MongoDB connection
            await mongoose.disconnect();
            console.log('Disconnected from MongoDB.');
        }

        // Ensure that any remaining connections are fully closed
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log('Connection closed.');
        }

        // Clear all models and model schemas
        mongoose.models = {};
        mongoose.modelSchemas = {};

        // Clear Mongoose's internal state, including any cached indexes or connections
        const collections = Object.keys(mongoose.connection.collections);
        for (const collection of collections) {
            delete mongoose.connection.collections[collection];
        }

        console.log('Mongoose caches and collections cleared.');

        // Clear connection-related cache or connection pools to avoid memory leaks
        mongoose.connections.forEach((connection, index) => {
            mongoose.connections[index].readyState = 0; // Set connection state to disconnected
            mongoose.connections[index].close();        // Close connections explicitly
            console.log(`Closed connection ${index}.`);
        });

        mongoose.connection.close();  // Finally close all remaining connection pools
        console.log('Final connection pool closed.');

    } catch (err) {
        console.error('Error clearing Mongoose:', err);
    }
};

// Function to connect to MongoDB and reload models
const connectToMongoDB = async (uri) => {
    try {
        // Perform advanced clearing before reconnecting to a new database
        await advancedClearMongoose();

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
