const mongoose = require('mongoose');
const { Schema } = mongoose;
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true },
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true, minLength: 8, select: false},
  avatarUri: {type: String, required: true},
  birthDate: {type: Date, required: true},
  creationDate: {type: Date, default: Date.now}
})

userSchema.plugin(uniqueValidator)

module.exports = mongoose.model('User', userSchema);