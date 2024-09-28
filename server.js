const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');



const userRouter = require('./routes/loginRoute');
const inventoryRouter = require('./routes/inventoryRoutes');
const suplierRouter = require('./routes/SuplierRoutes');
const expenseRouter = require('./routes/expeseRoutes');
const customerRouter = require('./routes/customerRoutes');
const saleRouter = require('./routes/saleRoutes');
const reportRouter = require('./routes/reportRoute');


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
app.use('/suplier', suplierRouter);
app.use('/expense', expenseRouter);
app.use('/customer', customerRouter);
app.use('/sale', saleRouter);
app.use('/report', reportRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
