const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
// Load User Model
const User = require('../../models/User');
const keys = require('../../config/keys');
// Load input Validation
const validateReqisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');
router.get('/test', (req, res) => res.json({ msg: 'user Works' }));

// @route   GET api/users/register
// @desc    Register user
// @ access Public

router.post('/register', (req, res) => {
  const { errors, isValid } = validateReqisterInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = 'Email Already exists';
      return res.status(400).json(errors);
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route   GET api/users/login
// @desc    return JWT
// @ access Public

router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  const email = req.body.email;
  const password = req.body.password;

  if (!isValid) {
    return res.status(400).json(errors);
  }
  // Find the user by email

  User.findOne({ email }).then(user => {
    if (!user) {
      errors.email = 'user not found';
      return res.status(404).json(errors);
    } else {
      // Check Password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          // User Matched
          const payload = {
            id: user._id,
            name: user.name
          };
          // Sign Token

          jwt.sign(
            payload,
            keys.secretKey,
            { expiresIn: 3600 },
            (err, token) => {
              res.json({
                success: true,
                token: `Bearer ${token}`
              });
            }
          );
        } else {
          errors.password = 'password incorrect';
          return res.status(400).json(errors);
        }
      });
    }
  });
});

// @route   GET api/users/current
// @desc    return Current user
// @ access Private

router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
