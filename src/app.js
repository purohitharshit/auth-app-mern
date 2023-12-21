require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const port = process.env.PORT || 3000;
require("./db/conn");
const bodyParser = require("body-parser")
const Register = require("./models/register");
const bcryptjs = require("bcryptjs");
const cookieParser = require("cookie-parser");
const auth = require("../middleware/auth");
const url = require("url");

// console.log(process.env.SECRET_KEY);
const static_path = path.join(__dirname, "../public/");
const template_path = path.join(__dirname, "../templates/views");
app.set("view engine", "hbs");
app.set("views", template_path);
app.use(express.static(static_path));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// console.log(path.join(__dirname,"../templates/views"))

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// app.get("/", (req, res) => {
//   res.send("Hello");
// });

app.post("/signup", async (req, res) => {
  try {
    const userReg = new Register({
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      bio: req.body.bio,
    });

    const token = await userReg.generateAuthToken();

    // Storing JWT Token in httpOnly cookie
    res.cookie("jwt_reg",token, {
        expires: new Date(Date.now()+ 60000),
        httpOnly: true
      });
      // console.log(cookie);

    // console.log(userReg);
    const registered = await userReg.save();
    res.redirect("login");
    res.status(201).render("login");
    // res.send("Signup successfull");
  } catch (error) {
    res.status(401).send(error);
    console.log(error);
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/user", auth, async(req,res)=>{
  console.log(`The cookie is: ${req.cookies.jwt_reg}`);
  res.render("user");
})

app.post("/login", async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const getUser = await Register.findOne({ username: username });
    console.log(getUser);

    //if console.log(getUser) giving you null means that the username from which you are searching/logging in...does not exist in DB
    //it will give 'null' for the username does not exist in DB
    const isMatch = await bcryptjs.compare(password, getUser.password); // first pwd is the pwd entered by the user and the second is the pwd present im the database

    const token = await getUser.generateAuthToken();

    res.cookie("jwt_reg",token,{
      expires: new Date(Date.now()+60000),
      httpOnly: true
    });
    // console.log(cookie);

    // if (getUser.password === password){

    // }
    if (isMatch) {
      console.log(getUser);
      console.log("Login successfull");
      // res.send("Login successfull");
      res.status(201).render("user", {
        // most important part
        //use -- getUser.name etc.... to get the data from DB
        username: username,
        email: getUser.email,
        bio: getUser.bio,
      });
      // res.redirect(url.format({
      //   pathname:"/user",
      //     'username': username,
      //     "email": getUser.email,
      //     "bio": getUser.bio,
         
      // }));
      // res.redirect('/user?username=getUserusername&email=getUser.email&bio=getUser.bio');
      
    } else {
      console.log("Invalid details");
      res.send("Invalid details");
    }
  } catch (error) {
    res.status(401).send(error);
    console.log(error);
  }
});
app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("*", (req, res) => {
  res.send("404 Not Found");
});


// app.get("/logout", auth, async(req,res)=>{
//   try {

//     //logout from a specific device (in case you are logged in from multiple devices)
//     // req.user.tokens = req.user.tokens.filter((currElement)=>{
//     //   return currElement.token !== req.token;
//     //   //here currElement token is the token stored in the DB and req.token is the latest current token stored on the browser
//     // })

//     //logout from all devices
//     req.user.tokens = []; //all the tokens (for all devices) will be deleted from the DB


//     // logout directly by deleting cookies
//     res.clearCookie("jwt_reg");
//     console.log("Logout successfully");

//     await req.user.save();
//     res.render("login");
    
//   } catch (error) {
//     res.status(500).send(error);
//     console.log(error);
//   }
// })


//
const jwt_reg = require("jsonwebtoken");

const createToken = async() => {
  const token= await jwt_reg.sign(
    { id: "657a67ed2805bd0824568b74"}, "mynameisharshitandiamafullstackdeveloperfromindia"
  );
  console.log(`Token is : ${token}`);

  const userVer = await jwt_reg.verify(token, "mynameisharshitandiamafullstackdeveloperfromindia");
  console.log(userVer);
}

createToken();

app.listen(port, () => {
  console.log(`Listening to the port no. ${port}`);
});
