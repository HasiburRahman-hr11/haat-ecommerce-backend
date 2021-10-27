const { Schema, model } = require('mongoose');

const catSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique:true
    },
    description: {
        type: String
    },
    products: [
        {
            type:Schema.Types.ObjectId,
            ref:'Product'
        }
    ],
    thumbnail: {
        type: String
    }
});


const Category = model('Category', catSchema);
module.exports = Category;