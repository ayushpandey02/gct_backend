const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser')

const app = express();

const rootRouter = require('./routes/index');

app.use(bodyParser.json());
app.use(cors());


app.use("/api/v1",rootRouter); 

app.listen(3000);