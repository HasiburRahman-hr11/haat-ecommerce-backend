const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Register New User
exports.signUpControl = async (req, res) => {
    const { firstName, lastName, email, password, isAdmin } = req.body;
    try {

        const userExist = await User.findOne({ email: email });

        if (userExist) {
            return res.status(403).json({ message: 'There is already an account with this email.' })
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            isAdmin: isAdmin
        });

        await newUser.save();

        res.status(201).json(newUser);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Couldn\'t Sign Up, Try Latter!' })
    }
}


// Login New User
exports.signInControl = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(401).json({ message: 'Invalid Email Address' })

        const matchPassword = await bcrypt.compare(req.body.password, user.password);
        if (!matchPassword) return res.status(401).json({ message: 'Wrong Password' });

        const accessToken = jwt.sign(
            {
                id: user._id,
                isAdmin: user.isAdmin
            },
            process.env.JWT_SECRET,
            { expiresIn: "20s" }
        )

        const { password, ...other } = user._doc;
        res.status(200).json({ ...other, accessToken });

    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}