const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const user = require("./models/user");
const {validateSignUpData } = require("./utils/validations");
const bcrypt = require("bcrypt");

app.use(express.json());
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
    const isPasswordValid = await bcrypt.compare(password,user.password);
    if(isPasswordValid){
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
