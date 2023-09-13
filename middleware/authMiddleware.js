const jwt = require('jsonwebtoken');
const User = require('../models/User');
const otpGenerator = require('otp-generator')

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, process.env.KEY, (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        return res.status(401).json({ message: 'Unauthorized' });
      } else {
        // Token is valid, continue to the next middleware or route handler
        req.user = decodedToken; // Save the user data from the token in the request object
        next();
      }
    });
  } else {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};


// checkUser middleware
const checkUser = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    try {
      const decodedToken = await jwt.verify(token, process.env.KEY);
      req.user = decodedToken; // Save the user data from the token in the request object
      console.log('req:',req.user.id)

      const user = await User.findOne({ _id: req.user.id });

      if (user) {
        // The 'user' variable now contains the complete user data
        req.user = user; 
      } else {
        // Handle the scenario when the user is not found (optional)
        console.log('User not found in the database');
        // Optionally, you can set req.user to null or perform any other action here.
      }
      console.log(user)
      next();
    } catch (err) {
      // Handle any error that occurs during verification
      console.log('Error verifying token:', err);
      req.user = null;
      next();
    }
  } else {
    req.user = null;
    next();
  }
};




async function verifyUser(req, res, next){

  try {
      
      const { email } = req.method == "GET" ? req.query : req.body;

      // check the user existance
      let exist = await User.findOne({ email });
      if(!exist) return res.status(404).send({ error : "Can't find User!"});
      res.status(201).send({ status : "OK"});
      next();

  } catch (error) {
      return res.status(404).send({ error: "Authentication Error"});
  }
}


async function generateOTP(req, res) {
  req.app.locals.OTP = await otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false});
}


async function verifyUserResetPassword(req, res, next){

  try {
      
      const { email } = req.method == "GET" ? req.query : req.body;

      await generateOTP(req, res);
      const otp = req.app.locals.OTP;
      req.session.otp = { value: otp, expires: Date.now() + 60000 }; // 1 minute

      // check the user existance
      let exist = await User.findOne({ email });
      if(!exist) return res.status(404).send({ error : "Can't find User!"});
      res.status(201).send({ status : "OK"});
      next();

  } catch (error) {
      return res.status(404).send({ error: "Authentication Error"});
  }
}


  module.exports = { requireAuth,checkUser,verifyUser,verifyUserResetPassword};