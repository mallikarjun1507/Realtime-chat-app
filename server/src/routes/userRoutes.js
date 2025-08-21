const router = require('express').Router();
const auth = require('../middleware/auth');
const { getUsers, getConversationMessages } = require('../controllers/userController');

router.get('/', auth, getUsers);
router.get('/../conversations/:id/messages', (req, res) => res.status(404).json({ message: 'Moved' }));
// Correct route per spec:
router.get('/conversations/:id/messages', auth, getConversationMessages);

module.exports = router;
