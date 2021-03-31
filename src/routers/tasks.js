const express=require('express')
const Task=require('../models/tasks')
const auth = require('../middleware/auth')
const router = new express.Router()


router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/tasks',auth, async (req, res) => {
    //filtering and pagination and sorting
    // filtering suppose we are asking only for some particular tasks so we are going to give the query string and flter the tasks acc to it
    //pagination is for getting the next pages
    const match={}
    const sort={}

    if(req.query.completed)// if we are providing the query string then filter acc otherwise give all tasks
    {
        match.completed=req.query.completed==='true'// converting string to boolean
    }

    if(req.query.sortBy)
    {
        const parts=req.query.sortBy.split(':')// sort takes 2 parameters 1 is the property using which we sort and 2 is asc(1) or desc(-1)
        sort[parts[0]]=parts[1]==='asc'? 1:-1;
    }

    try {
       // await req.user.populate('tasks').execPopulate()
       await req.user.populate({
           path:'tasks',
           match,
           options:
           {
              //for pagination we use limit and skip keys
              limit:parseInt(req.query.limit),
              skip:parseInt(req.query.skip),
              sort// done for sorting
           }
       }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth,async (req, res) => {
    const _id = req.params.id
    try{

        const task=await Task.findOne({_id,owner:req.user._id})
        if(!task) 
        {
            return res.status(404).send()
        }
        res.status(200).send(task)

    }
    catch(error)
    {
        res.status(500).send()
    }

    
})

router.patch('/tasks/:id', auth,async (req, res) => {
    // using this so that we can see if the request contains an unknown resource 
    const updates = Object.keys(req.body)
    const allowedUpdates = ['completed','description']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try 
    {
       // new is for allowing new user creation runvalidators allow us to use validation on the new user
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        //or we can do
        // we are finding the particular task then we will dynamically change the value of the key which we will get from the key in update 

        const task=await Task.findOne({_id:req.params.id,owner:req.user._id});
        if (!task) {
            return res.status(404).send()
        }
        updates.forEach((update)=> task[update]=req.body[update])
        await task.save()
    
        res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

  
router.delete('/tasks/:id',auth,async (request,response)=>
{
    try{
      const task=await Task.findOneAndDelete({_id:request.params.id,owner:request.user._id});

      if(!task)
      return response.status(400).send()
      response.send(task)
    }
    catch(error)
    {
        response.status(500).send()
    }

})

module.exports=router