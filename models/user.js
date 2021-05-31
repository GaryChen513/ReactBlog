const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    password: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: Number, default: 2 }, // 1 - admin, 2 - user
  },
  { timestamps: true }
);

userSchema.pre('save', async function save(next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    return next();
  } catch (err) {
    return next(err);
  }
})


module.exports = model("User", userSchema);
