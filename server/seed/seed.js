const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });

// Import models
const User = require('../src/models/User');
const Conversation = require('../src/models/Conversation');
const Message = require('../src/models/Message');

const seedData = async () => {
  try {
    // MongoDB URI from env
    const mongoURI = process.env.MONGO_URI || "mongodb+srv://mallikarjun09051997:FBNZfJFcoBPRk5iT@cluster0.okmookv.mongodb.net/Realtime-Chat-app";

    // Connect DB
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(" MongoDB Connected...");

    // Clear existing data
    await User.deleteMany();
    await Conversation.deleteMany();
    await Message.deleteMany();
    console.log("🧹 Old data cleared");

    // Create sample users
    const passwordHash = await bcrypt.hash("123456", 10);

    const users = await User.insertMany([
      { name: "Mallikarjun", email: "malli@example.com", password: passwordHash },
      { name: "Kaveri", email: "kaveri@example.com", password: passwordHash },
      { name: "Rahul", email: "rahul@example.com", password: passwordHash }
    ]);

    console.log("👤 Users created:", users.map(u => u.email));

    // ---------------- Mallikarjun ↔ Kaveri ----------------
    const convo1 = await Conversation.create({
      participants: [users[0]._id, users[1]._id],
    });

    const messages1 = await Message.insertMany([
      {
        conversation: convo1._id,
        from: users[0]._id,
        to: users[1]._id,
        text: "Hi Kaveri, how are you?",
        delivered: true,
        read: false,
      },
      {
        conversation: convo1._id,
        from: users[1]._id,
        to: users[0]._id,
        text: "Hey Malli, I’m good! What about you?",
        delivered: true,
        read: false,
      },
    ]);

    convo1.lastMessage = messages1[messages1.length - 1]._id;
    await convo1.save();
    console.log(" Conversation Mallikarjun ↔ Kaveri created");

    // ---------------- Mallikarjun ↔ Rahul ----------------
    const convo2 = await Conversation.create({
      participants: [users[0]._id, users[2]._id],
    });

    const messages2 = await Message.insertMany([
      {
        conversation: convo2._id,
        from: users[2]._id,
        to: users[0]._id,
        text: "Hey Malli, did you check the new project?",
        delivered: true,
        read: false,
      },
      {
        conversation: convo2._id,
        from: users[0]._id,
        to: users[2]._id,
        text: "Yes Rahul, I’ll review it tonight.",
        delivered: true,
        read: false,
      },
      {
        conversation: convo2._id,
        from: users[2]._id,
        to: users[0]._id,
        text: "Cool, ping me if you need help!",
        delivered: true,
        read: false,
      },
    ]);

    convo2.lastMessage = messages2[messages2.length - 1]._id;
    await convo2.save();
    console.log(" Conversation Mallikarjun ↔ Rahul created");

    // ---------------- Group Chat ----------------
    const convo3 = await Conversation.create({
      participants: [users[0]._id, users[1]._id, users[2]._id],
    });

    const messages3 = await Message.insertMany([
      {
        conversation: convo3._id,
        from: users[0]._id,
        to: null,
        text: "Hey everyone, welcome to the group chat!",
        delivered: true,
        read: false,
      },
      {
        conversation: convo3._id,
        from: users[1]._id,
        to: null,
        text: "Nice! This will be easier for updates.",
        delivered: true,
        read: false,
      },
      {
        conversation: convo3._id,
        from: users[2]._id,
        to: null,
        text: "Cool, let’s share files here too!",
        delivered: true,
        read: false,
      },
    ]);

    convo3.lastMessage = messages3[messages3.length - 1]._id;
    await convo3.save();
    console.log("👥 Group conversation (Mallikarjun, Kaveri, Rahul) created");

    console.log(" Seeding completed successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(" Error seeding data:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedData();
