
import mongoose from "mongoose";
const user = new mongoose.Schema(
  {
    username: { type: String, text: true},
    password: String,
    email: {
      type: String,
      required: false,
    },
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
    },
    lastOnline: {
      type: Date,
      required: false,
      default: Date.now(),
    },
    profilePicture: {
      type: String,
      required: false,
      default: "",
    }
  },
  { timestamps: true }
);
export default mongoose.model("User", user);
