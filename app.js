import cookieParser from "cookie-parser";
import express from "express";
import path from "path";
import userModel from "./models/user.js";
import postModel from "./models/post.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import post from "./models/post.js";

const app = express();

const __dirname = path.resolve();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/register", async (req, res) => {
  const { name, username, email, age, password } = req.body;

  const user = await userModel.findOne({ email });

  if (user) {
    return res.status(500).send("email aready registered");
  } else {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        const newUser = await userModel.create({
          name,
          username,
          email,
          age,
          password: hash,
        });
        let token = jwt.sign({ email, userid: newUser._id }, "randomSecretKey");
        res.cookie("token", token);
        res.redirect("/login");
      });
    });
  }
});

app.get("/login", twiceloggin, (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const loginUser = await userModel.findOne({ email });
  console.log(loginUser);
  if (!loginUser) {
    return res.status(500).redirect("/login");
  } else {
    bcrypt.compare(password, loginUser.password, (error, result) => {
      if (result) {
        let token = jwt.sign(
          { email, userId: loginUser._id },
          "randomSecretKey"
        );
        res.cookie("token", token);
        return res.status(200).redirect("/profile");
      }
    });
  }
});

app.get("/profile", isLoggedIn, async (req, res) => {
  let data = await userModel.findOne({ _id: req.data.userId }).populate('posts');
  console.log(data._id)
  res.render("profile", { data });
});

app.post("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

function isLoggedIn(req, res, next) {
  if (!req.cookies.token) {
    return res.redirect("/login");
  } else {
    jwt.verify(req.cookies.token, "randomSecretKey", (err, decoded) => {
      req.data = decoded;

      next();
    });
  }
}
function twiceloggin(req, res, next) {
  if (!req.cookies.token) {
    next();
    return;
  } else {
    jwt.verify(req.cookies.token, "randomSecretKey", (err, decoded) => {
      req.data = decoded;

      res.redirect("/profile");
    });
  }
}

  app.post('/post/:id',isLoggedIn,async (req,res)=>{
    const {post}=req.body
    // console.log(req.params.id)
    const user= await userModel.findOne({_id:req.params.id})
    // console.log()
    let newPost=await postModel.create({userId:req.params.id,postData:post})
    user.posts.push(newPost._id)
    await user.save();
    res.redirect('/profile')
    // res.send(post)
  })

app.listen(3000);
