const mongoose = require('mongoose');



const UserSchema = new mongoose.Schema({

  password: {
    type: String,    
    required: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,    
    unique: [true, "Duplicate Email Not allowed"],
    trim: true,
    uppercase: true,    
    validate: function(value) {
      var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
      return emailRegex.test(value);
    }
  }, 
  //isVerified: { type: Boolean, default: false },
  isVerifiedPhone: { type: Boolean, default: false },
  phoneNUmber: {
    type: Number,
    required: true,    
    unique: [true, "Duplicate Phone Numbers Not allowed"],
    trim: true,
    uppercase: true
}, 
 
});

const User = mongoose.model("User", UserSchema);
module.exports = User;