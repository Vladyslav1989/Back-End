const mongoose = require('mongoose');



const ClientSchema = new mongoose.Schema({

  firstName: {
    type: String,    
    required: true,
    trim: true,
    lowercase: true
  },
  lastName: {
    type: String,
    required: true,  
    trim: true,
    uppercase: true,   
    
    },
    phoneNUmber: {
        type: Number,
        required: true,    
        unique: [true, "Duplicate Phone Numbers Not allowed"],
        trim: true,
        uppercase: true
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
  dateofbirth: {
    type: String,    
    required: true,
    trim: true,
    lowercase: true
  },
  adress: {
    type: String,    
    required: true,
    trim: true,
    lowercase: true
  },
  postalcode: {
    type: String,    
    required: true,
    trim: true,
    lowercase: true
  },
 
});

const Client = mongoose.model("Client", ClientSchema);
module.exports = Client;