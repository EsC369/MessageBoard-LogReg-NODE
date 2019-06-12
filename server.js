const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
app.use(express.static(__dirname + "/public/stylesheets")); 
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect("mongodb://localhost/message_board_LogReg", { useNewUrlParser: true }); // if doesnt exist mongo will create

// Session:
const sessionSecret = config.get("sessionSecret");
const session = require("express-session");
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 600000 } // One hour I believe
}));
// Flash messages
// Note for flashing it is best to install as such: npm install git://github.com/RGBboy/express-flash.git:
const flash = require("express-flash");
app.use(flash());

// Schemas:
var CommentSchema = new mongoose.Schema({
    comment: {type: String, required: true},
    name: {type: String, required: true}
}, {timestamps: true})

var MessageSchema = new mongoose.Schema({
  message: {type: String, required: true},
  name: {type: String, required: true},
  comments: [CommentSchema]
}, {timestamps: true});
mongoose.model("Message", MessageSchema);
var Message = mongoose.model("Message");

// Routes:
app.get("/", function(req, res){
  Message.find({}, function(err, messages){
      res.render("index", {messages: messages});
  });
});

app.post("/message", function(req, res){
  var message = new Message();
  message.message = req.body.message;
  message.name = req.body.name;
  message.comments = [];
  message.save(function(err){
      res.redirect("/");
  });
});

app.post("/comment", function(req, res){
  Message.findOne({_id: req.body.message_id}, function(err, message){
      if(err){
          res.redirect("/");
      }
      else {
          message.comments.push({comment: req.body.comment, name: req.body.name});
          message.save(function(err){
              res.redirect("/");
          });
      }
  });
});

// Listening
app.listen(1337);