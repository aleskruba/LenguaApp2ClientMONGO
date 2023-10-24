const User = require("../models/User");
const Lesson = require("../models/Lesson");
const ChatMessage = require("../models/ChatMessage");
const jwt = require('jsonwebtoken');
var moment = require('moment');
const path = require('path');
moment().format(); 
const mongoose = require('mongoose');



module.exports.chat_post = async (req, res, next) => {
    const values = req.body.values;
    const idTeacher = req.body.idTeacher;
    
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
            if (err) {
                next();
            } else {
                let user = await User.findById(decodedToken.id);
                let teacher = await User.findById(new mongoose.Types.ObjectId(idTeacher));
                res.locals.user = user;

                try {
                    const chatData = {
                        sender_id: user._id,
                        senderId: user.idUser,
                        senderFirstName: user.firstName,
                        senderLastName: user.lastName,
                        senderCountry: user.country,
                        senderImgProfile: user.profile,
                        receiver_id: teacher.id,
                        receiverId: teacher.idUser,
                        receiverFirstName: teacher.firstName,
                        receiverLastName: teacher.lastName,
                        receiverCountry: teacher.country,
                        receiverImgProfile: teacher.profile,
                        language: values.language,
                        level: values.level,
                        purpose: values.preferencies,
                        firstMessage: {
                            message: values.message
                        }
                    };

                    // Create a new Chat document and save it to the database
                    const chat = await ChatMessage.create(chatData);

                    // If you prefer to use save method:
                    // const chat = new Chat(chatData);
                    // await chat.save();
                    res.status(200).json({ message: 'updated successfully'});
                    console.log("Chat message saved to the database:", chat);
                } catch (err) {
                    console.error("Error saving chat message:", err);
                }
            }
        });
    } else {
        next();
    }
};


module.exports.getChatteachers_get = async (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
            if (err) {
                next();
            } else {
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;

                try {
                    // Find chat messages where sender_id matches user._id
                    const teachers = await ChatMessage.find({ sender_id: user._id });
             
                    res.send({ teachers })
                    
                    
               
                } catch (err) {
                    console.error("Error retrieving chat messages:", err);
                }
            }
        });
    } else {
        next();
    }
};

module.exports.getChatStudents_get= async (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
            if (err) {
                next();
            } else {
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;

                try {
                    // Find chat messages where sender_id matches user._id
                    const students = await ChatMessage.find({  receiver_id: user._id });
                    
                    res.send({ students })
                    
                                  
                } catch (err) {
                    console.error("Error retrieving chat messages:", err);
                }
            }
        });
    } else {
        next();
    }
};





module.exports.teachermessage_put = async (req, res, next) => {
    const values = req.body;
    const student_id = values.student_id;
    const message = values.message;

    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
            if (err) {
                next();
            } else {
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;

                try {
                    const chatMessage = await ChatMessage.findOne({
                        sender_id: student_id,
                        receiver_id: user.id
                    });

                    if (chatMessage) {
                        // Update chatThreads array with the new message
                        chatMessage.chatThreads.push({
                            sender_ID:user._id,
                            sender: user.firstName,
                            message: message,
                            receiver_ID:student_id,
                            createdAt: new Date(),
                            isRead: false
                        });

                        // Save the updated chat message
                        await chatMessage.save();
                        res.status(200).json({ message: 'updated successfully'});
                        console.log("Chat message updated to the database:", chatMessage);
                    } else {
                        console.error("Chat message not found.");
                    }
                } catch (err) {
                    res.status(500).json({ error:err});
                          }
            }
        });
    } else {
        next();
    }
};


module.exports.studentmessage_put = async (req, res, next) => {
    const values = req.body;
    const teacher_id = values.teacher_id;
    const message = values.message;

    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
            if (err) {
                next();
            } else {
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;

                   try {
                    const chatMessage = await ChatMessage.findOne({
                        receiver_id: teacher_id,
                        sender_id: user.id
                    });

                    console.log(teacher_id)
                    console.log(user.id)

                    if (chatMessage) {
                        // Update chatThreads array with the new message
                        chatMessage.chatThreads.push({
                            sender_ID:user._id,
                            sender: user.firstName,
                            message: message,
                            receiver_ID:teacher_id,
                            createdAt: new Date(),
                            isRead: false
                        });

                        // Save the updated chat message
                        await chatMessage.save();
                        res.status(200).json({ message: 'updated successfully'});
                        console.log("Chat message updated to the database:");
                    } else {
                        console.error("Chat message not found.");
                    }
                } catch (err) {
                    res.status(500).json({ error:err});
                          }
            }
        });
    } else {
        next();
    }
};




module.exports.teacherreadmessageofstudent_put = async (req, res, next) => {
    const values = req.body;
    const student_id = values.student_id;
    console.log('student ID', student_id);

    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
            if (err) {
                next();
            } else {
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                try {
                    const chatMessage = await ChatMessage.findOne({
                        receiver_id: user.id,
                        sender_id: student_id
                    });

                    if (chatMessage.firstMessage && !chatMessage.firstMessage.isRead) {
                        chatMessage.firstMessage.isRead = true;
                    }

                    if (chatMessage.chatThreads ) {
                        chatMessage.chatThreads.forEach(thread => {
                            if (thread.isRead === false  ) {
                                thread.isRead = true;
                            }
                        });
                    }

                    await chatMessage.save(); // Save the updated chatMessage
                    res.status(200).json({ message: 'updated successfully'});
                } catch (err) {
                    console.log('error',err);
                }
            }
        });
    } else {
        next();
    }
};



module.exports.studentreadmessageofteacher_put= async (req, res, next) => {
    const values = req.body;
    const teacher_id = values.teacher_id;
    console.log(teacher_id)

 const token = req.cookies.jwt;
 if (token) {
     jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
         if (err) {
             next();
         } else {
             let user = await User.findById(decodedToken.id);
             res.locals.user = user;
             try {
                const chatMessage = await ChatMessage.findOne({
                    receiver_id: teacher_id,
                    sender_id: user._id
                });

                if (chatMessage.firstMessage && !chatMessage.firstMessage.isRead) {
                    chatMessage.firstMessage.isRead = true;
                }

                if (chatMessage.chatThreads) {
                    chatMessage.chatThreads.forEach(thread => {
                        if (thread.isRead === false) {
                            thread.isRead = true;
                        }
                    });
                }

                await chatMessage.save(); // Save the updated chatMessage
                res.status(200).json({ message: 'updated successfully'});
            } catch (err) {
                console.log(err);
            }
         }
     });
 } else {
     next();
 }
};