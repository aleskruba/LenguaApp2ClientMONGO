const User = require("../models/User");
const Lesson = require("../models/Lesson");
const VirtualCreditAccount = require("../models/VirtualCreditAccount")
const jwt = require('jsonwebtoken');
var moment = require('moment');
const path = require('path');
moment().format(); 


module.exports.myteachers_get = async (req, res) => {
         const token = req.cookies.jwt;
        
         if (token) {
            jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
         if (err) {
          res.locals.user = null;
          next();
        } else {
          let user = await User.findById(decodedToken.id);
          res.locals.user = user;
   
    try {
        const myBookedLessons = await Lesson.find({ idStudent: user._id.toString()  });
        const myTeachers = await User.find({  })

        let allLessons = []

        for (let i of myBookedLessons){
            allLessons.push(i)
        }


          let myTeachersArray = []
          
              for (let i of myBookedLessons){
             
                 if(!myTeachersArray.some(obj => obj.idTeacher === i.idTeacher && !obj.isRejected) ){
                  myTeachersArray.push(i)
                }
              }

       
              res.status(200).json({ myTeachersArray,allLessons,myTeachers });

  
    } catch (err) {
      console.error(err);
    
    }
  }
  })
  }
  }

  module.exports.mybookedlessons_get = async (req, res) => {
     
    const token = req.cookies.jwt;
    if (token) {
      jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
        if (err) {
          res.locals.user = null;
          next();
        } else {
          let user = await User.findById(decodedToken.id);
          res.locals.user = user;
   
    try {
  
      const bookedLessons = await Lesson.find({ idStudent: user._id.toString()  });
      const myTeachers = await User.find({  })
  
     let myLessonArray = []
        for (let i of bookedLessons){
          if( !i.isRejected  ){
            myLessonArray.push(i)
           }
        }

      
     let myCompletedLessonArray = []
     for (let i of bookedLessons){
       if( i.isCompleted  ){
        myCompletedLessonArray.push(i)
        }
     }
 
    
              
        res.status(200).json({ myLessonArray ,myCompletedLessonArray,myTeachers});

      
     
    } catch (err) {
      console.error(err);
    
    }
  }
  })
  }
  }
  



  //////////////////////


  module.exports.mystudents_get = async (req, res) => {
    const token = req.cookies.jwt;
   
    if (token) {
       jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
    if (err) {
     res.locals.user = null;
     next();
   } else {
     let user = await User.findById(decodedToken.id);
     res.locals.user = user;

try {
   const myTeachingLessons = await Lesson.find({ idTeacher: user._id.toString()  });


   let allLessons = []

   for (let i of myTeachingLessons){
       allLessons.push(i)
   }

     let myStudentsArray = []
     
         for (let i of myTeachingLessons){
        
            if(!myStudentsArray.some(obj => obj.idStudent === i.idStudent && !obj.isRejected) ){
              myStudentsArray.push(i)
           }
         }

         res.status(200).json({ myStudentsArray,allLessons });


} catch (err) {
 console.error(err);

}
}
})
}
}






module.exports.myFinishedTeachingLessons= async (req, res) => {
     
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
 
  try {

    const finishedLessons = await Lesson.find({ idTeacher: user._id.toString()  });

   let myLessonArray = []
      for (let i of finishedLessons){
        if( i.isCompleted  ){
          myLessonArray.push(i)
         }
      }

            
      res.status(200).json({ myLessonArray });

    
   
  } catch (err) {
    console.error(err);
  
  }
}
})
}
}


module.exports.myUpcomingTeachingLessons= async (req, res) => {
     
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
 
  try {

    const upcomingLessons = await Lesson.find({ idTeacher: user._id.toString()  });

    const today = new Date();
    const unixTimestamp = Date.parse(today).toString()
  
    let myLessonArray = [];

for (let i of upcomingLessons) {
  const isAnyTimestampValid = i.timeSlot.some(timestamp => {
   
    return timestamp >= unixTimestamp;
  });

  if (
    isAnyTimestampValid && i.isReserved &&  !i.isConfirmed  &&  !i.isRejected  &&  !i.isCompleted
  ) {
    myLessonArray.push(i);
  }
}

console.log(myLessonArray)
            
      res.status(200).json({ myLessonArray });

    
   
  } catch (err) {
    console.error(err);
  
  }
}
})
}
}



module.exports.myteacherzone_get = async (req, res) => {
     
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
 
  try {

    const finishedLessons = await Lesson.find({ idTeacher: user._id.toString()  });
    const teacherDetails = await User.find({ _id: user._id.toString()  });


    let myReservedArray = []
      for (let i of finishedLessons){
        if( i.isReserved &&  !i.isCompleted  ){
          myReservedArray.push(i)
         }
      }

  

    let myLessonArray = []
      for (let i of finishedLessons){
        if( i.isCompleted  ){
          myLessonArray.push(i)
         }
      }

      let myStudentsArray = []
     
      for (let i of finishedLessons){
     
         if(!myStudentsArray.some(obj => obj.idStudent === i.idStudent && !obj.isRejected) ){
           myStudentsArray.push(i)
        }
      }



      const today = new Date();
      const unixTimestamp = Date.parse(today).toString()
    
      let myUpcomingLessonArray = [];
  
    for (let i of finishedLessons) {
        const isAnyTimestampValid = i.timeSlot.some(timestamp => {
        
          return timestamp > unixTimestamp;
        });
      
        if (
          isAnyTimestampValid &&
          (!i.isCompleted || !i.isRejected)
        ) {
          myUpcomingLessonArray.push(i);
        }
      }



      const myReservedArrayNumber = myReservedArray.length
      const myFinishedLessonsNumber = myLessonArray.length
      const myStudentsNumber = myStudentsArray.length
      const myUpcomingLessonsNumber = myUpcomingLessonArray.length





            
      res.status(200).json({ myFinishedLessonsNumber, myUpcomingLessonsNumber,  myStudentsNumber,myReservedArrayNumber,teacherDetails});

    
   
  } catch (err) {
    console.error(err);
  
  }
}
})
}
}



module.exports.teachersavescheduleslot_put = async (req, res, next) => {
  const datesArray = req.body.datesArray;

    console.log(datesArray)

   const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
        try {
          await User.updateOne({ _id: user._id },{ $set: { teachingSlots: datesArray } });
          res.status(201).json({ user: user._id });
        } catch (err) {
          console.log(err)
        }
      }
    });
  } else {
    res.locals.user = null;
    next();
  }   
};




module.exports.teachersavedscheduleslot_get = async (req, res, next) => {

  const token = req.cookies.jwt;
  
   if (token) {
    jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
        try {

          const teacherName = user.firstName
          
           const lessons = await Lesson.find()

           res.status(201).json({ teachingSlots : user.teachingSlots,teacherName:teacherName,lessons:lessons,userID:user.id});

        } catch (err) {
          const errors = handleErrors(err);
          res.status(400).json({ errors });
        }
      }
    });
  } else {
    res.locals.user = null;
    next();
  } 
};






module.exports.saveLessonSlot_post = (req, res, next) => {
  const {data} = req.body

  const credits = data.credits;
  const timeSlot = data.timeSlot;
  const teacherID = data.teacherID; 

  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        let teacher = await User.findById(teacherID);
        res.locals.user = user;
        res.locals.teacher = teacher;

        try {
          if (parseInt(user.credits) >= parseInt(credits)) {
            await Lesson.create({
              idStudent: user._id,
              studentFirstName: user.firstName,
              studentLastName: user.lastName,
              studentCountry: user.country,
              idTeacher: teacherID,
              studentProfile:user.profile,
              teacherProfile: teacher.profile,
              SecondaryIdTeacher: teacher.idUser,
              teacherFirstName: teacher.firstName,
              teacherLastName: teacher.lastName,
              teacherCountry: teacher.country,
              notice: true,
              isReserved: true,
              timeSlot: timeSlot,
              billedPrice: credits,
            });

            await VirtualCreditAccount.updateOne(
              { _id: "646097d8d3dc09a70e20b0cb" },
              { $inc: { virtualAccount: parseInt(credits) } }
            );
            await User.updateOne(
              { _id: user._id },
              {
                $inc: { credits: -parseInt(credits) },
                $push: {
                  transaction: {
                    date: new Date().toISOString(),
                    description: "booking lesson",
                    amount: -parseInt(credits),
                    completed: "completed",
                  },
                },
              }
            );

            res.status(201).json({ user: user._id });
          } else {          res.status(400).json({ error: "Insufficient credits  " });}
        } catch (err) {
          res.status(400).json({ error: "Insufficient credits" });
        }
  
      }
    });
  } else {
    res.locals.user = null;
    next();
  } 
};



module.exports.lessonssData_get= async (req, res) => {
     
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        let teachers = await User.find();
     

        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
 
  try {
    const lessons = await Lesson.find()
    res.json({ lessons ,  teachers : teachers});


  } catch (err) {
    console.error(err);
  
  }
}
})
}
} 



module.exports.lessonReservation_get = async (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;

        try {
          const reservedLessons = await Lesson.find({idTeacher: user._id.toString(),});

          const reservedFutureLessons = []

          const today = new Date()
          const unixFormat =  Date.parse(today)


          reservedLessons.forEach((lesson) => {
            // Check each time slot in the lesson's 'timeSlot' array
            lesson.timeSlot.forEach((timeSlot) => {
              const timeSlotValue = parseInt(timeSlot, 10);
          
              if (timeSlotValue > unixFormat) {
                // Push the lesson to 'reservedFutureLessons' if any of its time slots are in the future
                reservedFutureLessons.push(lesson);
              }
            });
          });
          
          const teacherLessons = reservedFutureLessons.filter(lesson => lesson.idTeacher === user._id.toString() && lesson.isReserved && !lesson.isConfirmed && !lesson.isRejected);



          res.status(201).json({ lessons: teacherLessons });


        } catch (err) {
          console.error(err);
        }
      }
    });
  }
}; 



module.exports.confirmlesson_put = async (req, res) => {
  const { id } = req.body;
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        try {
          const result = await Lesson.updateOne({ _id: id }, { $set: { isConfirmed: true } });

          if (result.nModified === 0) {
            return res.status(404).json({ error: 'Lesson not found' });
          }

          res.status(201).json({ message: 'Lesson confirmed successfully' });
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    });
  }
};



module.exports.rejectlesson_put= async (req, res) => {
  const {id} = req.body
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {

        try {
          const result = await Lesson.updateOne({ _id: id }, { $set: { isRejected: true } });

          if (result.nModified === 0) {
            return res.status(404).json({ error: 'Lesson not found' });
          }

          res.status(201).json({ message: 'Lesson confirmed successfully' });
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal server error' });
        }
   

      }
    })
  }

}





module.exports.lessonStudentNotification_get = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    // No token provided, return an appropriate response
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
    if (err) {
      // Token verification failed, return an appropriate response
      return res.status(401).json({ message: 'Token verification failed' });
    }

    try {
      const user = await User.findById(decodedToken.id);
      
      if (!user) {
        // User not found, return an appropriate response
        return res.status(404).json({ message: 'User not found' });
      }

      const today = new Date();
      const unixFormat = Date.parse(today);

      const myNotifications = await Lesson.find({
        idStudent: user._id.toString(),
        $or: [
          { $and: [{ timeSlot: { $gt: unixFormat } }, { isConfirmed: true }, { isCompleted: false }, { isReadConfirmation: false }] },
          { $and: [{ isRejected: true }, { isCompleted: false }, { isReadConfirmation: false }] }
        ]
      });

      res.status(201).json({ myNotifications: myNotifications });
    } catch (err) {
      console.error(err);
      // Handle the error and pass it to the error-handling middleware
      next(err);
    }
  });
};





module.exports.lessonStudentNotification_put = async (req, res, next) => {
  const token = req.cookies.jwt;  
  const {lessonID} = req.body
  console.log('id message',lessonID)

  if (token) {
    jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next(err); // Pass the error to the next middleware
      } else {
        try {
          // Use the `findByIdAndUpdate` method to update the lesson
          const updatedLesson = await Lesson.findByIdAndUpdate(
            lessonID,
            { isReadConfirmation: true },
            { new: true } // Return the updated document
          );

          console.log('lesson',updatedLesson)
          if (!updatedLesson) {
            // Handle the case where the lesson with the specified ID is not found
            return res.status(404).json({ message: 'Lesson not found' });
          }

          res.status(201).json({message:'updated succesfully'});
          next(); // Call next to move to the next middleware or route handler
        } catch (err) {
          console.error(err, 'could not update notification');
          next(err); // Pass any errors that occur during database query to the next middleware
        }
      }
    });
  } else {
    res.locals.user = null;
    next(); // If there is no token, continue to the next middleware or route handler
  }
};