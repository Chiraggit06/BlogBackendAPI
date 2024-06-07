const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blog');

const app = express();

require('dotenv').config();

app.use(bodyParser.json());

const connectDB=async ()=>{
    try {
        const connectionInstance=await mongoose.connect(process.env.MONGO_URI);
        console.log(`\n MongoDB connected !! DB Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("Connection Error",error);
        process.exit(1);
    }
}
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

module.exports = app;
