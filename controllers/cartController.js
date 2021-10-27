const Cart = require('../models/Cart');
const User = require('../models/User');

// Add to Cart 
exports.addToCart = async (req, res) => {
    const { userId } = req.params;
    const { quantity, productId, color, size } = req.body;

    if (req.user.id === userId) {
        try {
            const cartProduct = {
                _id: productId,
                quantity: quantity,
                info: {
                    color: color,
                    size: size
                }
            }

            // Check if there is any cart with this user id
            const oldCart = await Cart.findOne({ userId: userId });

            if (oldCart) {

                // Check if current product is in the cart
                const productExistInOldCart = await Cart.findOne({ userId: userId, "products._id": productId });


                let updatedCart;
                if (productExistInOldCart) {

                    let oldQuantity;

                    productExistInOldCart.products.forEach(product => {
                        if (product._id.toString() === productId) {
                            oldQuantity = product.quantity
                        }
                    });


                    await Cart.updateOne(
                        { userId: userId, "products._id": productId },
                        {
                            $set:
                            {
                                "products.$.quantity": quantity + oldQuantity,
                                "products.$.info": { size, color }
                            }
                        },
                        { new: true }
                    )




                    updatedCart = await Cart.findOne({ userId: userId })
                } else {
                    updatedCart = await Cart.findOneAndUpdate(
                        { userId: userId },
                        { $push: { products: cartProduct } },
                        { new: true }
                    )

                }

                res.status(201).json(updatedCart)

            } else {
                const newCartProducts = [cartProduct]
                const newCart = new Cart({
                    userId: userId,
                    products: newCartProducts
                });

                await newCart.save();

                res.status(201).json(newCart);
            }
        } catch (error) {
            console.log(error);
            res.status(500).json(error)
        }
    } else {
        res.status(401).json({ message: "You are not allowed to perform this action" });
    }
}


// Update Cart
exports.updateCart = async (req, res) => {
    const { userId } = req.params;
    const { items } = req.body;
    if (req.user.id === userId) {
        try {

            const cart = await Cart.findOne({ userId: userId });

            if (!cart) {
                return res.status(404).json({ message: 'No Cart Found' })
            }

            const updatedCart = await Cart.findOneAndUpdate(
                { userId: userId },
                { products: items },
                { new: true }
            );
            res.status(200).json(updatedCart);

        } catch (error) {
            console.log(error);
            res.status(500).json(error)
        }
    } else {
        res.status(401).json({ message: "You are not allowed to perform this action" });
    }
}



// Remove Cart
exports.removeFullCart = async (req, res) => {
    const { userId } = req.params;
    if (req.user.id === userId || req.user.isAdmin) {
        try {
            const cart = await Cart.findOneAndDelete({ userId: userId });
            res.status(200).json({ message: 'Cart is deleted' })
        } catch (error) {
            console.log(error);
            res.status(500).json(error)
        }
    } else {
        res.status(401).json({ message: "You are not allowed to perform this action" });
    }
}

// Remove Single Item from a cart
exports.removeSingleItem = async (req, res) => {
    const { userId } = req.params;
    const { productId } = req.body;
    if (req.user.id === userId || req.user.isAdmin) {
        try {
            const updatedCart = await Cart.findOneAndUpdate(
                { userId: userId },
                { $pull: { products: { _id: productId } } },
                { new: true }
            );

            res.status(200).json(updatedCart)
        } catch (error) {
            console.log(error);
            res.status(500).json(error)
        }
    } else {
        res.status(401).json({ message: "You are not allowed to perform this action" });
    }
}



// Get Cart by User _id
exports.getCart = async (req, res) => {
    const { userId } = req.params
    if (req.user.id === userId) {
        try {

            const cart = await Cart.findOne({ userId: userId });
            if (!cart) {
                return res.status(404).json({ message: 'No cart found' })
            }

            res.status(200).json(cart);
        } catch (error) {
            console.log(error);
            res.status(500).json(error)
        }
    } else {
        res.status(401).json({ message: "You are not allowed to perform this action" });
    }
}