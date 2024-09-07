const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');



const userRouter = require('./routes/loginRoute');
const inventoryRouter = require('./routes/inventoryRoutes');


// Load environment variables
dotenv.config();

const corsOptions = {
    origin: [
        "https://inventory-client-two.vercel.app", 
        "http://localhost:3000" // Assuming your localhost client runs on port 3000
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
};


const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

//importing routes
app.use('/user', userRouter);
app.use('/inventory', inventoryRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
