require('dotenv').config();
const express = require('express');
const massive = require('massive');
const session = require('express-session');
const { PORT, CONNECTION_STRING, SESSION_SECRET } = process.env;
const app = express();
const authCtrl = require('../controllers/authController');


// Top level middleware
app.use(express.json())
app.use(session({
    secret: SESSION_SECRET,
    resave: true,
    saveUninitialized: false
}))


// Endpoints
app.post('/auth/register', authCtrl.register);
app.post('/auth/login', authCtrl.login);




massive(CONNECTION_STRING)
    .then(db => {
        app.set('db', db);
        console.log('Database hooked UP')
        app.listen(PORT, () => console.log(`Cracker on port ${PORT}`))
    })
