const fs = require('fs')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

const Freelancers = require('./models/model')

dotenv.config({ path: './env' })

const mongoURI = process.env.MONGODB_URL

const app = express()

app.use(express.json())
app.use(cors())

// connect to mongodb
mongoose.connect(mongoURI).then(() => console.log('db connected'))

app.get('/', (req, res) => {
  res.send({
    title: 'hello world',
  })
})

const data = JSON.parse(fs.readFileSync('./person.json', 'utf-8'))

console.log(data)

// import data to MongoDB
const importData = async () => {
  try {
    await ProductTransactionSchema.create(data)
    console.log('data successfully imported')
    // to exit the process
    process.exit()
  } catch (error) {
    console.log('error', error)
  }
}

// importData()

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`listening to port ${PORT}`))