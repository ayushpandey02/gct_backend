const express = require("express");
const cors = require('cors');
const port = 3000;
const bodyParser = require('body-parser')

const app = express();

const rootRouter = require('./routes/index');


app.use(bodyParser.json());




app.use("/api/v1",rootRouter); 

app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })