const { Schema, model } = require('mongoose');

const orderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    products: [
        {
            _id: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                default: 1
            },
            info: {
                type: Object
            }
        }
    ],
    billingInformation: {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        email: String,
        company: String,
        address: {
            type: Object,
            required: true
        }
    },
    shippingInformation: {
        firstName: String,
        lastName: String,
        phone: String,
        email: String,
        company: String,
        address: {
            type: Object
        }
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Pending'
    },
    orderNote: {
        type: String
    }

}, { timestamps: true });


const Order = model('Order', orderSchema);
module.exports = Order;