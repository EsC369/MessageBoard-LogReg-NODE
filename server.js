const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const config = require("config");
// const Message = require("./models/message");
// const Comment = require("./models/comment");
const User = require("./models/User");


app.use(express.static(__dirname + "/public/stylesheets"));
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

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

// Routes:

app.get("/", function (req, res) {
  Message.find({}, function (err, messages) {
    // res.render("index", {messages: messages});
    res.render("index");
  });
});

app.post("/message", function (req, res) {
  var message = new Message();
  message.message = req.body.message;
  message.name = req.body.name;
  message.comments = [];
  message.save(function (err) {
    res.redirect("/");
  });
});

app.post("/comment", function (req, res) {
  Message.findOne({ _id: req.body.message_id }, function (err, message) {
    if (err) {
      res.redirect("/");
    }
    else {
      message.comments.push({ comment: req.body.comment, name: req.body.name });
      message.save(function (err) {
        res.redirect("/");
      });
    }
  });
});
// ------------------


// login:
app.post('/login', (req, res) => {
  // console.log(" req.body: ", req.body);
  const { email, password } = req.body;

  // Simple validation:
  if (!email || !password) {
    res.flash("error", "ENTER ALL FIELDS")
    res.render("/");
  }

  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      res.redirect("/");
    }
    else {
      if (user) { // Means user was found
        console.log("found user with email " + user.email);
        bcrypt.compare(req.body.password, user.password, (err, result) => {
          if (result) {
            req.session.user_id = user._id;
            req.session.user_email = user.email;
            req.session.register_date = user.register_date;
            res.redirect("/success");
          }
          else {
            console.log("Wrong Password!")
            req.flash("error", "Wrong Password!")
            res.redirect("/");
          }
        });
      }
      else { // User not found
        console.log("User Not Found!")
        req.flash("error", "User Not found")
        res.redirect("/")
      }
    }
  });
});

//Logout:
app.post("/logout", function(req, res){
  req.session.user_id = null;
  res.redirect("/")
});


// Register:
app.post("/register", (req, res) => {
  // Destructuring, Pulling the values out from request.body
  const { name, email, password } = req.body;

  // Simple validation:
  if (!name || !email || !password) {
    console.log("Please Enter All fields!")
    req.flash("error", "Please Enter All fields")
    res.redirect("/");;
  }

  // Check for existing user:
  User.findOne({ email: email })
    .then(user => {
      if (user) {
        console.log("User Already Exists!")
        req.flash("error", "User Already Exists!")
        res.redirect("/");
      }
      const newUser = new User({
        name,
        email,
        password
      })
      // Create salt and hashed password:
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err
          newUser.password = hash;
          console.log("HASHED Password", hash);
          newUser.save((err) => {
            console.log("User Already Exists!")
            req.flash("error", "User Already Exists")
            res.redirect("/");
          })
          if(user){
            console.log("success")
            console.log(user)
            // Add Into Session:
            req.session.user_id = user._id;
            req.session.user_email = user.email;
            req.session.register_date = user.register_date;
            res.render("/messageBoard");
          }
            
           
        });
      });
    });
});

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