var passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
var UsersModel = require("../models/users.model");
const bcrypt = require("bcryptjs");
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    (username, password, done) => {
      UsersModel.findOne({ username: username }, (err, user) => {
        if (err) return done(err);
        if (!user) {
          return done(null, false, {
            message: "Invalid username or password!",
            from: "LOGIN",
          });
        }
        bcrypt.compare(password, user.passwordHash).then((res) => {
          if (!res) {
            return done(null, false, {
              message: "Invalid username or password!",
              from: "LOGIN",
            });
          }
          if (user.status === false) {
            return done(null, false, {
              message:
                "Tài khoản đã bị vô hiệu hoá, hãy liên hệ với quản trị viên để biết thêm chi tiết!",
              from: "LOGIN",
            });
          }
          return done(null, user);
        });
      });
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "secretKey",
    },
    function (jwtPayload, next) {
      return UsersModel.findOne(
        { username: jwtPayload.username },
        (err, user) => {
          if (err) return next(err);
          if (user) return next(null, user);
          else return next(null, false);
        }
      );
    }
  )
);
