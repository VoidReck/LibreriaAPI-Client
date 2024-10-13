const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const tokenSchema = new Schema({
    email: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    token: {
        type: String,
        required: true,
        min: 6,
        max: 1024
    },
    active: {
        type: Boolean,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Tokens', tokenSchema);