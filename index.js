const express = require("express");
const cors = require('cors');
require("dotenv").config(); // Fixed: Added ()
const bodyParser = require('body-parser')
const port = process.env.PORT || 3000;
const app = express();

const rootRouter = require('./routes/index');


app.use(bodyParser.json());

app.use(cors({
  origin: process.env.FRONTEND_URI || 'http://localhost:5174',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true  // Allow credentials
}));

app.use("/api/v1",rootRouter); 

app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })