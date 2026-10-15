const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");


app.post("/signup",async (req,res)=>{
//creating a new instance of the  user model
  const user = new User({
    firstName : "sujeet",
    lastName : "kumar",
    emailId : "somm@gmail.com",
    password: "somee",
    gender: "male"
  });

 try {
     await user.save();
  res.send("user added successfully");
 }catch (err){
    res.status(400).send("error saving the user");
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
    console.log("db cannot be connected");
  });




//order is imp  

//ab?c means b is optional
//ab+c means you can include as much b as you want
//ab*cd means you can give anything in between ab and cd
