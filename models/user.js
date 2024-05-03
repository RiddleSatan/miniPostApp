import mongoose from "mongoose";

(async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://Riddle:9118380538@cluster0.qr5vrpz.mongodb.net/miniBlog`
    );
    console.log(`mongodb server has successfully connected the database`);
  } catch (error) {
    console.log(error);
    throw error;
  }
})();

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  age: Number,
  email: String,
  password: String,
  posts:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'post'
  }]
});

export default mongoose.model("user", userSchema);
