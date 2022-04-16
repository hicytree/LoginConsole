const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email)
        console.log("hello")
        if (user == null) {
            return done(null, false, {message: 'No user with that email.'})
        }

        try {
            if (password == user.code) {
                return done(null, user)
            } 
            else {
                return done(null, false, {message: 'Code incorrect.'})
            }
        }
        catch (e) {
            return done(e)
        }
    }

    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    })
}

module.exports = initialize