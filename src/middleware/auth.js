const jwt = require('jsonwebtoken')
const User = require('../models/users')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')// getting the req  header 
        const decoded = jwt.verify(token, process.env.JWT_SECRET)//verifying the header
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })// checking if it is present in user

        if (!user) {
            throw new Error()
        }
        req.token=token
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = auth