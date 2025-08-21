const mongoose = require('mongoose');
const { Schema } = mongoose;

const ConversationSchema = new Schema(
  {
    members: [{ type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }],
    lastMessageAt: { type: Date, default: null },
    lastMessageText: { type: String, default: '' }
  },
  { timestamps: true }
);

// Ensure only one conversation per pair (ascending sorted unique index)
ConversationSchema.index({ members: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', ConversationSchema);
