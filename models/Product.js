const { Schema, model } = require('mongoose');

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    categories: [String],
    sizes: [String],
    colors: [String],
    regularPrice: {
        type: Number,
        required: true
    },
    salePrice: {
        type: Number
    },
    stock: {
        type: Number
    },
    reviews: [
        {
            name: String,
            email: String,
            review: String,
            rating: Number,
            time: {
                type: Date
            }
        }
    ],
    variation: {
        type: Boolean,
        default: false
    },
    thumbnail: {
        type: String
    },
    gallery: [String],
    inStock: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Product = model('Product', productSchema);
module.exports = Product;