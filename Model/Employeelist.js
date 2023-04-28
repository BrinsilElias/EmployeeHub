const mongoose = require('mongoose')

const employeeSchema = new mongoose.Schema(
    {
        name: String,
        username: String,
        email: String,
        designation: String,
        location: String,
        salary: String
    }
)

const employeeModel = mongoose.model(
    "Employees", employeeSchema
)

module.exports = {employeeModel}