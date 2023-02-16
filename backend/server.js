const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer')
const cors = require('cors');
require("dotenv").config()
const bcrypt = require('bcrypt');
const sharp = require('sharp');
const Mailgen = require('mailgen');
const fs = require('fs');
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose');
const User = require('./userModel')
const generateToken = require('./tokenGenerate');

// console.log(process.env.PORT)

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/users')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = process.env.IMAGE + Date.now() + '-' + Math.round(Math.random() * 1E9)
        const name = file.originalname.split(' ').join('').split('-').join('').split('/').join('')
        cb(null, uniqueSuffix+name)
    }
})

const upload = multer({ storage : storage })

const app = express();
app.use(cors())
app.use(express.json())

app.use('/images', express.static('images'))

const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

async function matchPassword(password, Password){
    return await bcrypt.compare(password, Password)
}

async function authorize(token){
    const user = jwt.verify(token, process.env.SECRET_KEY)
    return user
}

async function sendTempMail(user){
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_ID,
            pass: process.env.EMAIL_PASS
        }
    });
    let mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'Mailgen',
            link: 'https://mailgen.js/',
            logo: 'https://memasik.app/img/memasik-logo.png'
        }
    });
    let response = {
        body:{
            name: `${user.name}`,
            intro: `Welcome to Amaze-on. We're thrilled to have one more who sues us for fraudulent`,
            action:{
                instruction:`To really know about us or confirm your doubts please click here`,
                button:{
                    color:'#372173',
                    text:'ClickBait',
                    link:'https://i.kym-cdn.com/photos/images/original/000/041/494/1241026091_youve_been_rickrolled.gif'
                }
            },
            outro:'Still Need help? Just cry yourselves'
        }
    }


    let mail = mailGenerator.generate(response)
    let message = {
        from: '"Amaze-On" <amaze-on@gmail.com>',
        to: `${user.email}`,
        subject: "Order Confirmation",
        html: mail
    }
    await transporter.sendMail(message).then(()=>{
        return true
    }).catch(err=>{
        console.log(err.message)
        return false
    })
}

mongoose.set('strictQuery', true)

try{
    mongoose.connect(process.env.MONGO_URL, connectionParams)
    .then(()=>{
        console.log("Connected to MongoDB")
    })
}catch(err){
    console.error(err.message)
}

app.get('/', (req, res)=>{
    res.send("<h1>Hello world!</h1>")
})

app.post('/signup', upload.single("image"), async (req, res)=>{    // we give uploads.single() because we want to handle only single files
    //  here we gave "image" inside because it denotes the name of the input tag where we get the image input

    console.log(req.body)

    if(!req.body.name || !req.body.password || !req.body.email){
        res.status(403).json({data:"Please Enter all credentials"})
    }
    const userExist = await User.findOne({email:req.body.email})
    if(userExist){
        res.status(400).json({data:"User already exists"})
    }

    try{
        let {name, email, password} = req.body
        const hashedPassword= await bcrypt.hash(password, 10)
        const token = generateToken(email)
        let image = req.file.filename
        let user = new User({name, email, password:hashedPassword, image, authToken:token})
        user.save()
        res.status(201).json({name, email, image})
    }
    catch(err){
        res.status(400).json({data:"Error while creating user"})
        console.log(err.message)
    }
    
})   

app.post('/login', async (req, res)=>{

    const {email, password} = req.body

    if(!req.body.password || !req.body.email){
        res.status(403).json({data:"Please Enter all credentials"})
    }

    const user = await User.findOne({email})

    if(!user){
        res.status(404).json({data: "User not found"})
    }
    else{
        if (await matchPassword(password, user.password)){
            res.status(201).json(user)
            //  remember to save the user in the local storage when the data is returned
        }
        else{
            res.status(200).json({data: "Wrong Password"})
        }
    }
})

app.post('/orderplaced', async (req, res)=>{
    const user = req.body
    await sendTempMail(user)
    res.status(200).json({data:"Mail sent successfully"})
})

app.listen(process.env.PORT, ()=>{
    console.log("Started Server on port " + process.env.PORT)
})