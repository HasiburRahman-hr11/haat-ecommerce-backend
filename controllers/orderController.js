const Order = require('../models/Order');

// Create New Order
exports.createOrder = async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();

        res.status(201).json(order);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

// Get Single Order
exports.getSingleOrder = async (req, res) => {
    const { id } = req.params;
    try {

        const order = await Order.findById(id)

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            })
        }

        res.status(200).json(order);

    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}


// Get User Orders
exports.getUserOrders = async (req, res) => {
    const { userId } = req.params;
    if (req.user.id === userId || req.user.isAdmin) {
        try {
            const orders = await Order.find({ userId: userId });
            res.status(200).json(orders);
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    } else {
        res.status(401).json({ message: "You are not allowed to perform this action" });
    }
}


// Get All Orders
exports.getAllOrders = async (req, res) => {
    const { latest } = req.query;
    if (req.user.isAdmin) {
        try {

            const orders = latest ? await Order.find().sort({ _id: -1 })
                : await Order.find();

            res.status(200).json(orders);

        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    } else {
        res.status(401).json({ message: "You are not allowed to perform this action" });
    }
}



// Get Monthly Income
exports.getMonthlyIncome = async (req, res) => {
    const thisMonth = new Date();
    const lastMonth = new Date(thisMonth.setMonth(thisMonth.getMonth() - 1));
    const previousMonth = new Date(lastMonth.setMonth(lastMonth.getMonth() - 1));

    if (req.user.isAdmin) {
        try {
            const data = await Order.aggregate([
                { $match: { createdAt: { $gte: previousMonth } } },
                {
                    $project: {
                        month: { $month: "$createdAt" },
                        sales: "$amount"
                    }
                },
                { $group: { _id: "$month", total: { $sum: "$sales" } } }
            ]);

            res.status(200).json(data);
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    } else {
        res.status(401).json({ message: "You are not allowed to perform this action" });
    }
}

// Update order 
exports.updateOrder = async (req, res) => {
    const { orderId } = req.params;
    if (req.user.isAdmin) {
        try {

            const updatedOrder = await Order.findByIdAndUpdate(
                orderId,
                req.body,
                { new: true }
            );

            res.status(200).json(updatedOrder)
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    } else {
        res.status(401).json({ message: "You are not allowed to perform this action" });
    }
}



// Delete Order
exports.deleteOrder = async (req, res) => {
    const { id } = req.params;
    if (req.user.isAdmin) {
        try {
            const order = await Order.findById(id)

            if (!order) {
                return res.status(404).json({
                    message: 'Order not found'
                })
            }
            await Order.findByIdAndDelete(id);

            res.status(200).json(order);

        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    } else {
        res.status(401).json({ message: "You are not allowed to perform this action" });
    }
}



// Delete Many Orders
exports.deleteManyOrders = async (req, res) => {
    if (req.user.isAdmin) {
        try {
            await Order.deleteMany({ _id: { $in: req.body.orderIds } });

            const orders = await Order.find();

            res.status(200).json(orders);

        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    } else {
        res.status(401).json({ message: "You are not allowed to perform this action" });
    }
}




// Get New Orders (last 30 days)
exports.getMonthlySales = async (req, res) => {
    if (req.user.isAdmin) {

        const newOrders = await Order.find(
            {
                "createdAt":
                {
                    $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
                }
            }
        ).sort({ "createdAt": -1 })

        res.status(200).json(newOrders);

    } else {
        res.status(401).json({ message: "You are not allowed to perform this action" });
    }
}