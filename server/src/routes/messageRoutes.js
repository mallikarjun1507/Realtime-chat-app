const router = require('express').Router();
const auth = require('../middleware/auth');
const { noop } = require('../controllers/messageController');

// Placeholder; sockets do send/read. Useful for health checks.
router.get('/health', auth, noop);

module.exports = router;
