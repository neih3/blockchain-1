const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const saltRounds = 10;

const UserSchema = mongoose.Schema(
  {
    username: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true },
    passwordHash: String,
    privateKey: String, //
    publicKey: String, //
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.setPasswordHash = function (password) {
  this.passwordHash = bcrypt.hashSync(password, saltRounds);
};

UserSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.passwordHash);
};

const Users = mongoose.model("Users", UserSchema);
module.exports = Users;
