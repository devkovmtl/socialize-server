const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const FacebookStrategy = require('passport-facebook').Strategy;

// User model
const User = require('../models/user');

const { JWT_SECRET, FACEBOOK_CLIENTID, FACEBOOK_CLIENTSECRET } = process.env;

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

const facebookLogin = new FacebookStrategy(
  {
    clientID: FACEBOOK_CLIENTID,
    clientSecret: FACEBOOK_CLIENTSECRET,
    callbackURL: 'http://localhost:8080/api/v1/redirect/facebook',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await User.findOne({ facebookId: profile.id });
      // user already exists in db
      if (user) {
        return done(null, user);
      }
      const newUser = await User.create({
        provider: 'facebook',
        facebookId: profile.id,
        username: profile.username ? profile.username : profile.displayName,
        email: profile.emails ? profile.emails[0].value : null,
      });
      return done(null, newUser);
    } catch (error) {
      return done(error, false);
    }
  }
);

// passport configuration
passport.initialize();
passport.use(localLogin);
passport.use(jwtLogin);
passport.use(facebookLogin);
