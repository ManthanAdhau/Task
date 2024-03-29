const mongoose = require('mongoose');
const axios = require('axios');
const ProductTransaction = require('./models/ProductTransaction');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  // URL of the JSON data
  const url = 'https://s3.amazonaws.com/roxiler.com/product_transaction.json';

  // Fetch JSON data from the URL
  axios.get(url)
    .then(response => {
      const jsonData = response.data;

      // Insert the data into MongoDB
      ProductTransaction.insertMany(jsonData)
        .then(() => {
          console.log('Database initialized with seed data.');
          // Close the MongoDB connection
          mongoose.connection.close();
        })
        .catch(error => {
          console.error('Error inserting data into MongoDB:', error.message);
          // Handle the error as needed
          mongoose.connection.close();
        });
    })
    .catch(error => {
      console.error('Error fetching data from the URL:', error.message);
      // Handle the error as needed
    });
})
.catch(err => console.error('MongoDB connection error:', err));