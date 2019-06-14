const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema:
const MessageSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  
  name: {
    type: String,
  },
  
  message_content: {
    type: String,
    require: true,
  },

  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users"
      },

      name: {
        type: String,
      },

      comment_content: {
        type: String,
        required: true
      },
    }
  ],

  register_date: {
    type: Date,
    default: Date.now
  }
})

module.exports = Message = mongoose.model("message", MessageSchema);


