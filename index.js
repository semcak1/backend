
const express= require("express")
const jwt = require("jsonwebtoken")
// import express from "express";
const app = express()
const port = 3000
app.use(express.json())

const users = [
    {id:0,name:"semih",password:"semih1234",isAdmin:true},
    {id:1,name:"user1",password:"user1234",isAdmin:false}
]


app.get("/users",(req,res)=>{
    console.log("semlsadsd");
    
    res.json (users)
    
    
})

let refreshTokens=[]
console.log("lala Tokens",refreshTokens);
const generateAccessToken=(user)=>{
    return jwt.sign({name:user.name, id:user.id,isAdmin:user.isAdmin},"myAccessTokenSecret",{expiresIn:"50s"})
}

const generateRefreshToken=(user)=>{
    return jwt.sign({name:user.name, id:user.id,isAdmin:user.isAdmin},"myRefreshTokenSecret")
}

app.post("/api/login",(req,res)=>{
    const {name,password}= req.body
    const user= users.find(user => user.name === name && user.password === password)
  
if (!user) {
    res.status(400).json("user bulunamadı")
    return
}

const accessToken = generateAccessToken(user)
const refreshToken =generateRefreshToken(user)
refreshTokens.push(refreshToken)

res.json({
    name:user.name,
    id:user.id,
    isAdmin:user.isAdmin,
    accessToken,
    refreshToken
})
})

app.post("/api/refreshToken",(req,res)=>{
    const refreshToken = req.body?.refreshToken
    if (!refreshToken) {
        res.json("refresh token bulunamadı.")
    }
    if (refreshToken && !refreshTokens.includes(refreshToken) ) {
        res.json("refresh token geçerli değil.")
    }
    jwt.verify(refreshToken,"myRefreshTokenSecret",(err,user)=>{
    if (err) {
        res.json("Refresh token doğrulanırken bir hata oluştu.") 
    }
    refreshTokens =  refreshTokens.filter(refToken=>refToken !== refreshToken)
    const newRefreshToken = generateRefreshToken(user)
    const newAcessToken = generateAccessToken(user)
    refreshTokens.push(newRefreshToken)
    res.json({
        accessToken:newAcessToken,
        refreshToken:newRefreshToken
    })
    })
})



const verify  = (req,res,next)=>{
    const auth  = req.headers.authorization
    console.log("verfiy body",req.body);
    if (auth) {
        const token = auth.split(" ")[1]

        jwt.verify(token,"myAccessTokenSecret",(err,user)=>{

          if (err) {
              return res.status(403).json("Token geçerli değil")
          }
            req.user = user
            next()
      })
    }else {
        res.status(401).json("authantice olamadınız.")
    }
   

}

app.delete("/api/users/:userId",verify,(req,res)=>{
  
    if (req.user.id.toString() === req.params.userId || req.user.isAdmin ) {
        res.json("kullanıcı silindi")

    } else {
        res.json("Kullanıcıyi silmeye  yetkiniz yok ")
    }
})


app.post("/api/logout",verify,(req,res)=>{
    const refreshToken  = req?.body?.refreshToken
    console.log("refreshTokens",refreshTokens);
    console.log("refreshToken",refreshToken);
    console.log("req?.body",req?.body);

    if (refreshTokens.includes(refreshToken)) {
        console.log("refreshTokens",refreshTokens);
        refreshTokens= refreshTokens.filter(refToken => refToken  !==refreshToken )
        console.log("refreshTokens",refreshTokens);

        res.json("Başarıyla çıkış yaptınız.")
    }
    res.json("çıkış yaparken bir haat oluştu")
   }) 


app.listen(port,err => {
    if (err) {
        return console.error(err)
    }
    return console.log(`server ${port} portunda dinlemede`)
})