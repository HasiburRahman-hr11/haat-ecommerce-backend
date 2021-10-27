const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');


const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(cors());
app.use(express.static('public'));


// Using Routes
const useRoutes = require('./routes/routes');
useRoutes(app);

app.get('/', (req,res)=>{
    res.send('Server is Runninggggggg')
})

const PORT = process.env.PORT || 8000
mongoose.connect(process.env.DBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is connected at http://localhost:${PORT}`);
        });
    })
    .catch(error => {
        console.log(error);
    })


