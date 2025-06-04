const mongoose = require('mongoose');
const isEmail = require('is-email');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        return isEmail(email);
      },
      message: 'Please provide a valid email address'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
