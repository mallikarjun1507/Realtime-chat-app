const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    from: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // 👇 Not required, because group chats don’t have a single "to"
    to: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },

    text: { type: String, required: true },

    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
      index: true
    },

    deliveredAt: { type: Date, default: null },
    readAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', MessageSchema);
