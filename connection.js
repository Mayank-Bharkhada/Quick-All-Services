const mongoose = require("mongoose");
const express = require("express");
const app = new express();


const port = process.env.PORT || 5000


        mongoose.connect("mongodb://localhost:27017/USER",{
        useNewUrlParser:true});

const validator = require("validator");

const UserSchema = new mongoose.Schema({
        User_name:{
             type:String,
             required:true,
             minlength:3
        },
        Degree:{
             type:String,
             required:true,
        },
        Mobile_number:{
             type:Number,
             required:true,
             unique:true
        },
        Experience:{
             type:String,
             required:true
            },
        Email_address:{
             type:String,
             required:true,
             unique:[true, "email is already present"]
         },
        City:{
                type:String,
                required:true
        },
        Info_text:{
                type:String,
                required:false
        }
});

const User = new mongoose.model('User',UserSchema);

UserSchema.methods.generateAuthtoken = async function(){
try{
const token = await  jwt.sign({AGE:1},"abcdefghijklmnopqrstuvwxyzabcdef");
console.log(token);
}catch(e){
console.log(e);
}
}

app.get('/',(req.res)=>{

});
