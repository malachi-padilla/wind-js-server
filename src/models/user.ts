import mongoose from "mongoose";

const user = new mongoose.Schema({
    username:String,
    password:String
});
export default mongoose.model("User", user);