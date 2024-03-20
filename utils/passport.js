var passport = require("passport");
var User = require("../api/user/user.model");
var JwtStrategy = require("passport-jwt").Strategy;
var ExtractJwt = require("passport-jwt").ExtractJwt;
require("dotenv").config();

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

passport.use(
 new JwtStrategy(opts, (jwt_payload, done) => {
  User.findById(jwt_payload.id)
   .then(function (user) {
    if (user) {
     if (user.isEnabled === false) {
      return done(null, false);
     }
     return done(null, user);
    } else {
     return done(null, false);
    }
   })
   .catch(function (err) {
    return done(err, false);
   });
 })
);

module.exports = passport;
