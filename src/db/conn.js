const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/week27").then(()=>{
    console.log("Connection successfull");
}).catch((error)=>{
    console.log("NO connection");
    console.log(error);
})