require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // ✅ Allowed origins for CORS (Laptop + Mobile)
  CLIENT_ORIGINS: [
    "http://localhost:8081",        // Expo web on laptop
    "http://192.168.0.116:8081",    // Laptop WiFi IPv4
    "http://192.168.1.5:8081"       // Sometimes Expo uses this IP
  ],

  // ✅ JWT Config
  JWT_SECRET: process.env.JWT_SECRET || "supersecret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // ✅ Mongo URI
  MONGO_URI: process.env.MONGO_URI || "mongodb+srv://mallikarjun09051997:FBNZfJFcoBPRk5iT@cluster0.okmookv.mongodb.net/Realtime-Chat-app?retryWrites=true&w=majority"

};
