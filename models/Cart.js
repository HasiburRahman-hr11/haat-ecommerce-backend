const { Schema, model } = require('mongoose');

const cartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique: true
    },
    products: [
        {
            _id: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: 'Product'
            },
            quantity: {
                type: Number,
                default: 1
            },
            info: {
                type: Object
            }
        }
    ]
}, { timestamps: true });


const Cart = model('Cart', cartSchema);
module.exports = Cart;