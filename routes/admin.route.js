// routes/auth.routes.js

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const adminSchema = require("../models/Admin");
const authorize = require("../middlewares/auth");
const { check, validationResult } = require('express-validator');

// Sign-up route to register a new admin
router.post("/register-admin",
    [
        check('first_name')
            .not()
            .isEmpty()
            .isLength({ min: 3 })
            .withMessage('Name must be atleast 3 characters long'),
        check('admin_email', 'Email is required')
            .exists(true,true)
            .not()
            .isEmpty(),
        check('admin_email', 'Email already exist')
            .custom((value, { req }) =>  adminSchema.findOne( { admin_email: value }) == null ),        
        check('admin_password', 'Password should be between 5 to 8 characters long')
            .exists(true,true)
            .not()
            .isEmpty()
            .isLength({ min: 5, max: 12 })
    ], // We check here if mandatory fields are not empty and that email is unique
    (req, res, next) => {
        const errors = validationResult(req);
        console.log(errors);

        // If there are errors in the validation we return errors
        if (!errors.isEmpty()) {
            return res.status(422).jsonp(errors.array());
        }
        else {
            // If there is no errors then password is encrypted and new admin is saved
            bcrypt.hash(req.body.admin_password, 10).then((hashpassword) => {
                bcrypt.hash(req.body.ssn, 10).then((hashssn) => {
                  const user = new adminSchema({
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    admin_email: req.body.admin_email,
                    admin_password: hashpassword,
                    ssn: hashssn,
                  });
                  user.save().then((response) => {
                      res.status(201).json({
                          message: "Admin successfully created!",
                          sucesslogin: true,
                          result: response
                      });
                  }).catch(error => {
                      res.status(500).json({
                          sucesslogin: false,
                          error: error
                      });
                  });
              });
            });
        }
    });


// Sign-in route for admin user
router.post("/signin", (req, res, next) => {
    let getUser;
    // Default signin credentials for default admin user
    if (req.body.admin_email == "adminuser@linqpal.com" && req.body.admin_password == "123456789")  {
        let jwtToken = jwt.sign({
            admin_email: req.body.admin_email,
              userId: 0
          }, "longer-secret-is-better", {
              expiresIn: "1h"
          });
          res.status(200).json({
              token: jwtToken,
              expiresIn: 3600,
              _id: 0
          });
    } else {
        // if email is different from default admin email then we check that user exists and that password is correct
        adminSchema.findOne({
            admin_email: req.body.admin_email
          }).then(user => {
              if ( !user ) {
                  return res.status(401).json({
                      message: "Authentication failed"
                  });
              }
              getUser = user;
              return bcrypt.compare(req.body.admin_password, user.admin_password);
          }).then(response => {
              if (!response) {
                  return res.status(401).json({
                      message: "Authentication failed"
                  });
              }
              let jwtToken = jwt.sign({
                admin_email: getUser.admin_email,
                  userId: getUser._id
              }, "longer-secret-is-better", {
                  expiresIn: "1h"
              });
              res.status(200).json({
                  token: jwtToken,
                  expiresIn: 3600,
                  _id: getUser._id
              });
          }).catch(err => {
              return res.status(401).json({
                  message: "Authentication failed"
              });
          });
    }
});

// Get List of admins
router.route('/').get((req, res) => {
    adminSchema.find((error, response) => {
        if (error) {
            return next(error)
        } else {
            res.status(200).json(response)
        }
    })
})

// Get all admins
router.route('/admins').get(authorize, (req, res) => {
    adminSchema.find((error, data) => {
      if (error) {
        return next(error)
      } else {
        res.json(data)
      }
    })
  })

// Get Single Admin
router.route('/user-profile/:id').get(authorize, (req, res, next) => {
    adminSchema.findById(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                msg: data
            })
        }
    })
})

// Update Admin
router.route('/update-admin/:id').put((req, res, next) => {
    adminSchema.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, (error, data) => {
        if (error) {
            return next(error);
            console.log(error)
        } else {
            res.json(data)
            console.log('User successfully updated!')
        }
    })
})




// Delete user
router.route('/delete-admin/:id').delete(authorize, (req, res, next) => {
    adminSchema.findByIdAndRemove(req.params.id, (error, data) => {
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

module.exports = router;