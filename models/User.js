const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        min: 6
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });


const User = model('User', userSchema);
module.exports = User;