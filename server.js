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

// Function to connect to MongoDB and reinitialize models
const connectToMongoDB = async (uri) => {
    try {
        await mongoose.connect(uri);
        console.log(`MongoDB connected to ${uri}`);

        // Dynamically reload models after switching databases
        require('./models/SuppliersModel');      
        require('./models/customerModel'); 
        require('./models/expenseModel');  
        require('./models/inventoryModel');
        require('./models//saleModel');

    } catch (err) {
        console.error(`Error connecting to MongoDB:`, err);
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
        // Disconnect from the current MongoDB instance
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');

        // Reconnect with the new URI and reinitialize models
        await connectToMongoDB(mongoUri);
        res.status(200).send({ message: `Switched to ${store} and connected to new database.` });
    } catch (err) {
        console.error(`Failed to switch MongoDB: ${err}`);
        res.status(500).send({ message: 'Failed to switch store and reconnect to database.' });
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
