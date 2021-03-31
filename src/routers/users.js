const express=require('express')
const User=require('../models/users')
const auth = require('../middleware/auth')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')
const multer=require('multer')
const sharp = require('sharp')
const router = new express.Router()

// here we are using router for increasing the efficiency of the code

// router.post('/users', async (req, res) => {
//     const user = new User(req.body)

//     try {
//         await user.save()
//         sendWelcomeEmail(user.email, user.name)
//         const token = await user.generateToken()
//         res.status(201).send({ user, token })
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

// creation for /user/login
router.post('/users/login',async (req,res)=>
{
    try
    {
        // for checking the password while logging in
       const user=await User.findByCredentials(req.body.email,req.body.password)
       // for creation of jwt
      const token=await user.generateToken()

       res.send({user,token})
    }
    catch(error)
    {
        res.status(400).send()
    }
})

//logout a single user

router.post('/users/logout',auth, async (req,res)=>
{
   try
   {
      req.user.tokens=req.user.tokens.filter((single_token)=>
    {
        return single_token.token!==req.token
    })

    await req.user.save()
    res.send()
   }
   catch(error)
   {
           res.status(500).send()
   }
  

})

    //logging out from all the sessions of a user
    router.post('/users/logoutAll',auth, async (req,res)=>
    {
          try{
                   req.user.tokens=[];
                  await req.user.save()
                  res.send();
                  
          }
          catch(error)
          {
              res.status(500).send()
          }
    })

// getting the logged in user with authentication
router.get('/users/me',auth,async (request, response)=>
{
      response.send(request.user)


})

    
// updating the user singular method i.e logged user

router.patch('/users/me',auth, async (req, res) => {
    // using this so that we can see if the request contains an unknown resource 
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try 
    {

        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})

//deleting the logged user
router.delete('/users/me',auth,async (req,res)=>
{
    try{ 
     await req.user.remove()
      sendCancelationEmail(req.user.email, req.user.name)
     res.send(req.user)
    }
    catch(error)
    {
        res.status(500).send()
    }

})


// middleware for multer
const upload=multer(
    {
        //dest:'avatar',// it is for the destination
        limits:
        {
            fileSize:1000000
        },
        fileFilter(req,file,callback)//file is the object it is the file uploaded
        {
                  if(!file.originalname.match(/\.(jpg|png|jpeg)$/))//regular exp
                 return  callback(new Error('file should be image'))
                  callback(undefined,true)//1 param is error 2 is boolean
        }
    }
)
// upload.single checks the key has the same name as provided inside single()
// setting the image height etc using sgarp npm module
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()// all pics to png and size is given
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})


// deleting the pic

router.delete('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>
{
    req.user.avatar=undefined
    await req.user.save()
    res.send()

})
// reading the pic of a particular user using id
router.get('/users/:id/avatar',async (req,res)=>
{
    try{
    const user=await User.findById(req.params.id)
    if(!user||!user.avatar)
    throw new Error('no user')

    res.set('Content-Type','image/png')// set method is used for setting the response header
    res.send(user.avatar)
}
catch(error)
{
    res.status(400).send()
}

})


module.exports = router


// router.delete('/users/:id',async (request,response)=>
// {
//     try{
//       const user=await User.findByIdAndDelete(request.params.id);

//       if(!user)
//       return response.status(400).send()
//       response.send(user)
//     }
//     catch(error)
//     {
//         response.status(500).send()
//     }

// })


// updating the user singular method

// router.patch('/users/:id', async (req, res) => {
//     // using this so that we can see if the request contains an unknown resource 
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['name', 'email', 'password', 'age']
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

//     if (!isValidOperation) {
//         return res.status(400).send({ error: 'Invalid updates!' })
//     }

//     try 
//     {
//        // new is for allowing new user creation runvalidators allow us to use validation on the new user
//         //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

//         const user = await User.findById(req.params.id)

//         updates.forEach((update) => user[update] = req.body[update])
//         await user.save()

//         if (!user) {
//             return res.status(404).send()
//         }

//         res.send(user)
//     } catch (error) {
//         res.status(400).send(error)
//     }
// })



// reading the resource using get
// reading plural resources
// reading single profile i.e me after middleware authentication
//no need to pass anythig since all errors will be handled inside auth.js

// reading single resource

//:id id called the route parameter it is one of the dynmaic proprtty of express

// router.get('/users/:id',(request,response)=>
// {    
//       // params is provided by express to get the dynamic route 
//       const id=request.params.id;// whatever we passed in the request
//       //User.findOne({}).Promise
//       User.findById(id).then((user)=>
//       {  
//          // mongoose will always provide the id whether it matches or not so we need to tackle that case in then function
//          if(!user)
//          {
//             return response.status(404).send()//data not found error
//          }
//          response.send(user);

//       }).catch((error)=>
//       {
//          response.status(404).send(error)// error for data not found
//       })

//       // User.findOne({name:id}).then((user)=>
//       // {  
//       //    // mongoose will always provide the id whether it matches or not so we need to tackle that case in then function
//       //    if(!user)
//       //    {
//       //       return response.status(404).send()//data not found error
//       //    }
//       //    response.send(user);

//       // }).catch((error)=>
//       // {
//       //    response.status(404).send(error)// error for data not found
//       // })
// })
// router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>
// {
//        req.user.avatar=req.file.buffer;// 1 req.user is for authentication which is coming from auth, 2 is coming from router handleri.e from req,res func
//        await req.user.save()
//        res.send()
// },(error,req,res,next)=>
// {
//     res.status(400).send({error:error.message})
// })