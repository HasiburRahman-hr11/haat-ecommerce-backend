const User = require('../models/User');
const bcrypt = require('bcrypt');


// Update User
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, currentPassword, newPassword } = req.body;
    if (req.user.id === id || req.user.isAdmin) {
        try {

            const user = await User.findById(id);
            if (!user) return res.status(401).json({ message: 'Invalid Email Address' });

            const matchPassword = await bcrypt.compare(currentPassword, user.password);
            if (!matchPassword) return res.status(401).json({ message: 'Wrong Password' });

            const hashedPassword = await bcrypt.hash(newPassword, 12);

            const userData = {
                firstName,
                lastName,
            }
            if (newPassword) {
                userData.password = hashedPassword
            }

            const updatedUser = await User.findByIdAndUpdate(id, {
                $set: userData
            }, { new: true });

            res.status(200).json(updatedUser);

        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    } else {
        res.status(401).json({ message: "You are not allowed to perform this action" });
    }
}


// Delete an User
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    if (req.user.id === id || req.user.isAdmin) {
        try {
            const user = await User.findById(id);
            if (!user) return res.status(401).json({ message: 'No user found' });

            await User.findByIdAndDelete(id)

            res.status(200).json(user);

        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    } else {
        res.status(401).json({ message: "You are not allowed to perform this action" });
    }

}


// Delete Many Orders
exports.deleteManyUsers = async (req, res) => {
    if (req.user.isAdmin) {
        try {
            await User.deleteMany({ _id: { $in: req.body.userIds } });

            const users = await User.find();

            res.status(200).json(users);

        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    } else {
        res.status(401).json({ message: "You are not allowed to perform this action" });
    }
}


// Get All Users
exports.getAllUsers = async (req, res) => {
    const { latest } = req.query
    if (req.user.isAdmin) {
        try {
            const users = latest ? await User.find().sort({ _id: -1 }).limit(10)
                : await User.find();

            res.status(200).json(users);
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    } else {
        res.status(401).json({ message: "You are not allowed to perform this action" });
    }
}


// Get Single User
exports.getSingleUser = async (req, res) => {
    const { id } = req.params;
    if (req.user.id === id || req.user.isAdmin) {

        try {
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({
                    message: 'User not found!'
                })
            }
            res.status(200).json(user);
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }

    } else {
        res.status(401).json({ message: "You are not allowed to perform this action" });
    }
}


// Get User Stats
exports.getUserStats = async (req, res) => {
    const today = new Date();
    const lastYear = new Date(today.setFullYear(today.getFullYear() - 1));

    if (req.user.isAdmin) {
        try {

            const data = await User.aggregate([
                { $match: { createdAt: { $gte: lastYear } } },
                { $project: { month: { $month: "$createdAt" } } },
                { $group: { _id: "$month", total: { $sum: 1 } } }
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



// Get New Users (last 30 days)
exports.getNewUsers = async (req, res) => {
    if (req.user.isAdmin) {

        const newUsers = await User.find(
            {
                "createdAt":
                {
                    $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))
                }
            }
        ).sort({ "createdAt": -1 })

        res.status(200).json(newUsers);

    } else {
        res.status(401).json({ message: "You are not allowed to perform this action" });
    }
}