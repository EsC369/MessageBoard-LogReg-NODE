const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const config = require("config");
const Message = require("./models/message");
const Routes = require("./routes/api/routes");
// const Comment = require("./models/comment");
const User = require("./models/User");


app.use(express.static(__dirname + "/public/stylesheets"));
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// Session:
const session = require("express-session");
app.use(session({
  secret: config.get("sessionSecret"),
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 600000 } // One hour I believe
}));
// Flash messages
// Note for flashing it is best to install as such: npm install git://github.com/RGBboy/express-flash.git:
const flash = require("express-flash");
app.use(flash());

// Routes:
app.use("/", Routes);
// ------------------

// Db Config:
const db = config.get("mongoURI");
// Connect Mongo:
// // Connect to Mongo:
mongoose.connect(db, { useNewUrlParser: true, useCreateIndex: true })
  .then(() => console.log("Mongo DB Connected..."))
  .catch(err => console.log(err));

const port = 5000;
// Listening
app.listen(port, () => {
  console.log(`Server Running On Port: ${port}`)
});