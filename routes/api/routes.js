const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

router.get("/", function (req, res) {
  res.render("index");
});

// login Route: --------------------------------------------
router.post('/login', (req, res) => {
  // console.log(" req.body: ", req.body);
  const { emailLog, passwordLog } = req.body;

  // Simple validation:
  if (!emailLog || !passwordLog) {
    console.log("Please Enter All Login Fields!")
    req.flash("error", "Please Enter All Login Fields")
    res.redirect("/");;
  }
  else{
    User.findOne({ email: emailLog }, function (err, user) {
      if (err) {
        req.flash("error", "User Doesnt Exists");
        res.redirect("/");
      }
      else {
        if (user) { // Means user was found
          console.log("found user with email " + user.email);
          bcrypt.compare(passwordLog, user.password, function (err, result) {
            if (result) {
              req.session.user_id = user._id;
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
    })
  }
});

// Success Route: --------------------------------------------
router.get("/success", function(req, res){
  if(req.session.user_id) {
      User.findOne({_id: req.session.user_id}, function(err, user){
          if(err) {
            res.redirect("/");
          }
          else {
            Message.find({}, function(err, messages){
              if(messages) {
                res.render("success", {user: user, messages: messages});
              }else{
                res.render("success", {user: user});
              }
            })
          }
      });
  }
  else {
      res.redirect("/");
  }
});

//Logout:
router.post("/logout", function (req, res) {
  req.session.user_id = null;
  res.redirect("/")
});


// Register Route:--------------------------------------------
router.post("/register", (req, res) => {
  // Destructuring, Pulling the values out from request.body
  const { name, email, password } = req.body;

  // Simple validation:
  if (!name || !email || !password) {
    console.log("Please Enter All Register Fields!")
    req.flash("error", "Please Enter All Register Fields")
    res.redirect("/");;
  }else{
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
            if (err) {
              console.log("User Already Exists!")
              req.flash("error", "User Already Exists")
              res.redirect("/");
            }
          })
          console.log("success")
          // Add Into Session:
          req.session.user_id = newUser._id;
          res.redirect("/success");
        });
      });
    });
  }
});

// Message Route: --------------------------------------------
router.post("/message", function (req, res) {
  const { message_content } = req.body;
  const message = new Message();
  message.message_content = message_content;
  message.comments = [];
  message.save(function (err) {
    if (err) {
      res.flash("error", "Error saving message");
      res.redirect("/success");
    }
    Message.find({}, function(err, messages){
      res.render("success", {messages: messages});
    });
  });
});

// Comment route: --------------------------------------------
router.post("/comment", function (req, res) {
  const { comment_content } = req.body;
    Message.findOne({ _id: req.body.message_id }, function (err, message) {
    if (err) {
      res.redirect("/");
    }
    else {
      console.log("MESSAGE INFO TEST ", message.comments);
      newComment = {
        name: "pussy Mcgee",
        comment_content: comment_content
      }
      message.comments.unshift(newComment);
      // message.comments.push(comment);
      // message.comments = comment_content;
      console.log("Comments array after push ", message);
      // console.log("Comments array after push ", Array.from(message.comments))
      message.save(function (err) {
        if(err) {
          req.flash("error", "Failed To Add Comment");
          res.redirect("success");
        }
          Message.find({}, function(err, messages){
          res.redirect("success");
        })
      });
    }
  });
});

module.exports = router;