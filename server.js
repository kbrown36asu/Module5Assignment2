// set environment variables
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});

// template for node.js express server
const express = require('express');
// create express app
const app = express();
// body parser is a middleware that parses incoming requests with JSON payloads and is based on body-parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

// path module provides utilities for working with file and dir paths
const path = require('path');

//debugging and logging
const morgan = require('morgan-body');
//middleware
//create a write stream (in append mode)
var rfs = require('rotating-file-stream'); //version 2.x
//serve static files
//create rotating write steam
const accessLogStream = rfs.createStream('access.log', {

    interval: '10s', //rotate daily
    path: path.join(__dirname, 'log'), //log directory will log alll data here

})//setup logger

morgan(app, {
    stream: accessLogStream,
    noColors: true,
    logReqUserAgent: true,
    logRequestBody: true,
    logResponseBody: true,
    logReqCookies: true,
    logReqSignedCookies: true
});

// __dirname is the directory name of the current module
app.use(express.static(path.join(__dirname, 'public')));

// set the view engine to ejs
app.set('view engine', 'ejs');
// set the views directory
app.set('views', 'views');

// routes defined in the routes folder
const authenticationRoute = require('./routes/authenticationRoute');
app.use('/api', authenticationRoute);

// 404 error page
app.use((err, req, res, next) => {
    res.status(404).render('404', { pageTitle: 'Page Not Found'});
});

// connecting to the database
const mongoose = require('mongoose');

// asynchronous connection
mongoose.connect('mongodb+srv://klbrow36:PlopGop12@cluster0.tkb6ao6.mongodb.net/test', {useNewUrlParser: true})
    .then(() => console.log('MongoDB connection successful'))
    .catch((err) => console.error(err));

// start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`)
});