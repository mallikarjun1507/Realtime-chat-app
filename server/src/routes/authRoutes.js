const router = require('express').Router();
const { register, login } = require('../controllers/authController');
const { registerRules, loginRules, handleValidation } = require('../utils/validate');

router.post('/register', registerRules, handleValidation, register);
router.post('/login',    loginRules,    handleValidation, login);

module.exports = router;
