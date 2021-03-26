import mongoose from "mongoose";

const message = new mongoose.Schema({
  sentBy: String,
  recipient: String,
  message: String,
});

export default mongoose.model("Message", message);
