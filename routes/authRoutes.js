const { Router } = require('express');
const authController = require('../controllers/authController');
const lessonController = require('../controllers/lessonController');

const { requireAuth,checkUser,verifyUser,verifyUserResetPassword} = require('../middleware/authMiddleware');


const router = Router();



router.get('/api/loadhomedata', authController.loadhomedata);

router.post('/api/signup', authController.signup_post);
router.post('/api/login', authController.login_post);
router.get('/api/logout', authController.logout_get);
router.post('/api/fpassword', verifyUserResetPassword,authController.fpassword_post);
router.post('/api/verifyOTP',authController.verifyOTP_post) 
router.post('/api/resetpassword',authController.resetPassword_post) 
router.post('/api/changepassword',requireAuth,authController.changePassword_post) 
router.put('/api/updateprofile',requireAuth,authController.updateprofile_put) 

router.post('/api/updatelanguages',requireAuth,authController.updatelanguages_post) 
router.get('/api/updatelanguages',requireAuth,authController.updatelanguages_get) 

router.post('/api/updateteachinglanguages',requireAuth,authController.updateTeachinglanguages_post) 
router.get('/api/updateteachinglanguages',requireAuth,authController.updateTeachinglanguages_get) 

router.post('/api/teachertoggle',requireAuth,authController.teachertoggle_post) 

router.get('/api/findteachers',authController.findteachers_get)

// lessonCOntroller

router.get('/api/myteachers',requireAuth,lessonController.myteachers_get)
router.get('/api/mybookedlessons',requireAuth,lessonController.mybookedlessons_get)
router.get('/api/mystudents',requireAuth,lessonController.mystudents_get)
router.get('/api/myFinishedTeachingLessons',requireAuth,lessonController.myFinishedTeachingLessons)
router.get('/api/myUpcomingTeachingLessons',requireAuth,lessonController.myUpcomingTeachingLessons)

router.get('/api/teacherZone',requireAuth,lessonController.myteacherzone_get)

router.get('/api/teachersavedscheduleslot',requireAuth,lessonController.teachersavedscheduleslot_get)
router.put('/api/teachersavescheduleslot',requireAuth,lessonController.teachersavescheduleslot_put)

//router.get('/api/availablescheduleslot',requireAuth,lessonController.availablescheduleslot_get)

router.post('/api/savelessonslot',requireAuth,lessonController.saveLessonSlot_post) 
router.get('/api/lessondata',requireAuth,lessonController.lessonssData_get) 


router.get('/api/lessonreservationdata',requireAuth,lessonController.lessonReservation_get) 

router.put('/api/confirmlesson',requireAuth,lessonController.confirmlesson_put) 
router.put('/api/rejectlesson',requireAuth,lessonController.rejectlesson_put) 

//confirmation from teacher on studeden page 
router.get('/api/studentnotification',requireAuth,lessonController.lessonStudentNotification_get) 
router.put('/api/studentnotification',requireAuth,lessonController.lessonStudentNotification_put) 






router.get('/api/checkuser', checkUser, (req, res) => {
    if (req.user) {
        console.log(req.user)
        res.json({ user: req.user }); // This route should respond with the user data if the user is authenticated
    } 
 
});

router.get('/api/profile', requireAuth, (req, res) => {
    res.json({ user: req.user });
  });


module.exports = router;