const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const routes = require("./src/routes");
require("dotenv").config();

const PORT = process.env.PORT ?? 3001;

const app = express();
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server online on port ${PORT}`);
});
