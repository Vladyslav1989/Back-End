const mongoose = require('mongoose');



const DoctorSchema = new mongoose.Schema({

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
    Specialist: {
        type: String,    
        required: true,
        trim: true,
        lowercase: true
    },
    //// time table fro days of the week 
  Monday:{
           
    start: { type: Number  ,defult:0 ,require},
    end: { type: Number,defult:0,require },
    },

    Tuesday:{

        start: { type: Number  ,defult:0,require},
        end: { type: Number,defult:0 ,require},
    },
    Wednesday:{

        start: { type: Number ,defult:0 ,require},
        end: { type: Number ,defult:0,require},
    },
    Thursday:{

        start: { type: Number  ,defult:0,require},
        end: { type: Number ,defult:0,require},
    },
    Friday:{

        start: { type: Number ,defult:0 ,require},
        end: { type: Number ,defult:0,require},
    },
    Saturday:{

        start: { type: Number ,defult:0 ,require},
        end: { type: Number ,defult:0,require},
    },
    Sunday:{

        start: { type: Number  ,defult:0,require:true}, // cahge regure to true
        end: { type: Number ,defult:0,require:true},
    }, 
    ///shedule 
    Shedule: [{        
        _id: { type: Date,require:false}, //unique: [true, "Duplicate Date Not allowed"],
        Booked:
           [{
           start: { type: Number ,defult:0 ,require:false},
           end: { type: Number ,defult:0,rquire:false},
           Client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ClientID'
          },
         
           }]     

    ,
    }]         
 
});

const Doctor = mongoose.model("Doctor", DoctorSchema);
module.exports = Doctor;