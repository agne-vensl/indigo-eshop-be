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

app.get("/products", async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);

    const [data] = await con.execute(
      "SELECT id, image, title, price, category FROM products"
    );
    con.end();

    res.send(data);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Database error. Please try again later" });
  }
});

app.get("/product/:id", async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);

    const [data] = await con.execute(
      `SELECT * FROM products WHERE id = ${mysql.escape(req.params.id)} LIMIT 1`
    );
    con.end();

    res.send(data);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Database error. Please try again later" });
  }
});

app.post("/add-product", async (req, res) => {
  let product;

  try {
    product = await schema.validateAsync({
      image: req.body.image,
      title: req.body.title,
      price: req.body.price,
      category: req.body.category,
      description: req.body.description,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ error: "Incorrect data" });
  }

  try {
    const con = await mysql.createConnection(mysqlConfig);

    const [result] = await con.execute(
      `INSERT INTO products (image, title, price, category, description) VALUES (${mysql.escape(
        product.image
      )}, ${mysql.escape(product.title)}, ${mysql.escape(
        product.price
      )}, ${mysql.escape(product.category)}, ${mysql.escape(
        product.description
      )})`
    );
    con.end();

    if (!result.insertId) {
      return res
        .status(500)
        .send({ error: "An unexpected error occured. Please try again later" });
    }

    res.send({ msg: "Product successfully added", id: result.insertId });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Database error. Please try again later" });
  }
});

app.all("*", (req, res) => {
  res.status(404).send({ error: "Page not found" });
});

const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`Listening on port ${port}`));
