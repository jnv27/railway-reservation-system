if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const { urlencoded } = require('express');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/railway-reservation';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Database connected');
});


const app = express();

app.set('view engine', 'ejs');
app.use(urlencoded({ extended: true }));

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
const sessionConfig = {
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/', (req,res) =>{
    res.render('home');
});

app.get('/register', (req,res) =>{
    res.render('users/register');
});

app.post('/register',async (req,res)=>{
    // res.send(req.body);
    try{
        const {email,username, password} = req.body;
        console.log(req.body);
        const user = new User({email,username});
        const registeredUser = await User.register(user,password);
        let flag = false;
        req.login(registeredUser, (err) =>{
            flag = true;
            if(err){
                console.log(err);
                return next(err);
                
                // res.redirect('/register');
            }
            res.redirect('/');
        })
        console.log(flag);
    }
    catch(e){
        console.log(e);
        res.redirect('register');
    }
});

app.listen(3000, ()=>{
    console.log('Server has started');
});