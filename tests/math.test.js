const {add}=require('../src/math')

// jest knows when itt is an asynchronous function with the help of async keyword
test('add 2 numbers',async ()=>
{
     const sum=await add(1,2)
     expect(sum).toBe(3);
})
// another method

test('string or msg to be writen' , (done)=>
{

    add(3,2).then((value)=>
    {
        expect(value).toBe(5)
        done()// it is the method which lets jest know that it is an asynch.. func otherwise jest will ignore the func and pass it successfully
    })
})

// we created a test.env so that we can check endpoints for rest api with dummy data in new db 
// we added env cmd to it 
//jest use jestDom which uses the testing on browser like enviornment 
//we have to write node in the dependency of the jest proprty so that it can run for the enviromnet provided by node
//i.e we are configuring jest to work with node 
//supertest library used for testing express apps
//supertest does not require app.listen means it does not need our server up and running