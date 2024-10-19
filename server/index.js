// ------------- MONGO -------------
const mongoose = require('mongoose');
const uri = 'mongodb+srv://alybijani:benchode@pakiboy.rbqbd.mongodb.net/?retryWrites=true&w=majority&appName=pakiboy';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas: ', error);
  });

// ------------- SCHEMAs -------------
const User = require('./schema/User');

// ------------- JS -------------
const express = require('express');
const app = express();
const port = 3000;


app.get('/', async (req, res) => {
    res.send('Hello World!');
    const user = new User({
        username: 'user2',
        email: 'test@test2',
        password: 'password2',
    });
    await user.save();
    console.log(user);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});