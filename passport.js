const passport = require('passport');
const passwordJWT = require('passport-jwt');
const ExtractJWT = passwordJWT.ExtractJwt;
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = passwordJWT.Strategy;

require('dotenv').config();

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, cb) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return cb(null, false, { message: 'Incorrect email or password.' });
        }

        validatePass = await bcrypt.compare(password, user.password);
        if (!validatePass)
          return cb(null, false, {
            message: 'Incorrect password.'
          });
        else
          return cb(null, user, {
            message: 'Logged In Successfully'
          });
      } catch (err) {
        return cb(err);
      }

      //   return User.findOne({ email })
      //     .then(user => {
      //       if (!user) {
      //         return cb(null, false, { message: 'Incorrect email or password.' });
      //       }

      //       bcrypt
      //         .compare(password, user.password)
      //         .then(validatePass => {
      //           if (!validatePass) {
      //             return cb(null, false, {
      //               message: 'Incorrect password.'
      //             });
      //           }
      //           if (validatePass) {
      //             return cb(null, user, {
      //               message: 'Logged In Successfully'
      //             });
      //           }
      //         })
      //         .catch(err => {
      //           return cb(err);
      //         });
      //     })
      //     .catch(err => {
      //       return cb(err);
      //     });
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.TOKEN_SECRET
    },
    async (jwtPayload, cb) => {
      try {
        const user = await User.findById(jwtPayload.userID);

        if (!user) {
          return cb(null, false);
        } else {
          return cb(null, user);
        }
      } catch (err) {
        return cb(err);
      }
    }
  )
);
