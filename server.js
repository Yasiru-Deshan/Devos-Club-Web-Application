const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
require("dotenv").config();
const passport = require('passport');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

app.use(express.json());


const URL = process.env.MONGODB_URL;

mongoose.connect(URL,{
       useCreateIndex: true,
       useNewUrlParser: true,
       useUnifiedTopology: true,
       useFindAndModify: false
});


const connection = mongoose.connection;
connection.once("open", ()=>{
    console.log("Mongodb connection success!");
});

//passport middleware
app.use(passport.initialize());

//passport config
require('./config/passport')(passport);

//Use routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);


app.listen(port,()=>console.log(`Server is running on port ${port }`));


