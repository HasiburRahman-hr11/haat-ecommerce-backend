const jwt = require('jsonwebtoken');

const verifyToken = (req,res,next) =>{
    const token = req.headers.token;
    if(token){
        jwt.verify(token , process.env.JWT_SECRET , (err , payload) =>{
            if(err) return res.status(403).json({message:"Invalid Token"});

            req.user = payload;
            next()
        })
    }else{
        return res.status(401).json({message:"You are an unauthenticated user"})
    }
}

module.exports = {verifyToken};