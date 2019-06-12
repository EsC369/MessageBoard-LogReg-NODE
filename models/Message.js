const mongoose = require("mongoose");
const Schema = mongoose.Schmea;

// Create Schema:
const MessageSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: users
  },
  message_content: {
    type: String,
    require: true,
  },
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref:"users"
      }
    }
  ],
  register_date: {
    type: Date,
    default: Date.now
  }
})

module.exports = User = mongoose.model("message", MessageSchema);

