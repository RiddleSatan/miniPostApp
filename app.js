import cookieParser from "cookie-parser";
import express from "express";
import path from "path";
import userModel from "./models/user.js";
import postModel from "./models/post.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multerconfig from "./config/multerconfig.js";

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

app.get("/like/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("userId"); //populate expands that particular field that has been passed
  if (post.likes.indexOf(req.data.userId) === -1) {
    post.likes.push(req.data.userId);
  } else {
    post.likes.splice(post.likes.indexOf(req.data.userId));
  }

  console.log(req.data);
  // another way to check the likes and unlikes or remove userId from likes or add userid when liked
  // const likedByUser=post.likes.include(res.data.userId)
  // if (!likedByUser){
  //   post.likes.push(res.data.userId)
  // }else{
  //   post.likes.filter(id=>id!=res.data.userId)
  // }

  await post.save();
  // console.log(req.data)
  res.redirect("/profile");
});

app.get("/profile", isLoggedIn, async (req, res) => {
  let data = await userModel
    .findOne({ _id: req.data.userId })
    .populate("posts");
  console.log(data._id);
  res.render("profile", { data });
});

app.post("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

app.post("/post/:id", isLoggedIn, async (req, res) => {
  const { post } = req.body;
  // console.log(req.params.id)
  const user = await userModel.findOne({ _id: req.params.id });
  // console.log()
  let newPost = await postModel.create({
    userId: req.params.id,
    postData: post,
  });
  user.posts.push(newPost._id);
  await user.save();
  res.redirect("/profile");
  // res.send(post)
});

app.get("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const post = await postModel.findOne({ _id: id });
  console.log(post);
  res.render("edit", { post });
});

app.post("/edit/:id", isLoggedIn, async (req, res) => {
  // console.log(req.body.newPostData)
  // res.send(req.params.id)
  let postData = await postModel.findOneAndUpdate(
    { _id: req.params.id },
    { postData: req.body.newPostData }
  );
  res.redirect("/profile");
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
app.get("/upload", (req, res) => {
  res.render("upload");
});

app.post(
  "/upload",
  isLoggedIn,
  multerconfig.single("image"),
  async (req, res) => {
    const user = await userModel.findOne({ email: req.user.email });
    console.log(req.file);
  }
);

app.listen(3000);
