const User = require("../models/User");
const Account = require("../models/Account");
const Lesson = require("../models/Lesson");
const Bank = require("../models/Bank");
const VirtualCreditAccount = require("../models/VirtualCreditAccount")
const jwt = require('jsonwebtoken');
var moment = require('moment');
const path = require('path');
moment().format(); 
const mongoose = require('mongoose');



module.exports.buycredits_put = async (req, res) => {

  const token = req.cookies.jwt;
  const {credits} = req.body
  const bankTax = 2


  if (token) {
      jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
        if (err) {
          next();
        } else {
          try {

            let user = await User.findById(decodedToken.id);

           
            await Account.updateOne({ _id: '64608bcbec0b9aed6a3d6afe' }, { $inc: { account: parseInt(credits)+2 } });

            const account = await Account.findOne({ _id: '64608bcbec0b9aed6a3d6afe' });
            
            await Bank.create({
              currentBalance: {
                currentBalance:  account.account,
                TransactedDay: Date.now(),
              },
              moneyDepositedByStudent: {
                idStudent: user._id,
                amount: parseInt(credits+bankTax) ,
              },
            });

  
            await User.updateOne(
              { _id: user._id },
              {
                $inc: { credits: parseInt(credits-bankTax) },
                $push: {
                  transaction: {
                    date: new Date().toISOString(),
                    description: 'buying credits',
                    amount: parseInt(credits-bankTax),
                    completed: "completed",
                  },
                },
              }
            );
  
            res.status(201).json({ message: 'Credits bought successfully' });
          } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
          }
        }
      });
    }  
  };

  module.exports.withdrawmoney_put = async (req, res) => {
    const token = req.cookies.jwt;
    const {credits} = req.body
    const bankTax = 2

  
    if (token) {
        jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
          if (err) {
            next();
          } else {
            try {
  
              let user = await User.findById(decodedToken.id);
  
             
              await Account.updateOne({ _id: '64608bcbec0b9aed6a3d6afe' }, { $inc: { account: -parseInt(credits-bankTax) } });
  
              const account = await Account.findOne({ _id: '64608bcbec0b9aed6a3d6afe' });
              
              await Bank.create({
                currentBalance: {
                  currentBalance:  account.account,
                  TransactedDay: Date.now(),
                },
                moneyWithdrawnByTeacher: {
                  idStudent: user._id,
                  amount: -parseInt(credits-bankTax) ,
                },
              });
  

              await User.updateOne(
                { _id: user._id },
                {
                  $inc: { credits: -parseInt(credits-bankTax) },
                  $push: {
                    transaction: {
                      date: new Date().toISOString(),
                      description: 'withdraw money',
                      amount: -parseInt(credits+bankTax),
                      completed: "completed",
                    },
                  },
                }
              );
    
              res.status(201).json({ message: 'Money withdrawed successfully' });
            } catch (err) {
              console.error(err);
              res.status(500).json({ error: 'Internal server error' });
            }
          }
        });
      }  
  };



  module.exports.gettransactions_get = async (req, res) => {
    const token = req.cookies.jwt;

  
    if (token) {
        jwt.verify(token, process.env.KEY, async (err, decodedToken) => {
          if (err) {
            next();
          } else {
            try {
  
              let user = await User.findById(decodedToken.id);
  
      
              const transactions = user.transaction

    
              res.status(201).json({ transactions: transactions });
            } catch (err) {
              console.error(err);
              res.status(500).json({ error: 'Internal server error' });
            }
          }
        });
      }  
  };