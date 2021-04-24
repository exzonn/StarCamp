const express = require('express');
const router = express.Router();
const passport = require('passport');
const asyncWrapper = require('../utilities/asyncWrapper');
const User = require('../models/user');
const user = require('../controllers/user');

router.route('/register')
    .get(user.registerForm)
    .post(asyncWrapper(user.register));

router.route('/login')
    .get(user.loginForm)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), user.login);

router.get('/logout', user.logout);

module.exports = router;