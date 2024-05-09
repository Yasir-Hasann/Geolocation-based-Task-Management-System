// module imports
const cors = require('cors');
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

// file imports
const TaskModel = require('./models/task');
const apiRouter = require('./routes');
const errorHandler = require('./middlewares/error-handler');

// variable initializations
const app = express();
const port = process.env.PORT || 5001;

// Connect to MongoDB Database

const connect = Promise.resolve(mongoose.connect(process.env.MONGO_URI));
connect.then(
  async (conn) => {
    console.log(`MongoDB Connected : ${conn.connection.host}`);
    await TaskModel.collection.createIndex({ location: '2dsphere' });
  },
  (err) => {
    console.error('Connected Error : ', err);
    process.exit(1);
  }
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Mount routes
app.use('/api/v1', apiRouter);
app.use('/ping', (req, res) => {
  return res.status(200).json({ success: true, message: 'Bro: I am live and working' });
});
app.all('/*', (req, res) => {
  res.json({ success: false, message: 'Invalid URL' });
});
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

console.log(process.env.NODE_ENV.toUpperCase());