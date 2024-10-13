const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    email: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    password: { 
        type: String,
        required: true,
        min: 6,
        max: 1024
    }
})

module.exports = mongoose.model('Users', userSchema);