import mongoose from "mongoose";

const user = new mongoose.Schema({
  username: String,
  password: String,
  sentFriendRequests: {
    type: Array,
    required: false,
    default: [],
  },
  recievedFriendRequests: {
    type: Array,
    required: false,
    default: [],
  },
  friends: {
    type: Array,
    required: false,
    default: [],
  }
});
export default mongoose.model("User", user);
