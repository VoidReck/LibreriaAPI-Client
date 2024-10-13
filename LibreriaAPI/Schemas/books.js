const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const bookSchema = new Schema({
    title: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    author: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    publishedYear: {
        type: String,
        required: true,
        min: 4,
        max: 4
    },
    status: {
        type: String,
        required: true,
        enum: ['disponible', 'reservado'],
        default: 'disponible'
    }
})

module.exports = mongoose.model('Books', bookSchema);