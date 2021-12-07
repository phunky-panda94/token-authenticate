require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);
const database = mongoose.connection;
database.on('error', console.error.bind(console, 'Error connecting to database'));

const User = require('./models/user');

const app = express();
app.use(express.json());

// create routes
app.get('/profile', authenticateToken, (req, res) => {
    res.send(`Successfully logged in.`);
})

app.post('/register', (req,res) => {

    const newUser = new User({
        username: req.body.username,
        password: req.body.password
    })

    newUser.save(err => {
        console.log(err)
    })

    res.status(201).send('Successfully registered');

})

app.post('/login', (req, res) => {
    
    // authenticate user
    User.findOne({ username: req.body.username }, (err, user) => {

        if (err) return res.sendStatus(400);
        if (!user) return res.sendStatus(404);
        if (req.body.password !== user.password) return res.sendStatus(403);

        // if successful, create and return token
        const token = jwt.sign({ username: req.body.username }, process.env.TOKEN_SECRET);
        return res.json(token);

    });
    

})


// middleware function
function authenticateToken(req, res, next) { 
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {

        if (err) return res.sendStatus(403);
        next();

    })
}

app.listen(3000, () => {
    console.log('Listening on port 3000');
})