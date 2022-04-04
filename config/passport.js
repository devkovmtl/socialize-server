const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

// User model
const User = require('../models/user');

const { JWT_SECRET } = process.env;

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

// jwt strategy options
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

const jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findById(payload.id);
    if (!user) {
      return done(null, false);
    } else {
      return done(null, user);
    }
  } catch (error) {
    return done(error, false);
  }
});

// passport configuration
passport.initialize();
passport.use(localLogin);
passport.use(jwtLogin);
