const express = require('express');
const app = express();
const mongoose = require('mongoose');
app.use(express.json());
const cors = require('cors');
const dotenv = require("dotenv");
const PORT = process.env.PORT || 5050;


app.use(cors());
dotenv.config();


mongoose.connect(process.env.DATABASE, {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>{
  console.log("Connected to Database...");
  app.listen(PORT,()=>{
      console.log("App is running on port: 5050.");
  });
})
.catch((err)=>{
  console.log("Error!!!", err);
});


//SCHEMA
const sch = new mongoose.Schema({
    id: Number,
    title: String,
    details: String,
    status: {type:Number, default:0},
    link: String
  }, {
    timestamps: true
  });
  const mymodel=mongoose.model('datta',sch);

//POST
app.post('/post', async (req, res) => {
    const data = new mymodel({
      id: req.body.id,
      title: req.body.title,
      details: req.body.details,
      link: req.body.link,
      status: req.body.status
    });
    try {
      const newData = await data.save();
      res.status(201).json(newData);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

//GET by id
app.get('/get/:id', async (req, res) => {
    try {
      const data = await mymodel.findById(req.params.id);
      if (!data) {
        return res.status(404).json({ message: 'Data not found' });
      }
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  //UPDATE
  app.put('/update/:id', async (req, res) => {
    try {
      const data = await mymodel.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!data) {
        return res.status(404).json({ message: 'Data not found' });
      }
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  //DELETE
  app.delete('/delete/:id', async (req, res) => {
    try {
      const data = await mymodel.findByIdAndDelete(req.params.id);
      if (!data) {
        return res.status(404).json({ message: 'Data not found' });
      }
      res.json({ message: 'Data deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  //all data
  
  app.get('/data', async (req, res) => {
    try {
      const { year, month, start, end } = req.query;
      let query = {};
      if ( start && end) {
        query = { createdAt: { $gte: new Date(start), $lte: new Date(end) } };
        //query = { ...query, createdAt: { $gte: new Date(year, month - 1), $lt: new Date(year, month) } };
      } else if (year && month) {
        //query = { createdAt: { $gte: new Date(start), $lte: new Date(end) } };
        query = { ...query, createdAt: { $gte: new Date(year, month - 1), $lt: new Date(year, month) } };
      }
      const data = await mymodel.find(query);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  

  
  