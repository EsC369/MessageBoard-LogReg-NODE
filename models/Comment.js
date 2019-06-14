const mongoose = require("mongoose");
const Schema = mongoose.Schmea;

// Create Schema:
const CommmentSchema = new Schema({
  name: {
    type: String,
    require: true
  },
  comment_content: {
    type: String,
    require: true,
  },
  register_date: {
    type: Date,
    default: Date.now
  }

})

module.exports = Comment = mongoose.model("comment", CommentSchema);