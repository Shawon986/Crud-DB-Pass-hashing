const dotenv = require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const uri = process.env.DB_URI;
mongoose
  .connect(uri, { useNewUrlParser: true })
  .then(() => console.log("Connected!"))
  .catch((error) => console.error("Not connected"));

const productSchema = new mongoose.Schema(
  {
    model: String,
    price: String,
    color: String,
    sell: Number,
    password: String,
    email: String,
  },
  {
    timestamps: true,
  }
);
const Product = mongoose.model("Product", productSchema);

const app = express();
app.use(bodyParser.json());

//! API  to check connection

app.get("/", (req, res) => {
  res.json({ message: "Hey Welcome !!!" });
});

//! API  to create data for a phone

app.post("/iphone", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);
    const password = hash;
    const dataObject = {
      model: req.body.model,
      price: req.body.price,
      color: req.body.color,
      sell: req.body.sell,
      email: req.body.email,
      password: password,
    };
    const phoneData = new Product(dataObject);
    await phoneData.save();
    res.status(201).json(phoneData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "something went wrong" });
  }
});

//! Login a user using email and password

app.post("/iphone/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const phoneData = await Product.findOne({ email: email });
    if (!phoneData) {
      res.status(404).json({ message: "data not found" });
    } else {
      const validityCheck = await bcrypt.compare(password, phoneData.password);
      if(!validityCheck){
      res.status(401).json({ message: "wrong password" });

      }else{
        res.status(201).json(phoneData);
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "something went wrong" });
  }
});

//! API to get a phone data by id

app.get("/iphone/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const phoneData = await Product.findById(id);
    if (phoneData) {
      res.json(phoneData);
    } else {
      res.status(404).json({ message: "data not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "something went wrong" });
  }
});

//! API to update a phone data by id

app.put("/iphone/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const phoneData = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (phoneData) {
      phoneData.model = req.body.model;
      phoneData.price = req.body.price;
      phoneData.color = req.body.color;
      phoneData.sell = req.body.sell;

      res.json(phoneData);
    } else {
      res.status(404).json({ message: "data not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "something went wrong" });
  }
});

//! API to delete a phone data by id

app.delete("/iphone/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const phoneData = await Product.findByIdAndDelete(id);
    if (phoneData) {
      res.json(phoneData);
    } else {
      res.status(404).json({ message: "data not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "something went wrong" });
  }
});

//! API to get all phone data

app.get("/iphone", async (req, res) => {
  try {
    const allData = await Product.find({});
    res.json(allData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "something went wrong" });
  }
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});
