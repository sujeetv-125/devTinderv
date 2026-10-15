const express = require("express");

const app = express();


app.get("/error",(req,res)=>{
    try{
        //logic of db call
        throw new Error("addda");
        res.send("user daata send");
    }
    catch(err){
        res.status(500).send("something went wrong");
    }
});

const {adminauth,userauth} = require("./auth.js");
app.use ("/admin",adminauth);
app.get("/user/data", userauth, (req,res)=>{
    res.send("user logged ");
});

app.post("/user/data",(req,res)=>{
    res.send("user data send");
})
app.get("/admin/getall", (req,res)=>{
    res.send("all data sent");
});
app.delete("/admin/delall", (req,res)=>{
    res.send("all data del");
});
app.listen(7777, () => {
    console.log("server is successfully listening on port 7777");
});


//order is imp  

//ab?c means b is optional
//ab+c means you can include as much b as you want
//ab*cd means you can give anything in between ab and cd
