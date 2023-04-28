const port = 8080
const cors = require('cors')
const path = require('path')
const express = require('express')
const jwt = require('jsonwebtoken')
const bodyparser = require('body-parser')

const app = express()
app.use(express.urlencoded({ extended: true }));

app.use(cors())
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))

require('./Connection/connection.js')
const { userModel } = require('./Model/User.js')
const { employeeModel } = require('./Model/Employeelist.js')

app.use(express.static(path.join(__dirname,'/build')));
app.get('/*', function(req, res){
    res.sendFile(path.join(__dirname,'/build/index.html')); 
});

app.get('/', (req, res) => {
    res.json("Server is working")
})

// User Login 
app.post('/api/login', async (req, res) => {
    let email = req.body.email
    let password = req.body.password

    let user = await userModel.findOne({"email": email})
    if(user && password == user.password) {
        const userData = {
            "id": user._id,
            "username": user.username,  
            "role": user.role
        }
        jwt.sign({email: user.email, id: user._id}, "employeedb", {expiresIn: "1d"}, (error, token) => {
            if(error){
                res.json({status: "Token not Generated"})
            }else{
                res.json({status: "Authentication Successful", userData: userData, token: token})
            }
        })
    }else{
        res.json("Authentication Failed")
    }
})

app.post('/api/signup', async (req, res) => {
    let data = new userModel(req.body)
    data.save(
        res.json({status: 'Registered Successfully'})
    )
})

// Retrieve Items
app.post('/api/viewall', async (req, res) => {
    let data = await employeeModel.find()
    try {
        let decoded = await jwt.verify(req.body.token, "employeedb")
        if(decoded && decoded.email){
            res.json(data)
        }else{
            res.json({status: "Unauthorized Access"})
        }
    } catch (err) {
        res.json({status: "Unauthorized Access"})
    }
})

// Delete item
app.post('/api/:id/delete', async (req, res) => {
    const id = req.params.id
    try {
        let decoded = await jwt.verify(req.body.token, "employeedb")
        if(decoded && decoded.email){
            const data = await employeeModel.findByIdAndDelete(id)
            res.json({status: "Data Deleted"})
        }
    } catch (err) {
        res.json({status: "Unauthorized Access"})
    }
})

// Edit item
app.post('/api/:id/edit', async (req, res) => {
    const id = req.params.id
    try {
        let decoded = await jwt.verify(req.body.token, "employeedb")
        if(decoded && decoded.email){
            let empdata = await employeeModel.findOneAndUpdate({"_id": id}, req.body) 
            res.json({status: "Data Edited"})
        }
    } catch (err) {
        res.json({status: "Unauthorized Access"})
    }
})

// Add item
app.post('/api/add', async (req, res) => {
    const data = new employeeModel(req.body)
    try {
        let decoded = await jwt.verify(req.body.token, "employeedb")
        if(decoded && decoded.email){
            data.save()
            res.json({status: "Data Saved"})
        }
    } catch (err) {
        res.json({status: "Unauthorized Access"})
    }
})

app.listen(port, () => {
    console.log(`app running on port http://localhost:${port}`)
}) 