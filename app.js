 const express = require ('express');
 const app = express();
 const bodyParser = require('body-parser');
 const port = process.env.PORT || 3000;
 const mongose = require('mongoose')
 const cors = require('cors')
 const jwt = require('jsonwebtoken')
 const FormData = require('form-data');
 const fetch = require('node-fetch');
 var crypto = require('crypto');
 var nodemailer = require('nodemailer');
//const {mongose} = require('./db/mongoose')

 // load in mongoose models

const User = require('./db/models/User');
const Client = require('./db/models/Client');
const Doctor = require('./db/models/Doctor');
const Token = require('./db/models/Token');
const SmS = require('./db/models/SmsConfirmation');
const { Console } = require('console');

 //load in midelweere 

 app.use (bodyParser.json());
 app.use(cors())

 function verifyToken(req, res, next) {
     //we nneed to use try and catch in order to catch jwt exseotion when token is modified or incorect 
    if(!req.headers.authorization) {
      return res.status(401).send('Unauthorized request')
    }
     // we split authorization to get token value only 
    let token = req.headers.authorization.split(' ')[1]
    if(token === 'null') {
      return res.status(401).send('Unauthorized request')    
    }
    try {
            // if token is not valid there will be no payload 
      let payload = jwt.verify (token, 'secretKey')
      req.userId = payload.subject
      next ()

  } catch (err) {
      // if token is not valid
      return res.status (401) .send ('Unauthorized request')

  }
  }``

  
 //conect to mogoDb
 const dbURI = 'mongodb+srv://Vlad:Test123456@cluster0.tjyaa.mongodb.net/Airbnb?retryWrites=true&w=majority';
mongose.connect(dbURI,{ useNewUrlParser: true , useUnifiedTopology: true  } )
// this part is fired when we connect to DB
.then((result)=>{  
    app.listen(port)  ///////// we are placing app.liste heer to make sure to taht we load db before makeing any request 
    console.log('Connected to DB')
    console.log(port)
})
.catch((err)=> console.log(err))




/// send mesage to a Clients

app.post('/sendsms',(req,res)=>{
    console.log("sendsms")
    //console.log(req.body.idC)
   
    
    // we want to retum Home page ather autucation process 
    
    Client.find({"_id":req.body.idC} , (error,user)=>{
        if(error){
            console.log(error)
            res.status(401).send(`Something went wrong. Try again `)

        }else{
            console.log(user)
            let phoneArray = [] 
           for (var i= 0 ; i< user.length;i++){
               console.log(user[i].phoneNUmber)
               phoneArray.push(user[i].phoneNUmber)
           }
           console.log(phoneArray)



                 ////
                        
                 const msg = req.body.msg
                 console.log(msg )
                 
                
                 const data = { body: msg, numbers:phoneArray};
                 console.log(data)
                 //console.log(req.body.client_PhoneNumber) // we will add it to json and send it to API
                 const body = new FormData();
                 Object.entries(data).forEach(([key, value]) => body.append(key, JSON.stringify(value)));
                 fetch('https://api.airgosms.com/api/messages?key=wUwoxp0mmUN6efMlNcXF', { method: 'POST', body })
                 .then(res => console.log(res));
                 
             ////




             res.status(200).send({msg:"Message has been sent"})
       }
        })

})

// route handelrs
// when we make request to .home verufytoken will run first and if everetyng is goo we can  make request (we can use fro shedule to schek all the logis and then add toMOngoDb)
 app.get('/home',verifyToken,(req,res)=>{
     console.log('here')
     // we want to retum Home page ather autucation process 
      
     Client.find({} , (error,user)=>{
         if(error){
             console.log(error)

         }else{
            res.json(user)
        }
         })

 })
 
 //// confirmation SMS
 // we need redirect if okay 
 app.post ('/confirm',(req,res)=>{
    console.log(req.body)
    // Find a matching token
   SmS.findOne({ token: req.body.number }, function (err, token) {
       if (!token) return res.status(400).send({ type: 'not-verified', msg: 'We were unable to find a valid token. Your token my have expired.' });
       console.log(token)
       // If we found a token, find a matching user
       User.findOne({ _id: token._userId, }, function (err, user) {
           if (!user) return res.status(400).send({ msg: 'We were unable to find a user for this token.' });
           if (user.isVerifiedPhone) return res.status(400).send({ type: 'already-verified', msg: 'This user has already been verified.Please log in.' });

           // Verify and save the user
           user.isVerifiedPhone = true;
           user.save(function (err) {
               if (err) { return res.status(500).send({ msg: err.message }); }
               res.status(200).send("The account has been verified. Please log in.");
           });
       });
   });
})



 //register route
 app.post('/register',(req,res)=>{
     let userData = req.body
     let user = new User(userData)
     user.save((err, registerUser)=>{
         if(err)
         {
             console.log(err)
         } else {
            
             // payload is a Object taht will conatin regiser user ID , key is Subject nad value is User ID
             let payload = {subject: registerUser._id}
             // varible token is holding jwt-tokken .The first argument in jwt.sign() is payload and 2nd argument is a secret key it can be anything , in our case with just using string "SecretKey"
             let tokenn = jwt.sign(payload,'secretKey')
            // sendint token to MongoDb
             res.status(200).send({tokenn})
            //res.status(200).send(registerUser) if we not using jwt token  we can send user object directly to MongoDb

               
                   
                    
                    //crete number thad will be sned for validation 

                    var random_number = Math.floor(Math.random() * 10000); console.log(random_number); 

                    var sms = new SmS({ _userId: user._id, token: random_number });
                    sms.save()
                    
                   

                /////
                
                ///send SMS with confirmayion number 

                ////
                        
               
                
               
                const data = { body: `This is your verification number: ${random_number}`, numbers:user.phoneNUmber};
                console.log(data)
                //console.log(req.body.client_PhoneNumber) // we will add it to json and send it to API
                const body = new FormData();
                Object.entries(data).forEach(([key, value]) => body.append(key, JSON.stringify(value)));
                fetch('https://api.airgosms.com/api/messages?key=wUwoxp0mmUN6efMlNcXF', { method: 'POST', body })
                .then(res => console.log(res));
                
            ////

                ////
         }
     })
 })
//login route
 app.post('/login',(req,res)=>{

    let userData = req.body
    User.findOne({email: userData.email} , (error,user)=>{
        if(error){
            console.log(error)
        } else {
             // Make sure the user has been verified
            
            if(!user){
                res.status(401).send('Invalid email')
            } else 
            if(user.password !== userData.password){
                res.status(401).send('invalid password')
              
            } 
            //if (!user.isVerified)  res.status(403).send({ type: 'not-verified', msg: 'Your account has not been verified.' }); 
            else {
                 // payload is a Object taht will conatin regiser user ID , key is Subject nad value is User ID
             let payload = {subject: user._id}
             // varible token is holding jwt-tokken .The first argument in jwt.sign() is payload and 2nd argument is a secret key it can be anything , in our case with just using string "SecretKey"
             let tokenn = jwt.sign(payload,'secretKey')
                res.status(200).send({tokenn,user})
               
            }
        }
    })
 })
 //add client route
 app.post('/addclient',(req,res)=>{
     console.log("client")
    let clientData = req.body
    let client = new Client(clientData)
    
    client.save((err, registerUser)=>{
        if(err)
        {   
            if(err.code === 11000)
           
            res.status(401).send(`Duplicated ${JSON.stringify(err.keyValue)} not allowed `)
        } else {
         
            res.status(200).send(registerUser)
           //res.status(200).send(registerUser) if we not using jwt token  we can send user object directly to MongoDb

           
        }
    })
})
//add docotr route
app.post('/adddoctor',(req,res)=>{
    let doctorData = req.body
    let docotor = new Doctor(doctorData)
    docotor.save((err, registerUser)=>{
        if(err)
        {
            console.log(err)
            if(err.code != 11000)
           
            res.status(401).send(`All fields must be filed`)

            if(err.code === 11000)
           
            res.status(401).send(`Duplicated ${JSON.stringify(err.keyValue)} not allowed `)
        } else {
            console.log(registerUser)
            res.status(200).send(registerUser)
           //res.status(200).send(registerUser) if we not using jwt token  we can send user object directly to MongoDb
        }
    })
})
//// get doctor info
app.get('/doctor',(req,res)=>{
    console.log("here")
    // we want to retum Home page ather autucation process 
    
    Doctor.find({} , (error,user)=>{
        if(error){
            console.log(error)

        }else{
           
           res.json(user)
       }
        })

})
//// get Client info
app.get('/client',(req,res)=>{
    console.log("here")
    // we want to retum Home page ather autucation process 
    
    Client.find({} , (error,user)=>{
        if(error){
            console.log(error)

        }else{
           
           res.json(user)
       }
        })

})
/// send mesage to all Clients
//// get Client info
app.post('/sendm',(req,res)=>{
    console.log("sendm")
   
    
    // we want to retum Home page ather autucation process 
    
    Client.find({} , (error,user)=>{
        if(error){
            res.status(401).send(`Something went wrong. Try again `)
            console.log(error)

        }else{
            let phoneArray = [] 
           for (var i= 0 ; i< user.length;i++){
               console.log(user[i].phoneNUmber)
               phoneArray.push(user[i].phoneNUmber)
           }
           console.log(phoneArray)



                 ////
                        
                 const msg = req.body.msg
                 console.log(msg )
                 
                
                 const data = { body: msg, numbers:phoneArray};
                 console.log(data)
                 //console.log(req.body.client_PhoneNumber) // we will add it to json and send it to API
                 const body = new FormData();
                 Object.entries(data).forEach(([key, value]) => body.append(key, JSON.stringify(value)));
                 fetch('https://api.airgosms.com/api/messages?key=wUwoxp0mmUN6efMlNcXF', { method: 'POST', body })
                 .then(res => console.log(res));
                 
             ////




             res.status(200).send({msg:"Message has been sent"})
       }
        })

})
///// get day oo the week 
function myFunction(n) {
    var d = new Date();
    var weekday = new Array(7);
    weekday[6] = "Sunday";
    weekday[0] = "Monday";
    weekday[1] = "Tuesday";
    weekday[2] = "Wednesday";
    weekday[3] = "Thursday";
    weekday[4] = "Friday";
    weekday[5] = "Saturday";
  
   return  weekday[n.getDay()];
    
  }
/////
//// try to update shedule 
app.post('/push',async (req,res,cb)=>{
    
    //we will do req.query req. Date etc ...
    let useraPOIMNET = req.body
    //return day of thew eek submited by user 
  

    //console.log(useraPOIMNET)
    let query  = { "_id": useraPOIMNET.id}
    let update = { "$push": { "Shedule": { "_id": useraPOIMNET.date, "Booked": { "start":useraPOIMNET.start, "end":useraPOIMNET.end,"Client":useraPOIMNET.idC} }   }   }  ;
    await Doctor.findOne({"_id": useraPOIMNET.id} , (error,user)=>{
        //console.log(user)
        if(error){
            console.log(error)

        }else{
            ///////////////////////////////////////////THIS part Respomsib;eble fro cheking range of booking time ///////////////////////////////////////////////////////////////////
            //// chek fro day of the week in doctor Obkect 
                //console.log(user.Monday.start)
            let chej = new Date(useraPOIMNET.date)
            for (const property in user) {
               if(property === myFunction(chej)){
                    
                    if(useraPOIMNET.start < user[property].start){
                        console.log("Cant book to early ")
                        let err = "Cant book to early"
                        return res.status(401).send({
                            message: 'Cant book to early'})
                        
                       
                    }
                    if(useraPOIMNET.end < user[property].start || useraPOIMNET.end > user[property].end ){
                        let err = "Cant book to late"
                        console.log("Cant book to late")
                        return res.status(401).send({
                            message: 'Cant book to late'})
                    }
                    // return start time of appoimnet 
                   console.log(useraPOIMNET.start)
                   //return start from Monday 
                console.log(user[property].start);
               }
               //console.log(`${property}: ${useraPOIMNET[property]}`);
             }
             //////////////////////////////////////////////////////////////////////////////////////////////////////////////
                        // if we crete Doctor and we dont have any shedule object we beed to chek fro null and push
                        // we dont need it we doing it by defult 
                           
                            if(user.Shedule.length > 0){
                               console.log("more tahn empty")
                            // we need to run forr loop and if we find the condotion then run if statment fro quersies
                           
                            //not sure if need it here maube we can do in Angular 
                            console.log(useraPOIMNET.date)
                            let now = new Date(useraPOIMNET.date)
                            now.toISOString()
                            useraPOIMNET.date = now
                      
                            var i;
                            for (i = 0; i < user.Shedule.length; i++) {
                               
                           
                                        
                                        if(useraPOIMNET.date.getTime()  === user.Shedule[i]._id.getTime()   ){
                                            console.log("here")
                                            query  = { "_id": useraPOIMNET.id ,"Shedule._id":useraPOIMNET.date } 
                                            update =  { "$push": { "Shedule.$.Booked": { "start":useraPOIMNET.start, "end":useraPOIMNET.end,"Client":useraPOIMNET.idC } }   } ;
                                            console.log(useraPOIMNET.end)
                                            //res.json(user)
                                            //break;
                                
                                                                        }
                                                                    }
                          
                                                                   

                                                                     
                                                        }
                                                         Doctor.updateOne(query,update)
        
                                                        .then((err,res)=>{
                                                            if(err)
                                                            {
                                                                console.log(err)
                                                            } else {
                                                                pushUser.updateOne((err, registerUser)=>{
                                                                    if(err)
                                                                    {
                                                                        console.log(err)
                                                                    } else {
                                                                        
                                                                        res.status(200).send(registerUser)
                                                                    
                                                                    }
                                                                })    
                                                            }
                                                        })
          
       }
       
        })

       ////
       await Doctor.findOne({"_id": useraPOIMNET.id} , (error,user)=>{
        if(error){console.log(error)}
        let doctorData = user
        console.log(doctorData)
         Client.findOne({"_id": useraPOIMNET.idC} , (error,user)=>{
            if(error){console.log(error)}
            let clientData = user
            console.log(clientData)
             
             
             //let ter = useraPOIMNET.date.toISOString().split("T")[0]
             let now = new Date(useraPOIMNET.date)
             now.toISOString()
             useraPOIMNET.date = now
          
             //console.log(ter)
            let msg = `Dear ${clientData.firstName}, this is a reminder that you have an appointment with Doctor ${doctorData.lastName} on ${useraPOIMNET.date.toISOString().split("T")[0]} at ${req.body.startTime}`
            let phoneArray = clientData.phoneNUmber
           const data = { body: msg, numbers:phoneArray};
           console.log(data)
           const body = new FormData();
           Object.entries(data).forEach(([key, value]) => body.append(key, JSON.stringify(value)));
           fetch('https://api.airgosms.com/api/messages?key=wUwoxp0mmUN6efMlNcXF', { method: 'POST', body })
           .then(res => console.log(res));
          
           
         })
         res.status(200).send({msg:"Appointment has been created and message has been sent"})
    })
    
   
   
  
////

     
})

/*
 ////
 //// tets email 

 app.post ('/email',(req,res)=>{
    //Step 1: Creating the transporter
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
          user: "apivladbordiug@gmail.com",
          pass: "Test20212021"
        }
});

//Step 2: Setting up message options
const messageOptions = {
  subject: "Test",
  text: "I am sending an email from nodemailer!",
  to: "vladislav.ukraine@gmail.com",
  from: "apivladbordiug@gmail.com"
};

//Step 3: Sending email
transporter.sendMail(messageOptions);
})
 ////
 */






/* email verification
 // we need redirect if okay 
 app.post ('/confirmation',(req,res)=>{
     console.log(req.body)
     // Find a matching token
    Token.findOne({ token: req.body.token }, function (err, token) {
        if (!token) return res.status(400).send({ type: 'not-verified', msg: 'We were unable to find a valid token. Your token my have expired.' });
        console.log(token)
        // If we found a token, find a matching user
        User.findOne({ _id: token._userId, }, function (err, user) {
            if (!user) return res.status(400).send({ msg: 'We were unable to find a user for this token.' });
            if (user.isVerified) return res.status(400).send({ type: 'already-verified', msg: 'This user has already been verified.' });
 
            // Verify and save the user
            user.isVerified = true;
            user.save(function (err) {
                if (err) { return res.status(500).send({ msg: err.message }); }
                res.status(200).send("The account has been verified. Please log in.");
            });
        });
    });
 })
*/




 /* We not going to impent herer
                /////
                    // Create a verification token, save it, and send email
                    var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
                    //crete number thad will be sned for validation 

                    var random_number = Math.floor(Math.random() * 100); console.log(random_number); 

                    var sms = new SmS({ _userId: user._id, token: random_number });
                    sms.save()
                    
                    // Save the token
                    token.save(function (err) {
                        if (err) { return res.status(500).send({ msg: err.message }); }

                        // Send the email
                        var transporter = nodemailer.createTransport({ service: 'Gmail', auth: { user:"apivladbordiug@gmail.com", pass: "Test20212021" } });
                        var mailOptions = { from: 'no-reply@codemoto.io', to: user.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n' };
                        transporter.sendMail(mailOptions, function (err) {
                            if (err) { return res.status(500).send({ msg: err.message }); }
                            res.status(200).send('A verification email has been sent to ' + user.email + '.');
                        });
                    });

                /////
                */