const { Server } = require('socket.io');
const { CLIENT_ORIGIN } = require('../config/env');
const { verifyToken } = require('../utils/tokens');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

/**
 * presence: Map<userId, Set<socketId>>
 */
const presence = new Map();

function addPresence(userId, socketId) {
  if (!presence.has(userId)) presence.set(userId, new Set());
  presence.get(userId).add(socketId);
}

function removePresence(userId, socketId) {
  if (!presence.has(userId)) return;
  const set = presence.get(userId);
  set.delete(socketId);
  if (set.size === 0) presence.delete(userId);
}

function isOnline(userId) {
  return presence.has(userId);
}

module.exports = function initSockets(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: CLIENT_ORIGIN || "*",   // ✅ fallback for Expo Go / mobile testing
      credentials: true
    }
  });

  // --- Auth middleware for sockets ---
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization || "").replace("Bearer ", "");

      if (!token) return next(new Error("No token provided"));

      const payload = verifyToken(token);
      if (!payload) return next(new Error("Invalid or expired token"));

      socket.userId = payload.id;
      next();
    } catch (err) {
      console.error("Socket auth error:", err);
      next(new Error("Authentication error"));
    }
  });

  // --- Connection ---
  io.on("connection", async (socket) => {
    const userId = socket.userId;
    if (!userId) return;

    addPresence(userId, socket.id);
    await User.findByIdAndUpdate(userId, { isOnline: true });

    // Notify others
    socket.broadcast.emit("presence:update", { userId, isOnline: true });

    // Join private room
    socket.join(userId.toString());

    // --- Typing indicators ---
    socket.on("typing:start", (payload) => {
      if (!payload?.to) return;
      io.to(payload.to).emit("typing:start", {
        from: userId,
        conversationId: payload.conversationId,
      });
    });

    socket.on("typing:stop", (payload) => {
      if (!payload?.to) return;
      io.to(payload.to).emit("typing:stop", {
        from: userId,
        conversationId: payload.conversationId,
      });
    });

    // --- Message send ---
    socket.on("message:send", async (payload, ack) => {
      try {
        const { to, text } = payload || {};
        if (!to || !text)
          return typeof ack === "function" &&
            ack({ ok: false, error: "to & text required" });

        const pair = [userId.toString(), to.toString()].sort();
        let convo = await Conversation.findOne({ members: pair });
        if (!convo) {
          convo = await Conversation.create({ members: pair });
        }

        let msg = await Message.create({
          conversation: convo._id,
          from: userId,
          to,
          text,
          status: "sent",
        });

        await Conversation.findByIdAndUpdate(convo._id, {
          lastMessageAt: msg.createdAt,
          lastMessageText: text,
        });

        // Deliver to recipient if online
        if (isOnline(to.toString())) {
          msg = await Message.findByIdAndUpdate(
            msg._id,
            { status: "delivered", deliveredAt: new Date() },
            { new: true }
          );
          io.to(to.toString()).emit("message:new", { message: msg });
        }

        // Always notify sender
        io.to(userId.toString()).emit("message:new", { message: msg });

        if (typeof ack === "function") ack({ ok: true, message: msg });
      } catch (e) {
        console.error("message:send error", e);
        if (typeof ack === "function")
          ack({ ok: false, error: "Server error" });
      }
    });

    // --- Mark read ---
    socket.on("message:read", async (payload, ack) => {
      try {
        const { messageId } = payload || {};
        if (!messageId)
          return typeof ack === "function" &&
            ack({ ok: false, error: "messageId required" });

        let msg = await Message.findById(messageId);
        if (!msg)
          return typeof ack === "function" &&
            ack({ ok: false, error: "Not found" });

        if (msg.to.toString() !== userId.toString()) {
          return typeof ack === "function" &&
            ack({ ok: false, error: "Forbidden" });
        }

        if (msg.status !== "read") {
          msg.status = "read";
          msg.readAt = new Date();
          await msg.save();
        }

        io.to(msg.from.toString()).emit("message:update", {
          messageId: msg._id,
          status: "read",
          readAt: msg.readAt,
        });

        if (typeof ack === "function") ack({ ok: true });
      } catch (e) {
        console.error("message:read error", e);
        if (typeof ack === "function")
          ack({ ok: false, error: "Server error" });
      }
    });

    // --- Disconnect ---
    socket.on("disconnect", async () => {
      removePresence(userId, socket.id);
      if (!isOnline(userId)) {
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeenAt: new Date(),
        });
        socket.broadcast.emit("presence:update", {
          userId,
          isOnline: false,
        });
      }
    });
  });

  return io;
};
