const express = require("express");
const cors = require('cors');
require("dotenv").config(); // Fixed: Added ()
require("dotenv").config();
const port = process.env.PORT || 3000;
const app = express();

const rootRouter = require('./routes/index');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Error Handler
app.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ error: 'Payload too large' });
    }
    next(err);
});

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