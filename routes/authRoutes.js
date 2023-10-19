const { Router } = require('express');
const authController = require('../controllers/authController');
const lessonController = require('../controllers/lessonController');
const bankController = require('../controllers/bankController');
const chatController = require('../controllers/chatController');

const axios = require("axios")
const env = require("dotenv").config({ path: "./.env" });
const { google } = require("googleapis");

const { requireAuth,checkUser,verifyUserResetPassword,ban} = require('../middleware/authMiddleware');


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

router.delete('/api/deletelessons',lessonController.deletelessons_put)

//router.get('/api/availablescheduleslot',requireAuth,lessonController.availablescheduleslot_get)

router.post('/api/savelessonslot',requireAuth,lessonController.saveLessonSlot_post) 
router.get('/api/lessondata',requireAuth,lessonController.lessonssData_get) 



router.get('/api/lessonreservationdata',requireAuth,lessonController.lessonReservation_get) 

router.put('/api/confirmlesson',requireAuth,lessonController.confirmlesson_put) 
router.put('/api/rejectlesson',requireAuth,lessonController.rejectlesson_put) 


router.put('/api/confirmCompetedlesson',requireAuth,lessonController.confirmCompetedlesson_put) 
router.put('/api/problemlesson',requireAuth,lessonController.problemlesson_put) 

router.put('/api/cancellesson',requireAuth,lessonController.cancelLesson_put) 

//confirmation from teacher on studeden page 
router.get('/api/studentnotification',requireAuth,lessonController.lessonStudentNotification_get) 
router.put('/api/studentnotification',requireAuth,lessonController.lessonStudentNotification_put) 

router.get('/api/teachernotificationcancellesson',requireAuth,lessonController.teacherNotification_get) 
router.put('/api/teachernotificationcancellesson',requireAuth,lessonController.teacherNotification_put) 



// bank transaction

router.put('/api/buycredits',requireAuth,bankController.buycredits_put)
router.put('/api/withdrawmoney',requireAuth,bankController.withdrawmoney_put)
router.get('/api/gettransactions',requireAuth,bankController.gettransactions_get)


// chat
router.post('/api/chat',requireAuth,chatController.chat_post)
router.get('/api/getchatteachers',requireAuth,chatController.getChatteachers_get)
router.get('/api/getchatstudents',requireAuth,chatController.getChatStudents_get)
router.put('/api/teachermessage',requireAuth,chatController.teachermessage_put)
router.put('/api/studentmessage',requireAuth,chatController.studentmessage_put)


router.put('/api/teacherreadmessageofstudent',requireAuth,chatController.teacherreadmessageofstudent_put)
router.put('/api/studentreadmessageofteacher',requireAuth,chatController.studentreadmessageofteacher_put)






router.get('/api/checkuser', checkUser, (req, res) => {
    if (req.user) {
        res.json({ user: req.user }); // This route should respond with the user data if the user is authenticated
    } 
 
});


router.get('/api/profile', requireAuth, (req, res) => {
    res.json({ user: req.user });
  });



const apiKey = process.env.API_KEY;
const apiUrl = "https://www.googleapis.com/youtube/v3";

router.get('/api/test', (req, res) => {
    res.send('test');
});

router.get('/api/search', async (req, res, next) => {
    try {
      const searchQuery = req.query.search_query;
      const maxResults = 50; // You can adjust this value as needed
      let nextPageToken = req.query.pageToken || '';
      let items = [];
  
      while (items.length < 30) { // Continue fetching until you have at least 30 items
        const url = `${apiUrl}/search?key=${apiKey}&type=video&part=snippet&q=${searchQuery}&maxResults=${maxResults}&pageToken=${nextPageToken}`;
  
        const response = await axios.get(url);
        nextPageToken = response.data.nextPageToken;
        console.log(response.data)
  
        const pageItems = response.data.items.map((item) => ({
          title: item.snippet.title,
          imageUrl: item.snippet.thumbnails.high.url,
          etag:item.etag,
          id:item.id
        }));
  
        items = items.concat(pageItems); // Add the items from the current page to the result
  
        if (!nextPageToken) {
          break; // Exit the loop if there are no more pages
        }
      }
  
      res.json(items.slice(0, 30)); // Send the first 30 items
    } catch (err) {
      next(err);
    }
  });
  

  const youtube = google.youtube({
    version: "v3",
    auth: apiKey,
    
  });

  
  router.get('/api/search-with-googleapis', async (req, res,next) => {
    try {
        const searchQuery = req.query.search_query
        const response = await youtube.search.list({
            part: "snippet",
            q: searchQuery,
          });


        const titles = response.data.items.map((item)=> item.snippet)
        res.send(titles)

    } catch(err) {
        next(err)
    }

  }); 

  module.exports = router;