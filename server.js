const express = require('express');
const app = express();
require('dotenv').config();
const connectDB = require('./db/dbConfig');

const userRoutes = require('./routes/userRoutes');

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', userRoutes);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});