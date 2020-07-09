const express = require('express');
const router = express.Router();
const User = require('./models/User');
const {
  registerValidation,
  loginValidation,
  verifyLogin
} = require('./utils/userValidation');
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const {
  register,
  updateProfile,
  updatePassword
} = require('./controllers/userController');

const { createUserCart } = require('../cart/controllers/cartController');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send(
    '<h1 style="font-size:100px; display:flex;justify-content:center;padding-top:100px;color:skyblue;">Online Shopper</h1>'
  );
});

// const checkRegister = [
//   check('name', 'Name is required').not().isEmpty(),
//   check('email', 'Please include a valid email').isEmail(),
//   check('password', 'Please Include a valid password').isLength({ min: 6 })
// ];

router.post('/register', registerValidation, register, createUserCart);

// const isAuth = (req, res, next) => {};

router.get('/register', (req, res) => {
  console.log('login', req.session);
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  return res.render('auth/register');
});

// router.post('/register', (req, res, next) => {
//   User.findOne({ email: req.body.email }).then((user) => {
//     if (user) {
//       return res.status(401).json({ msg: 'User Already Exists' });
//     } else {
//       const user = new User();
//       user.profile.name = req.body.name;
//       user.email = req.body.email;
//       user.password = req.body.password;

//       user.save((err) => {
//         if (err) return next(err);
//         return res.status(200).json({ message: 'success', user });
//       });
//     }
//   });
// });

router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.render('main/home');
  }

  return res.render('auth/login');
});

router.post(
  '/login',
  [loginValidation, verifyLogin],
  passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/api/users/login',
    failureFlash: true
  })
);

router.get('/profile', (req, res, next) => {
  console.log(req.user);
  if (req.isAuthenticated()) {
    return res.render('auth/profile');
  }
  return res.send('Unauthorized');
});

router.get('/update-profile', (req, res) => {
  return res.render('auth/update-profile');
});

// router.put('/update-profile', (req, res, next) => {
//   return new Promise((resolve, reject) => {
//     User.findById({ _id: req.user._id })
//       .then((user) => {
//         const { email, address } = req.body;
//         if (req.body.name) user.profile.name = req.body.name;
//         if (email) user.email = email;
//         if (address) user.address = address;
//         return user;
//       })
//       .then((user) => {
//         user
//           .save()
//           .then((user) => {
//             return res.json({ user });
//             // resolve(user);
//           })
//           .catch((err) => reject(err));
//       })
//       .catch((err) => reject(err));
//   });
// });

router.put('/update-profile', (req, res, next) => {
  updateProfile(req.body, req.user._id)
    .then(() => {
      return res.redirect(301, '/api/users/profile');
    })
    .catch((err) => next(err));
});

const checkPassword = [
  check('oldPassword', 'Please Include a valid password').isLength({ min: 6 }),
  check('newPassword', 'Please Include a valid password').isLength({ min: 6 }),
  check('repeatNewPassword', 'Please Include a valid password').isLength({
    min: 6
  })
];

router.put('/update-password', checkPassword, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ errors: errors.array() });
  try {
    updatePassword(req.body, req.user._id)
      .then(() => {
        return res.redirect('/api/users/profile');
      })
      .catch((err) => {
        console.log(err);
        req.flash('perrors', 'Unable to Update user');
        return res.redirect('/api/users/update-profile');
      });
  } catch (errors) {
    console.log(errors);
  }
});
module.exports = router;
