const User = require("../models/User");
const Lesson = require("../models/Lesson");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator')
var moment = require('moment');
const path = require('path');
const nodemailer = require('nodemailer');
moment().format(); 

const createToken = (id) => {
    return jwt.sign({ id }, process.env.KEY, {
      expiresIn: '10d'
    });
  };
  
  const createRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.KEY, {
      expiresIn: '360d'
    });
  };


  module.exports.refresh_token_post = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }
    try {
      const decoded = jwt.verify(refreshToken, process.env.KEY);
      const accessToken = createToken(decoded.id);
      res.cookie('jwt', accessToken, { httpOnly: true, 
                                       maxAge: 5 * 24 * 60* 60 * 1000,
                                      secure:true,
                                      sameSite:'none'});
      res.status(200).json({ accessToken });
    } catch (err) {
      res.status(403).json({ message: 'Invalid refresh token' });
    }
  };

  module.exports.signup_post = async (req, res) => {
    
    const { email, password, profile} = req.body;

      
    try {
      const memberDate = Date.now(); // Get the current date and time
      const idUser = await User.getNextIdUser();
      const user = await User.create({ idUser, email, password, profile, memberDate });
      const accessToken = createToken(user._id);
      const refreshToken = createRefreshToken(user._id);
      res.cookie('jwt', accessToken, { httpOnly: true,
                                       maxAge: 5 * 24 * 60* 60 * 1000,
                                       secure:true,
                                      sameSite:'none'});
      res.cookie('refreshToken', refreshToken, { httpOnly: true, 
                                                 maxAge: 7 * 24 * 60 * 60 * 1000,
                                                 secure:true,
                                                sameSite:'none' });
      res.status(201).json({ user: user._id });
     }
    catch (err) {
      if (err.message === 'sign up refused') {
        // Specific error for signup refusal
        return res.status(400).json({ message: 'Email or password is invalid.' });
      } else if (err.message.includes('E11000 duplicate key')) {
        // Specific error for duplicate email
        return res.status(400).json({ message: 'Email already registered.' });
      } else {
        // General error message
        return res.status(500).json({ message: 'An error occurred while signing up.' });
      }
    }
   
  }



  module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;

  
    try {
      const user = await User.login(email, password);
      const accessToken = createToken(user._id);
      const refreshToken = createRefreshToken(user._id);
      res.cookie('jwt', accessToken, {
        httpOnly: true,
        maxAge: 5 * 24 * 60 * 60 * 1000,
        //domain: 'localhost',
        //path: '/',
        secure:true,
        sameSite:'none'
      });
  
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
       // domain: 'localhost',
       // path: '/',
        secure:true,
        sameSite:'none'
      });
  
      // Include the "user" information in the response
      res.status(200).json({ user, accessToken, refreshToken });

    } catch (err) {
      res.status(500).json({ error:err});
      console.log(err)
    }
  };
  



  module.exports.logout_get = async (req, res,next) => {

    try {

       // res.clearCookie('jwt');
       // res.clearCookie('refreshToken');
        res.cookie('jwt', '', { maxAge: 1, 
          httpOnly: true, 
          secure: true, 
          sameSite: 'none' });
          res.cookie('refreshToken', '', { maxAge: 1, 
            httpOnly: true, 
            secure: true, 
            sameSite: 'none' });
        res.status(200).json({ message: 'Logout successful' });
    
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

  const maxAge = 3 * 24 * 60 * 60;


  
/*   module.exports.fpassword_post = async (req, res) => {
    try {
      const { email } = req.body;
  
      // Access the OTP from the session
      const otp = req.session.otp.value;
     
  
      // Your other code to send the OTP via email goes here...
      let transporter = nodemailer.createTransport({
        host: 'smtp.centrum.cz',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAILUSER, // your email address
          pass: process.env.EMAILPASSWORD, // your email password
        },
      });
  
      let mailOptions = {
        from: process.env.EMAILUSER, // sender address
        to: email, // list of receivers
        subject: 'TEST ZAPOMENUTÉHO HESLA', // Subject line
        text: ` ${email}, NOVÝ KÓD ${otp}`, // plain text body
        html: `<b>${otp}</b>`, // html body
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          // Handle the error here if needed
          res.status(500).json({ error: 'Email sending failed' });
        } else {
          // Success response
          res.status(200).json({ message: 'OTP sent successfully!' });
        }
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  


  module.exports.verifyOTP_post = async (req, res) => {
    try {
      const { code } = req.body;
      const storedOTP = req.session.otp;

      if (storedOTP.value === code && Date.now() < storedOTP.expires) {
        // OTP is valid and not expired
        req.session.isAuthenticated = true;
        res.status(200).json({ message: 'OTP verified successfully!' });
      } else {
        // OTP is invalid or expired
        res.status(401).json({ error: 'Invalid OTP or session expired.' });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
 */



  module.exports.fpassword_post = async (req, res) => {
    const { email } = req.body;
  
    try {
      // Retrieve the forgottenPasswordToken from res.locals
      const forgottenPasswordToken = res.locals.forgottenPasswordToken;
  
      let transporter = nodemailer.createTransport({
        host: 'smtp.centrum.cz',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAILUSER,
          pass: process.env.EMAILPASSWORD,
        },
      });
  
      // Extract the OTP from the forgottenPasswordToken
      const otp = forgottenPasswordToken.otp;
  
      let mailOptions = {
        from: process.env.EMAILUSER,
        to: email,
        subject: 'VÝVOJÁŘSKÝ TEST ZAPOMENUTÉHO HESLA',
        text: `${email}, NOVÝ KÓD ${otp}`,
        html: `<b>${otp}</b>`,
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          res.status(500).json({ error: 'Email sending failed' });
        } else {
          res.status(200).json({ message: 'OTP sent successfully!' });
        }
      });
  
  
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  
  module.exports.verifyOTP_post = async (req, res) => {
    const { code } = req.body;
    const forgottenPasswordToken = req.cookies.jwtfp;
  
    try {
      if (!forgottenPasswordToken) {
        // Handle the case where the cookie is missing
        return res.status(401).json({ error: 'Token not found' });
      }
  
      jwt.verify(forgottenPasswordToken, process.env.KEY, (err, decodedToken) => {
        if (err) {
          // Handle JWT verification errors
          return res.status(401).json({ error: 'Invalid token' });
        }
  
        // Access the OTP from the decodedToken payload
        const otp = decodedToken.otp;
  
        if (otp === code) {
   
   
          res.status(200).json({ message: 'OTP verified successfully!' });
   
        } else {
          res.status(401).json({ error: 'Invalid OTP' });
        }
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

module.exports.resetPassword_post = async (req, res) => {
  const { password, email } = req.body;

  try {
    if (password.length < 6) {
      throw Error('Password must be at least 6 characters');
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw Error('User not found');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await User.findByIdAndUpdate(user._id, { password: hashedPassword }, { new: true });

    // Send the response before destroying the session
    res.status(200).json({ user: updatedUser._id });


  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};




module.exports.changePassword_post = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const token = req.cookies.jwt;


  if (token) {
    jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
      if (err) {
             next();
      } else {
        let user = await User.findById(decodedToken.id);

        res.locals.user = user;
        try {
          const passwordMatch = await bcrypt.compare(oldPassword, user.password);
          if (!passwordMatch) {
            throw new Error('incorrect old password');
          }

          if (newPassword.length < 6) {
            throw new Error('incorrect new password');
          }

          const hashedPassword = await bcrypt.hash(newPassword, 10);

          await User.updateOne({ _id: user._id }, { password: hashedPassword });
          res.status(201).json({ user: 'password changed' });
          return; // Add the return statement here to stop execution
        } catch (err) {
          res.status(400).send(err.message); // Send the error response with status 400
          return; // Add the return statement here to stop execution
        }
        next();
      }
    });
  } else {
    next();
  }
};



module.exports.updateprofile_put = async (req, res, next) => {
  const { updatedProfile } = req.body;
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
      if (err) {
              next();
      } else {
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
        try {
          // Construct a dynamic update object based on the changed fields in updatedProfile
          const dynamicUpdate = {};
          for (const key in updatedProfile) {
            if (user[key] !== updatedProfile[key]) {
              dynamicUpdate[key] = updatedProfile[key];
            }
          }

          // Perform the update only if there are changes in updatedProfile
          if (Object.keys(dynamicUpdate).length > 0) {
            await User.updateOne({ _id: user._id }, { $set: dynamicUpdate });
          }

          res.status(201).json({ user: user._id });
        } catch (err) {
          res.status(400).json({ err });
        }
      }
    });
  } else {

    next();
  }
};





/* module.exports.updatelanguages_post = async (req, res, next) => {
  const { selectedLanguages } = req.body;
  console.log('selected : ',selectedLanguages);
  if (!selectedLanguages.length) {selectedLanguages == []}
  const token = req.cookies.jwt;
 
  if (token) {
    try {
      const decodedToken = jwt.verify(token, process.env.KEY);
      const user = await User.findById(decodedToken.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Remove selectedLanguages from learnlanguages array
      await User.updateOne({ _id: user._id },  { learnlanguages: selectedLanguages   });

      res.status(200).json({ message: 'Languages updated successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(403).json({ error: 'Unauthorized' });
  }
}; */


module.exports.updatelanguages_get = async (req, res, next) => {
  const token = req.cookies.jwt;

try {
  if (token) {
    const decodedToken = jwt.verify(token, process.env.KEY);
    const user = await User.findById(decodedToken.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
        const learnlanguages  = user.learnlanguages
        res.status(200).json(learnlanguages)
      }
    else {
      res.status(403).json({ error: 'Unauthorized' });
  }


} 
  catch(err)   {res.status(500).json({ error: 'Internal server error' });}

};


module.exports.updatelanguages_post = async (req, res, next) => {
  const { selectedLanguages } = req.body;

  if (selectedLanguages.length ) {
    try {
      const token = req.cookies.jwt;
      
      if (token) {
        const decodedToken = jwt.verify(token, process.env.KEY);
        const user = await User.findById(decodedToken.id);

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Set learnlanguages to an empty array
        await User.updateOne(
          { _id: user._id },
          {  learnlanguages: selectedLanguages   } 
        );

        res.status(200).json({ message: 'Languages updated successfully' });
      } else {
        res.status(403).json({ error: 'Unauthorized' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    try {
      const token = req.cookies.jwt;

      if (token) {
        const decodedToken = jwt.verify(token, process.env.KEY);
        const user = await User.findById(decodedToken.id);

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Update user's learnlanguages using addToSet and pull
        await User.updateOne(
          { _id: user._id },
          {  learnlanguages: selectedLanguages   } 
        );

        res.status(200).json({ message: 'Languages updated successfully' });
      } else {
        res.status(403).json({ error: 'Unauthorized' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};




module.exports.updateTeachinglanguages_post = async (req, res, next) => {
  const { selectedLanguages } = req.body;

  if (selectedLanguages.length ) {
    try {
      const token = req.cookies.jwt;
      
      if (token) {
        const decodedToken = jwt.verify(token, process.env.KEY);
        const user = await User.findById(decodedToken.id);

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Set learnlanguages to an empty array
        await User.updateOne(
          { _id: user._id },
          {  teachlanguages: selectedLanguages   } 
        );

        res.status(200).json({ message: 'Languages updated successfully' });
      } else {
        res.status(403).json({ error: 'Unauthorized' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    try {
      const token = req.cookies.jwt;

      if (token) {
        const decodedToken = jwt.verify(token, process.env.KEY);
        const user = await User.findById(decodedToken.id);

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Update user's learnlanguages using addToSet and pull
        await User.updateOne(
          { _id: user._id },
          {  teachlanguages: selectedLanguages   } 
        );

        res.status(200).json({ message: 'Languages updated successfully' });
      } else {
        res.status(403).json({ error: 'Unauthorized' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};


module.exports.updateTeachinglanguages_get = async (req, res, next) => {
  const token = req.cookies.jwt;

try {
  if (token) {
    const decodedToken = jwt.verify(token, process.env.KEY);
    const user = await User.findById(decodedToken.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
        const teachlanguages  = user.teachlanguages
        res.status(200).json(teachlanguages)
      }
    else {
      res.status(403).json({ error: 'Unauthorized' });
  }


} 
  catch(err)   {res.status(500).json({ error: 'Internal server error' });}

};

module.exports.teachertoggle_post = async (req, res, next) => {
  const { state } = req.body;   //false or true
  const token = req.cookies.jwt;


  if (token) {
    try {
      const decodedToken = jwt.verify(token, process.env.KEY);
      const user = await User.findById(decodedToken.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await User.updateOne( { _id: user._id }, {teacherState:state} );

      res.status(201).json({ user});
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(403).json({ error: 'Unauthorized' });
  }
};






module.exports.findteachers_get = async (req, res) => {
    try {
        const teachers = await User.find({ teacherState: true });
        const fetchedlessons = await Lesson.find({ isCompleted: true });

        let lessons =[]

        fetchedlessons.forEach(element=> { 
          if (element.ranking) {
            lessons.push(element)
          }
        })
        
        // Create an object to hold both arrays
        const data = {
            teachers: teachers,
            lessons: lessons
        };

        res.status(200).json(data); // Send the data object as the response
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
};


module.exports.loadhomedata = async (req, res) => {
  try {
    const homelanguages = await User.find();

    const languagesToCount = ['english', 'german', 'spanish', 'portuguese', 'french', 'czech'];
    
    const languageCounts = {};
    
    languagesToCount.forEach((language) => {
      languageCounts[language] = 0;
    });
    
    homelanguages.forEach((el) => {
      el.teachlanguages.forEach((languageObject) => {
        if (languageObject && languageObject.language) {
          const language = languageObject.language.toLowerCase();
          if (languagesToCount.includes(language)) {
            languageCounts[language]++;
          }
        }
      });
    });
    
    const totalEn = languageCounts['english'];
    const totalDe = languageCounts['german'];
    const totalSp = languageCounts['spanish'];
    const totalPt = languageCounts['portuguese'];
    const totalFr = languageCounts['french'];
    const totalCZ = languageCounts['czech'];
   
    

      res.status(200).json({ totalCZ,totalDe,totalSp,totalPt,totalEn,totalFr,totalCZ}); // Send the data object as the response
  } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'An error occurred while fetching data.' });
  }
};
