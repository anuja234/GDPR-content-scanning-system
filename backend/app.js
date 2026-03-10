const express = require("express");
const cors = require("cors");

const scanRoutes = require("./src/routes/scan.routes");
const uploadRoutes = require("./src/routes/upload.routes");

const app = express();

app.use(cors());
app.use(express.json());


app.use("/", uploadRoutes);    
app.use("/api", scanRoutes); 

module.exports = app;
