const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('_id name email isOnline lastSeenAt')
      .sort({ isOnline: -1, name: 1 });

    // Include last message preview per user (optional/minimal)
    // For performance in MVP we’ll skip aggregation; frontend can call messages endpoint for a thread.

    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /conversations/:id/messages
 * :id is otherUserId
 * Finds or creates a 1:1 conversation (sorted pair) and returns messages (latest first)
 */
exports.getConversationMessages = async (req, res) => {
  try {
    const otherId = req.params.id;
    const me = req.user._id.toString();

    const pair = [me, otherId].sort();
    let convo = await Conversation.findOne({ members: pair });

    if (!convo) {
      convo = await Conversation.create({ members: pair, lastMessageAt: null, lastMessageText: '' });
    }

    const messages = await Message.find({ conversation: convo._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ conversationId: convo._id, messages });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};
