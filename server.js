if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const {spawn} = require('child_process')
const {fork} = require('child_process')
const initializePassport = require('./passport-config')

initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = []
pass = ""
__dirname = "/Users/jliu/Downloads/LoginConsole/"

app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended:false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname));

app.get('/', checkAuthenticated, (req, res) => {
    res.writeHead(302, {
        Location: "http://localhost:4000/"
    }).end();
})

app.get('/twofa', checkAuthenticated, (req, res) => {
    childPython = spawn('python', ['emailer.py', req.user.email])
    childPython.stdout.on('data', function(data) {
        pass = data.toString();
        console.log(pass)
    });

    res.render('twofa.ejs')
})

app.post('/twofa', checkAuthenticated, (req, res) => {
    let code = req.body.code;

    if (code.trim() == pass.trim() && code.trim() != "") {
        const childConsole = fork("./server/app.js")
        childConsole.on("message", function (message) {
            res.writeHead(302, {
                Location: "http://localhost:4000/"
            }).end();
        })
    }
    else {
        req.logOut()
        res.redirect('login')
    }
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/twofa',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    }
    catch {
        res.redirect('/register')
    }
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}
app.listen(3000)