# Realtime Chat App - Backend (Express + MongoDB + Socket.IO)

This is the backend server for the Realtime Chat App.  
It provides authentication, user management, conversations, messages, and real-time messaging with **Socket.IO**.

---

##  Setup Instructions

### 1. Clone Repository

git clone https://github.com/mallikarjun1507/Realtime-chat-app.git
cd server

# install required dependency

npm install


-----Create a .env file inside the server folder:// change asper your db -------

# Server
PORT=5000
NODE_ENV=development

CLIENT_ORIGIN=http://192.168.1.5:8081, "http://192.168.0.116:8081",


# Mongo
MONGO_URI=mongodb+srv://mallikarjun09051997:FBNZfJFcoBPRk5iT@cluster0.okmookv.mongodb.net/Realtime-Chat-app?retryWrites=true&w=majority

# JWT
JWT_SECRET=supersecret_change_me
JWT_EXPIRES_IN=7d


# Just  seed the data into your mongodb (command) already i make it auto seed if in case it didnt work just run below command
cd server - node seed/seed.js

# Run the project  for the backend (command)
nodemon server


--------------------------------------------------------------------------------------------------------------------------------
# front end setup already cloned the code 
cd mobile 

# install required dependency
 npm install

# Environment Variables (config.js)

---Create a file config.js in mobile:(change asper your IP )---

// Replace with your actual machine LAN IP where backend runs ,


export const API_BASE_URL =  'http://192.168.0.116:5000/api'  ,


// replace with your actual PC's WiFi IP ,


export const SOCKET_URL = "http://192.168.0.116:5000";  ,


Replace <your-local-ip> with your actual machine IP (example: 192.168.0.116).


----------------


# Run App
 npx expo start ,

 
 Scan QR code in Expo Go app ,

 
 Make sure your backend server is running before login


 # sample  users which i was used (to login)
 email- malli@example.com ,
 password -123456

 email - rahul@example.com ,
 password - 123456

 email - aru@example.com ,
 password - 123456
 

 

