//exteranl imports
const express = require('express');
const http = require("http");
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const moment = require("moment");

//internal imports
const loginRouter = require("./router/loginRouter")
const usersRouter = require("./router/usersRouter")
const inboxRouter = require("./router/inboxRouter")
const {notFoundHandler, errorHandler} = require('./middleware/common/errorHandler')

const app = express();
const server = http.createServer(app);
dotenv.config();

// socket creation
const io = require("socket.io")(server);
global.io = io;

// set comment as app locals
app.locals.moment = moment;

//DATABASE CONNECTION 
mongoose.connect(process.env.MONOGO_CONNECTION_STRTING)
.then(()=> console.log("Database connection successfull!"))
.catch(err => console.log(err));


//request parsers
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//set view engine 
app.set("view engine", "ejs");

// set static folder
app.use(express.static( path.join(__dirname, "public")));

//parse cookis
app.use(cookieParser(process.env.COOKIE_SECRET));

//routing setup
app.use('/' , loginRouter);
app.use('/users' , usersRouter);
app.use('/inbox' , inboxRouter);

//error handlein
//404 not found handler
app.use(notFoundHandler);

//common error handler
app.use(errorHandler);


server.listen(process.env.PORT, () => {
    console.log(`app listening to port ${process.env.PORT}`);
})
