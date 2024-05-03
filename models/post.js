import mongoose from "mongoose";

const postSchema = mongoose.Schema({
  postData: String,

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  date:{
    type:Date,
    default:Date.now
  },likes:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
  }]
});

export default mongoose.model("post", postSchema);
