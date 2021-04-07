const request=require('supertest')
const app=require('../src/app.js')
const User=require('../src/models/users')

const userOne = {
    name: 'Mike',
    email: 'mike@example.com',
    password: '56what!!'
}
// before each runs before every jest it is asynchronous..
beforeEach(async () => {
    await User.deleteMany()
    await new User(userOne).save()
})


//making an http request using supertest
test('making a post request',async ()=>
{
    //in request app is running and we are sending the data directly in send
    await request(app).post('/users').send({

    name:'amisha',
    password:'amisha123',
    age:20,
    email:'amisha@gmail.com'
}).expect(201)
})

test('Should login existing user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
})

test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'thisisnotmypass'
    }).expect(400)
})
// when we make the same user again it shows error which is correct because we provided unique in the user model but our case here is only to test 
// that is why we created a dummy db and we will keep on deleting the data to check it again

