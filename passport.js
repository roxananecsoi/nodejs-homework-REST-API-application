const passport = require("passport");
const passportJWT = require("passport-jwt");
const User = require("./models/user.js");
require("dotenv").config();

const secret = process.env.TOKEN_SECRET;

const ExtractJWT = passportJWT.ExtractJwt;
const Strategy = passportJWT.Strategy;

const params = {
  secretOrKey: secret,
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
};

passport.use(
  new Strategy(params, function (payload, done) {
    User.findById(payload.userId)
      .then((user) => {
        if (!user) {
          return done(new Error("User not found"), false);
        }
        return done(null, user);
      })
      .catch((err) => done(err, false));
  })
);

module.exports = passport;
