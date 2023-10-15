const User = require("../models/User");
const Lesson = require("../models/Lesson");
const VirtualCreditAccount = require("../models/VirtualCreditAccount")
const jwt = require('jsonwebtoken');
var moment = require('moment');
const path = require('path');
moment().format(); 
const mongoose = require('mongoose');

module.exports.myteachers_get = async (req, res) => {
         const token = req.cookies.jwt;
        
         if (token) {
            jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
         if (err) {
            next();
        } else {
          let user = await User.findById(decodedToken.id);
     
   
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
            next();
        } else {
          let user = await User.findById(decodedToken.id);
   
    try {
  
      const bookedLessons = await Lesson.find({ idStudent: user._id.toString()  });
      const myTeachers = await User.find({  })
  
     let myLessonArray = []
        for (let i of bookedLessons){
          if( !(i.isRejected || i.isCancelled) ){
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
   
     next();
   } else {
     let user = await User.findById(decodedToken.id);

try {
   const myTeachingLessons = await Lesson.find({ idTeacher: user._id.toString()  });


   let allLessons = []

   for (let i of myTeachingLessons){
       allLessons.push(i)
   }

     let myStudentsArray = []
     
         for (let i of myTeachingLessons){

            if (i.isCompleted || i.isReserved) {
        
            if(!myStudentsArray.some(obj => obj.idStudent === i.idStudent ) ){
              myStudentsArray.push(i)
           }
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
        next();
      } else {
        let user = await User.findById(decodedToken.id);
 
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
        next();
      } else {
        let user = await User.findById(decodedToken.id);

  try {

    const upcomingLessons = await Lesson.find({ idTeacher: user._id.toString()  });

    const today = new Date();
    const unixTimestamp = Date.parse(today).toString()
  
    let myLessonArray = [];

for (let i of upcomingLessons) {
  const isAnyTimestampValid = i.timeSlot.some(timestamp => {
   
    return timestamp > unixTimestamp;
  });

  if (
    isAnyTimestampValid  && i.isReserved &&  i.isConfirmed  &&  !i.isRejected  &&  !i.isCompleted  && !i.isCancelled
  ) {
    myLessonArray.push(i);
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



module.exports.myteacherzone_get = async (req, res) => {
     
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
      if (err) {
        next();
      } else {
        let user = await User.findById(decodedToken.id);

 
  try {

    const allLessons = await Lesson.find({ idTeacher: user._id.toString()  });
    const teacherDetails = await User.find({ _id: user._id.toString()  });


    let myReservedArray = []
      for (let i of allLessons){
        if( i.isReserved &&  !i.isCompleted  ){
          myReservedArray.push(i)
         }
      }

  

    let myLessonArray = []
      for (let i of allLessons){
        if( i.isCompleted  ){
          myLessonArray.push(i)
         }
      }

      let myStudentsArray = []
     
      for (let i of allLessons){
     
         if(!myStudentsArray.some(obj => obj.idStudent === i.idStudent && !(obj.isReserved && obj.isRejected)) ){
           myStudentsArray.push(i)
        }
      }

    


      const today = new Date();
      const unixTimestamp = Date.parse(today).toString()
    
      let myUpcomingLessonArray = [];
  
      for (let i of allLessons) {
        const isAnyTimestampValid = i.timeSlot.some(timestamp => {
        
          return timestamp > unixTimestamp;
        });
      
        if (
          isAnyTimestampValid &&  !(i.isCompleted || i.isRejected || i.isCancelled)
        ) {
          myUpcomingLessonArray.push(i);
        }
      }

      totalEarning = 0;

      allLessons.forEach((element) => {
        if (element.isCompleted) {
          totalEarning += element.billedPrice;
        }
      });


      const myReservedArrayNumber = myReservedArray.length
      const myFinishedLessonsNumber = myLessonArray.length
      const myStudentsNumber = myStudentsArray.length
      const myUpcomingLessonsNumber = myUpcomingLessonArray.length



      res.status(200).json({ 
        myFinishedLessonsNumber, 
        myUpcomingLessonsNumber,  
        myStudentsNumber,
        myReservedArrayNumber,
        teacherDetails,
        totalEarning
      });
    
   
  } catch (err) {
    console.error(err);
  
  }
}
})
}
}



module.exports.teachersavescheduleslot_put = async (req, res, next) => {
  const datesArray = req.body.datesArray;



   const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
      if (err) {
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
  
    next();
  }   
};




module.exports.teachersavedscheduleslot_get = async (req, res, next) => {

  const token = req.cookies.jwt;
  
   if (token) {
    jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
      if (err) {
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        try {

          const teacherName = user.firstName
          
           const allLessons = await Lesson.find()

           let lessons = []
           
           allLessons.forEach(element => {
            if (!(element.isRejected || element.isCancelled)) {
              lessons.push(element)
            }
          })

           res.status(201).json({ teachingSlots : user.teachingSlots,teacherName:teacherName,lessons:lessons,userID:user.id});

        } catch (err) {
          const errors = handleErrors(err);
          res.status(400).json({ errors });
        }
      }
    });
  } else {
  
    next();
  } 
};



module.exports.saveLessonSlot_post = async (req, res, next) => {
  const { data } = req.body;
  const credits = data.credits;
  const timeSlot = data.timeSlot;
  const teacherID = data.teacherID;

  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
      if (err) {
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        let teacher = await User.findById(teacherID);
        const checkLesson = await Lesson.find({ idTeacher: teacherID });

        try {
          if (parseInt(user.credits) >= parseInt(credits)) {
            // Check for time slot conflicts
            let timeSlotConflict = false;

            checkLesson.forEach((lesson) => {
              if (!(lesson.isRejected || lesson.isCancelled)) {
                lesson.timeSlot.forEach((timeSlotValue) => {
                  if (parseInt(timeSlotValue) === parseInt(timeSlot)) {
                    timeSlotConflict = true;
                  }
                });
              }
            });
            

            if (timeSlotConflict) {
              res.status(409).json({ error: "This time slot is not free" });

            } else {
              // Proceed with lesson creation if there's no conflict
              await Lesson.create({
                idStudent: user._id,
                studentFirstName: user.firstName,
                studentLastName: user.lastName,
                studentCountry: user.country,
                idTeacher: teacherID,
                studentProfile: user.profile,
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
            }
          } else {
            res.status(400).json({ error: "Insufficient credits" });
          }
        } catch (err) {
          res.status(400).json({ error: "Insufficient credits" });
        }
      }
    });
  } else {
  
    next();
  }
};



/* module.exports.saveLessonSlot_post = (req, res, next) => {
  const {data} = req.body

  const credits = data.credits;
  const timeSlot = data.timeSlot;
  const teacherID = data.teacherID; 

  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
      if (err) {
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        let teacher = await User.findById(teacherID);
        const checkLesson = await Lesson.find({ idTeacher: teacherID });

 

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
          } 
          
          else {          res.status(400).json({ error: "Insufficient credits  " });}
        } 
          catch (err) {
          res.status(400).json({ error: "Insufficient credits" });
        }
  
      }
    });
  } else {
  
    next();
  } 
};
 */


module.exports.lessonssData_get= async (req, res) => {
     
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
      if (err) {
        next();
      } else {
        let teachers = await User.find();
     

        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
 
  try {
    const allLessons = await Lesson.find()
    
    let lessons = []

    allLessons.forEach(element => {
      if (!(element.isRejected || element.isCancelled)) {
        lessons.push(element)
      }
    })

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
        next();
      } else {
        let user = await User.findById(decodedToken.id);
     
        try {
          const reservedLessons = await Lesson.find({idTeacher: user._id.toString(),});
          
          const completedLessons = await Lesson.find({idStudent: user._id.toString(),});

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


          const completedLessonsToConfirmByStudent = []

          completedLessons.forEach(lesson => {
            lesson.timeSlot.forEach((timeSlot) => {
              const timeSlotValue = parseInt(timeSlot, 10);
          
              if (timeSlotValue < unixFormat  && !lesson.isCompleted) {
        
                completedLessonsToConfirmByStudent.push(lesson);
        
              }
            });
          })


          res.status(201).json({ lessons: teacherLessons ,completedLessonsToConfirmByStudent:completedLessonsToConfirmByStudent});


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
        next();
      } else {

        try {
          const result = await Lesson.updateOne({ _id: id }, { $set: { isRejected: true } });
          const lessonObject = await Lesson.findById(new mongoose.Types.ObjectId(id));

          
          if (result.nModified === 0) {
            return res.status(404).json({ error: 'Lesson not found' });
          }

          await VirtualCreditAccount.updateOne(
            { _id: "646097d8d3dc09a70e20b0cb" },
            { $inc: { virtualAccount: -parseInt(lessonObject.billedPrice) } }
          );

          await User.updateOne({ _id: lessonObject.idStudent }, { $inc: { credits: parseInt(lessonObject.billedPrice) } });

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
        isCompleted: false ,
        isCancelled: false ,
        isReadConfirmation:false,
        $or: [
          { $and: [{ timeSlot: { $gt: unixFormat } }, { isConfirmed: true }] },
          { isRejected: true },
        
        ]
      });
      console.log('lesson controller 784',myNotifications.length)
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


  if (token) {
    jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
      if (err) {
        next(err); // Pass the error to the next middleware
      } else {
        try {
          // Use the `findByIdAndUpdate` method to update the lesson
          const updatedLesson = await Lesson.findByIdAndUpdate(
            lessonID,
            { isReadConfirmation: true },
            { new: true } // Return the updated document
          );

       
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
  
    next(); // If there is no token, continue to the next middleware or route handler
  }
};



module.exports.cancelLesson_put = async (req, res) => {
  const data = req.body;
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
      if (err) {
        next(); // You need to define 'next' if it's not already defined.
      } else {
        let user = await User.findById(decodedToken.id);
    
        try {
          const lesson = await Lesson.updateOne({ _id: data.idLesson }, { $set: { isCancelled: true } });

          if (!lesson) { // Corrected the condition here
            res.status(404).json({ error: 'Lesson not found' });
            return;
          }

          await VirtualCreditAccount.updateOne(
            { _id: "646097d8d3dc09a70e20b0cb" },
            { $inc: { virtualAccount: -parseInt(data.billedPrice) } }
          );

          await User.updateOne({ _id: user._id }, { $inc: { credits: parseInt(data.billedPrice) } });

          res.status(201).json({ message: 'Lesson canceled successfully' });
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    });
  }
};


module.exports.teacherNotification_get = async (req, res, next) => {
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
        idTeacher: user._id.toString(),
        $or: [
          { $and: [{ timeSlot: { $gt: unixFormat } }, { isCancelledNotificationRead: false} ,{isCancelled:true} ] }
      
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

module.exports.teacherNotification_put = async (req, res, next) => {
  const token = req.cookies.jwt;  
  const {lessonID} = req.body
  

  if (token) {
    jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
      if (err) {
        next(err); // Pass the error to the next middleware
      } else {
        try {
          // Use the `findByIdAndUpdate` method to update the lesson
          const updatedLesson = await Lesson.findByIdAndUpdate(
            lessonID,
            { isCancelledNotificationRead: true },
            { new: true } // Return the updated document
          );

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
  
    next(); // If there is no token, continue to the next middleware or route handler
  }
};





module.exports.confirmCompetedlesson_put = async (req, res) => {
  const { id,review } = req.body;
  const token = req.cookies.jwt;


  if (token) {
    jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
      if (err) {
        next();
      } else {
        try {
          const lessonObject = await Lesson.findById(new mongoose.Types.ObjectId(id));
          const result = await Lesson.updateOne({ _id: id }, { $set: { isCompleted: true , ranking:review} });

          if (result.nModified === 0) {
            return res.status(404).json({ error: 'Lesson not found' });
          }


          await VirtualCreditAccount.updateOne(
            { _id: "646097d8d3dc09a70e20b0cb" },
            { $inc: { virtualAccount: -parseInt(lessonObject.billedPrice) } }
          );

          await User.updateOne(
                { _id: lessonObject.idTeacher}, 
                 { $inc: { credits: parseInt(lessonObject.billedPrice) },
                      $push: {
                        transaction: {
                          date: new Date().toISOString(),
                          description: 'completed lesson',
                          amount: parseInt(lessonObject.billedPrice),
                          completed: "completed",
                        },
                },
                });

          
   

          res.status(201).json({ message: 'Completed Lesson confirmed successfully' });
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    });
  } 
};


module.exports.problemlesson_put = async (req, res) => {
  const { id,review } = req.body;
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
      if (err) {
        next();
      } else {
        try {
          const result = await Lesson.updateOne({ _id: id }, { $set: { completedProblem: true  , ranking:review} });

          if (result.nModified === 0) {
            return res.status(404).json({ error: 'Lesson not found' });
          }

          res.status(201).json({ message: 'Problem with Lesson confirmed successfully' });
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    });
  }
};



module.exports.deletelessons_put = async (req, res) => {
  try {
    // Delete documents that meet the specified condition
    const deleteResult = await Lesson.deleteMany({
      isCancelled: true,

    });

    // 'deleteResult' will contain information about the deletion operation

    res.status(200).json({
      message: `Deleted ${deleteResult.deletedCount} documents`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
