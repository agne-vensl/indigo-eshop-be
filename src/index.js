const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const Joi = require("joi");
require("dotenv").config();

const app = express();

const mysqlConfig = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
};

const schema = Joi.object({
  image: Joi.string().uri().required(),
  title: Joi.string().required(),
  price: Joi.number().min(1).required(),
  category: Joi.string().required(),
  description: Joi.string().required(),
});

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("OK");
});

app.all("*", (req, res) => {
  res.status(404).send({ error: "Page not found" });
});

const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`Listening on port ${port}`));
