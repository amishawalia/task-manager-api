const mongoose=require('mongoose')
const validator=require('validator')

const url=process.env.MONGODB_URL

mongoose.connect(process.env.MONGODB_URL,{useUnifiedTopology:true,useNewUrlParser:true,useCreateIndex:true,useFindAndModify:true})







