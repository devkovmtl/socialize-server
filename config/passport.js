const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// User model
const User = require('../models/user');

// Options for local strategy
const localOptions = {
  usernameField: 'username',
  passwordField: 'password',
  session: false,
};

// Local Strategy to authenticate user with username and password
const localLogin = new LocalStrategy(
  localOptions,
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, { message: 'Incorrect username' });
      }
      // check if password is correct
      if (!(await user.matchesPassword(password))) {
        return done(null, false, { message: 'Incorrect credentials' });
      }
      // everything is ok
      return done(null, user);
    } catch (error) {
      return done(error);
    }
    y;
  }
);

// passport configuration
passport.initialize();
passport.use(localLogin);
