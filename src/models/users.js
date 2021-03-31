const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./tasks')


// middleware is a function which gets control during the excution of asynch.. function  it is used on mongoose schema 
// so we are going to make the user model as schema 
const userSchema=new mongoose.Schema({
    name:
    {
        type:String,
        required:true,
        trim:true

    },
    email:
    {
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        Validate(value)
        {
            if(!validator.isEmail(value))
            {
                throw new Error('Email is invalid')
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:6,
        Validate(value)
        {
            if(value.toLowercase().includes('password'))
            throw new Error("password cannot contain password")

        }
    },
    age:
    {
        type:Number,
        required:true,
        default:0
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
    ,avatar:
    {
        type:Buffer
    }
},
{
    timestamps:true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

//instatnce method or method on individual user object
userSchema.methods.generateToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)// this last argument is called secret

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}


// method through which we will not send password ans all other tokens 

userSchema.methods.toJSON=function()
{
    const user=this
    const userObject=user.toObject()//cloning the user object

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject;
}
// schema for findByCredentials

// method on User
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email:email })

    if (!user) {
        throw new Error('Unable to login')
    }
                                         // a hash will be created for password which will be matched with users hash password
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}



// middleware function can be used in two types pre nd post 
// takes 2 argumnets 1 is the name of mongoose method on which we want to use and 2 is function 
//this function is a simple funct because of the binding properties of the arrow funtion
//it takes next as argument ans that next is used for coming out from the function
userSchema.pre('save',async function(next)
{
   const user=this
    // now we are checking if the user was modified or not
    if(user.isModified('password'))
    {
        user.password = await bcrypt.hash(user.password, 8)// creating a hashed passwrd ,2 paramter is the no of time hash algo will run
    }
    next();
})

// deleting a user will also delete its tasks

userSchema.pre('remove',async function(next)
{
    const user=this;
    await Task.deleteMany({ owner: user._id })
    next()
})

//creating a class called user
const User=mongoose.model('User',userSchema)

// // creating an object/instance for class user using constructor function
// const me=new User({ name:'Tanisha',email:'tanisha@gmail.com'})

// // saving using .save which will return a promise
// me.save().then(()=>
// {
//    console.log(me);
// }).catch((error)=>
// {
//     console.log(error);
// })

module.exports=User