const express = require("express");
const app = express();
const session = require('express-session');
const { resolve } = require("path");
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const env = require("dotenv").config({ path: "./.env" });
const cors = require('cors');

const authRoutes = require('./routes/authRoutes'); // Import authRoutes

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
});

const PORT = process.env.PORT || 5252;

app.use(express.static(process.env.STATIC_DIR));
app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:3000', 
  credentials: true, 
};

app.use(cors(corsOptions));

app.use(cookieParser());

app.use(express.static('public'));


app.use(
  session({
    secret: 'your-secret-key', 
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 } // 1 minute (in milliseconds)
  })
);

const USER = process.env.USER;
const PASSWORD = process.env.PASSWORD;

const dbURI = `mongodb+srv://${USER}:${PASSWORD}@cluster0.ax6wn83.mongodb.net/?retryWrites=true&w=majority`;

app.get("/", (req, res) => {
  const path = resolve(process.env.STATIC_DIR + "/index.html");
  res.sendFile(path);
}); 

 app.get("/config", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

app.post("/create-payment-intent", async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "EUR",
      amount: 1999,
      automatic_payment_methods: { enabled: true },
    });

    // Send publishable key and PaymentIntent details to client
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
}); 

app.use(authRoutes); // Use the authRoutes middleware


mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => console.error('Error connecting to MongoDB:', err));



