const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const user = require("./models/user");
const {validateSignUpData } = require("./utils/validations");
const bcrypt = require("bcrypt");
const cookieparser = require('cookie-parser');
const jwt = require("jsonwebtoken");
const {userAuth }= require("./auth");

app.use(express.json());
app.use(cookieparser());
app.post("/signup",async (req,res)=>{
//creating a new instance of the  user model
try {
//validate data
validateSignUpData(req);
//encrypt the data
const {firstName , lastName , emailId ,password} = req.body;
const passwordHash = await bcrypt.hash(password, 10);

  const user = new User({
    firstName,lastName, emailId, password:passwordHash
  });

 
     await user.save();
  res.send("user added successfully");
 }catch (err){
    res.status(400).send(err.message);
 }
});

app.get("/feed",async (req,res)=>{
  try{
    const users = await User.find({});
    res.send(users);
  }
  catch(err){
    res.status(400).send("something went wrong");
  }
});

app.get("/profile",userAuth , async (req,res)=> {
  try{const cookie = req.cookies;
    const {token} = cookie;
    if(!token){
      throw new Error("invalid token");
    }
    const decodedMessage = await jwt.verify(token, "Dev@tinder#123");

    const{ _id} = decodedMessage;
    console.log("logged in user is: "+ _id);
    const user = await User.findById(_id);
    if(!user){
      throw new Error("user not exist ");
    }
    res.send(user);
   }catch(err){
    res.status(400).send("error:"+err.message);
   }
});

app.delete("/users",async(req,res)=>{
   const userId = req.body.userId;
   try{
    const user = await User.findByIdAndDelete(userId);
    res.send("user deleted  successfully");
  }
  catch(err){
    res.status(400).send("something went wrong");
  }
})

app.patch("/users",async(req,res)=>{
   const userId = req.body.userId;
   const data = req.body;
   try{
    await User.findByIdAndUpdate(userId, data);
    res.send("user updated successfully");
  }
  catch(err){
    res.status(400).send("something went wrong");
  }
})

app.post("/login",async (req,res)=>{
  try{
    const {emailId, password} = req.body;
    const user = await User.findOne({emailId:emailId});
    if(!user){
      throw new Error ("credentials not correct");
    }
    const isPasswordValid = user.validatePassword();
    if(isPasswordValid){

      const token = user.getJWT();
      console.log(token);
      res.cookie("token", token);

      res.send("login successful");
    }else{
      throw new Error("wrong credentials");
    }

  }
  catch(err){
    res.status(400).send(err.message);
  }
})



connectDB()
  .then(() => {
    console.log("db connected");
    app.listen(7777, () => {
    console.log("server is successfully listening on port 7777");
       });
  })
  .catch((err) => {
  console.error("DB connection failed:", err);
});




//order is imp  

//ab?c means b is optional
//ab+c means you can include as much b as you want
//ab*cd means you can give anything in between ab and cd
