const express = require('express');
const app = express();
const userRoute = express.Router();


const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const authorize = require("../middlewares/auth");
const { check, validationResult } = require('express-validator');

// User model
let User = require('../models/user');

// Add User
userRoute.route('/add-user').post(
    [
        check('first_name')
            .not()
            .isEmpty()
            .isLength({ min: 3 })
            .withMessage('Name must be at least 3 characters long'),
        check('user_email', 'Email is required')
            .not()
            .isEmpty(),
        check('ssn', 'SSN is required')
            .not()
            .isEmpty(),
        check('last_name', 'Last name must be at least 3 characters long')
            .not()
            .isEmpty()
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        console.log(errors);

        if (!errors.isEmpty()) {
            return res.status(422).jsonp(errors.array());
        }
        else {
            
            bcrypt.hash(req.body.ssn, 10).then((hashssn) => {

                const user = new User({
                first_name: req.body.first_name,
                user_email: req.body.user_email,
                last_name: req.body.last_name,
                fulladdress: req.body.fulladdress,
                dob: req.body.dob,
                ssn: hashssn,
                });

                user.save().then((response) => {
                    res.status(201).json({
                        message: "User successfully created!",
                        sucesslogin: true,
                        result: response
                    });
                }).catch(error => {
                    console.log(error);
                    res.status(500).json({
                        sucesslogin: false,
                        error: error
                    });
                });
            });
        }
});

// Get all users
userRoute.route('/').get((req, res) => {
    User.find((error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Get all users
userRoute.route('/users').get(authorize, (req, res) => {
    User.find((error, data) => {
      if (error) {
        return next(error)
      } else {
        res.json(data)
      }
    })
  })

// Get single user
userRoute.route('/read-user/:id').get(authorize, (req, res) => {
    User.findById(req.params.id, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})


// Update user
userRoute.route('/update-user/:id').put(authorize, (req, res, next) => {
    User.findByIdAndUpdate(req.params.id, {
    $set: req.body
  }, (error, data) => {
    if (error) {
      return next(error);
      console.log(error)
    } else {
      res.json(data)
      console.log('user successfully updated!')
    }
  })
})

// Delete user
userRoute.route('/delete-user/:id').delete(authorize, (req, res, next) => {
  User.findByIdAndRemove(req.params.id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).json({
        msg: data,
        sucessdelete: true,
      })
    }
  })
})

module.exports = userRoute;