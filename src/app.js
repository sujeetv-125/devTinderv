const express = require("express");

const app = express();
//this will only handle get call to /user
app.get("/user",(req,res)=> {
    res.send({firsName: "sujeet", lastname: "kumar"});
});
app.post("/user",(req,res)=> {
    res.send("posted succesfully");
});

app.delete("/user",(req,res)=> {
    res.send("deleted succesfully");
});
//this will match all the http method api calls to /test
app.use("/test" , (req, res) => {
    res.send("hello from the server !");
});

app.listen(7777, () => {
    console.log("server is successfully listening on port 7777");
});


//order is imp  

//ab?c means b is optional
//ab+c means you can include as much b as you want
//ab*cd means you can give anything in between ab and cd
