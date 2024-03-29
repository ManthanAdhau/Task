let express = require("express");
const cors = require("cors");
let app = express();
module.exports = app;

app.use(cors());
app.use(express.json());

let mongoose = require("mongoose");

// Define MongoDB schema
const transactionSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  dateOfSale: Date,
  sold: Boolean,
  category: String,
});

const TransactionModel = mongoose.model("Transaction", transactionSchema);
const axios = require('axios');

// Function to fetch data from the third-party API
const fetchDataFromAPI = async () => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        return response.data; // Assuming the data is in JSON format
    } catch (error) {
        console.error('Error fetching data from API:', error);
        throw error;
    }
};

// Function to save fetched data to MongoDB
const saveDataToMongoDB = async (data) => {
    try {
        // Save data to MongoDB using Mongoose model
        await TransactionModel.create(data);
        console.log('Data saved to MongoDB successfully.');
    } catch (error) {
        console.error('Error saving data to MongoDB:', error);
        throw error;
    }
};

// Main function to fetch data from API and save it to MongoDB
const seedDataToMongoDB = async () => {
    try {
        // Fetch data from API
        const apiData = await fetchDataFromAPI();

        // Save fetched data to MongoDB
        await saveDataToMongoDB(apiData);
    } catch (error) {
        console.error('Data seeding process failed:', error);
    }
};

// Call the main function to initiate the data seeding process
seedDataToMongoDB();

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/test")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
    

app.listen(3000, () => {
  console.log("Server Started at http://localhost:3000/");
});

// API to list all transactions with search and pagination
app.get("/allTransaction", async (req, res) =>{
    try{
const transaction = await TransactionModel.find();
res.json({transactions :transaction})
    }
    catch{

    }
})
async function getTransactions(page = 1, perPage = 10) {
    try {
      // Query MongoDB to get transactions
      const transactions = await TransactionModel.find().skip((page - 1) * perPage).limit(perPage).lean();
  
      // Manipulate the data to match the desired response structure
      const transformedTransactions = transactions.map(transaction => ({
        id: transaction._id, // Assuming MongoDB assigns _id for each transaction
        title: transaction.title,
        price: transaction.price,
        description: transaction.description,
        category: transaction.category,
        sold: transaction.sold ? 1 : 0, // Convert boolean to integer
        dateOfSale: transaction.dateOfSale.toISOString() // Convert date to ISO string format
      }));
  
      // Construct the response
      const response = {
        page,
        perPage,
        transactions: transformedTransactions
      };
  
      return response;
    } catch (error) {
      // Handle errors
      console.error('Error retrieving transactions:', error);
      throw error;
    }
  }
  
  // Example usage
 
    app.get('/transactions', async (req, res) => {
        const { page, perPage } = req.query;
    
        try {
            // Call getTransactions function with page and perPage parameters
            const transactions = await getTransactions(parseInt(page), parseInt(perPage));
    
            // Send the response
            res.json(transactions);
        } catch (error) {
            // Handle errors
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
  getTransactions(1, 10)
    .then(response => {
      console.log('Transactions:', response);
      // You can send this response to the client or use it as needed
    })
    .catch(error => {
      console.error('Error:', error);
    });
  


// API for statistics
app.get("/statistics", async (req, res) => {
  try {
    const selectedMonth = req.query.month || "march";

    const statisticsData = await TransactionModel.aggregate([
      {
        $match: {
          dateOfSale: {
            $gte: new Date(selectedMonth),
            $lt: new Date(selectedMonth + 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalSaleAmount: {
            $sum: { $cond: [{ $eq: ["$sold", true] }, "$price", 0] },
          },
          totalSoldItems: { $sum: { $cond: [{ $eq: ["$sold", true] }, 1, 0] } },
          totalNotSoldItems: {
            $sum: { $cond: [{ $eq: ["$sold", false] }, 1, 0] },
          },
        },
      },
    ]);

    res.json(statisticsData[0]);
    console.log(barChart,"barchart")
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/bar-chart", async (req, res) => {
  try {
    const selectedMonth = req.query.month || "march";
    const barChartData = await TransactionModel.aggregate([
      {
        $match: {
          dateOfSale: {
            $gte: new Date(selectedMonth),
            $lt: new Date(selectedMonth + 1),
          },
        },
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lte: ["$price", 100] }, then: "0 - 100" },
                { case: { $lte: ["$price", 200] }, then: "101 - 200" },
                { case: { $lte: ["$price", 300] }, then: "201 - 300" },
                // Add more cases for other price ranges
              ],
              default: "901-above",
            },
          },
          itemCount: { $sum: 1 },
        },
      },
    ]);

    // Transform barChartData into a format suitable for Chart.js
    const labels = barChartData.map(data => data._id);
    const itemCounts = barChartData.map(data => data.itemCount);

    // Render the bar chart
    const chartConfig = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Item Count',
          data: itemCounts,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };

    const chart = new Chart('canvas', chartConfig);
    
    // Send the chart HTML along with bar chart data
    res.send(`
      <div>
        <canvas id="canvas"></canvas>
      </div>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    `);
  }
  catch (e) {
    console.error(e.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
})
// API for bar chart data
app.get("/bar-chart1", async (req, res) => {
  try {
    const selectedMonth = req.query.month || "march";
console.log(selectedMonth, "Month")
    const barChartData = await TransactionModel.aggregate([
      {
        $match: {
          dateOfSale: {
            $gte: new Date(selectedMonth),
            $lt: new Date(selectedMonth + 1),
          },
        },
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lte: ["$price", 100] }, then: "0 - 100" },
                { case: { $lte: ["$price", 200] }, then: "101 - 200" },
                { case: { $lte: ["$price", 300] }, then: "201 - 300" },
                // Add more cases for other price ranges
              ],
              default: "901-above",
            },
          },
          itemCount: { $sum: 1 },
        },
      },
    ]);
console.log(barChartData,"barchart data")
    res.json(barChartData);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API for pie chart data
app.get("/pie-chart", async (req, res) => {
  try {
    const selectedMonth = req.query.month || "march";

    const pieChartData = await TransactionModel.aggregate([
      {
        $match: {
          dateOfSale: {
            $gte: new Date(selectedMonth),
            $lt: new Date(selectedMonth + 1),
          },
        },
      },
      {
        $group: {
          _id: "$category",
          itemCount: { $sum: 1 },
        },
      },
    ]);

    res.json(pieChartData);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Combined response
app.get("/combined-response", async (req, res) => {
  try {
    const selectedMonth = req.query.month || "march";
    const { search, page, perPage } = req.query;

    const transactionsData = await TransactionModel.find({
      dateOfSale: {
        $gte: new Date(selectedMonth),
        $lt: new Date(selectedMonth + 1),
      },
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { price: { $regex: search, $options: "i" } },
      ],
    })
      .skip((page - 1) * perPage)
      .limit(perPage);

    const statisticsData = await TransactionModel.aggregate([
      {
        $match: {
          dateOfSale: {
            $gte: new Date(selectedMonth),
            $lt: new Date(selectedMonth + 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalSaleAmount: {
            $sum: { $cond: [{ $eq: ["$sold", true] }, "$price", 0] },
          },
          totalSoldItems: { $sum: { $cond: [{ $eq: ["$sold", true] }, 1, 0] } },
          totalNotSoldItems: {
            $sum: { $cond: [{ $eq: ["$sold", false] }, 1, 0] },
          },
        },
      },
    ]);

    const barChartData = await TransactionModel.aggregate([
      {
        $match: {
          dateOfSale: {
            $gte: new Date(selectedMonth),
            $lt: new Date(selectedMonth + 1),
          },
        },
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lte: ["$price", 100] }, then: "0 - 100" },
                { case: { $lte: ["$price", 200] }, then: "101 - 200" },
                { case: { $lte: ["$price", 300] }, then: "201 - 300" },
                // Add more cases for other price ranges
              ],
              default: "901-above",
            },
          },
          itemCount: { $sum: 1 },
        },
      },
    ]);

    const pieChartData = await TransactionModel.aggregate([
      {
        $match: {
          dateOfSale: {
            $gte: new Date(selectedMonth),
            $lt: new Date(selectedMonth + 1),
          },
        },
      },
      {
        $group: {
          _id: "$category",
          itemCount: { $sum: 1 },
        },
      },
    ]);

    const combinedResponse = {
      transactions: transactionsData,
      statistics: statisticsData[0], // Assuming statisticsData is an array with a single element
      barChart: barChartData,
      pieChart: pieChartData,
    };

    res.json(combinedResponse);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
