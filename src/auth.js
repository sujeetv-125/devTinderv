const adminauth = (req,res,next)=>{
    const token ="xyzadbddddjdj";
    const isAdmin = token === "xyzadbddddjdj";
    if(!isAdmin){
        return res.status(401).send("unauth access");
    }else {
        next();
    }
};

const userauth = (req,res,next)=>{
    const token ="xyzadbddddjdj";
    const isAdmin = token === "xyzadbddddjdj";
    if(!isAdmin){
        return res.status(401).send("unauth access");
    }else {
        next();
    }
};

module.exports ={
    adminauth,userauth
}