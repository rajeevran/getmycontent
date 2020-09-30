'use strict';
var express = require("express");
var apiService = require('../services/apiService');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var config = require('../config');

var secretKey = config.secretKey;

    var api = express.Router();
    api.use(bodyParser.json());
    api.use(bodyParser.urlencoded({
        extended: false
    }));

    

    //Register
    api.post('/register', function (req, res) {
        apiService.register(req.body, req.files, function (response) {
            res.status(response.STATUSCODE).send(response)
        });
    });
    //Otp Resend
    api.post('/otpResend', function (req, res) {
        apiService.otpResend(req.body, function (response) {
            res.status(response.STATUSCODE).send(response)
        });
    });
    //Otp Verification
    api.post('/verifyEmailOtp', function (req, res) {
        apiService.verifyEmailOtp(req.body, function (response) {
            res.status(response.STATUSCODE).send(response)
        });
    });
    //Login
    api.post('/login', function (req, res) {
        apiService.login(req.body, function (response) {
            res.status(response.STATUSCODE).send(response)
        });
    });
    //Forgot password
    api.post('/forgotPassword', function (req, res) {
        apiService.forgotPassword(req.body, function (response) {
            res.status(response.STATUSCODE).send(response);
        });
    });

    //Reset Password
    api.post("/resetPassword/:id", function (req, res) {
        console.log(req.body, req.params.id)
        let resetdata= { ...req.body, _id: req.params.id }
        apiService.resetPassword(resetdata, function (response) {
            res.status(response.STATUSCODE).send(response);
        });
    });

    //list Terms
    api.get('/listTerms', function (req, res) {
        apiService.listTerms(req.query, function (response) {
            res.status(response.STATUSCODE).send(response);
        });
    });

    //edit Terms
    api.post('/editTerms', function (req, res) {
        apiService.editTerms(req.body, function (response) {
            res.status(response.STATUSCODE).send(response);
        });
    });

    //list PrivacyPolicy
    api.get('/listPrivacyPolicy', function (req, res) {
        apiService.listPrivacyPolicy(req.query, function (response) {
            res.status(response.STATUSCODE).send(response);
        });
    });

    //edit PrivacyPolicy
    api.post('/editPrivacyPolicy', function (req, res) {
        apiService.editPrivacyPolicy(req.body, function (response) {
            res.status(response.STATUSCODE).send(response);
        });
    });


    //list AboutUs
    api.get('/listAboutUs', function (req, res) {
        apiService.listAboutUs(req.query, function (response) {
            res.status(response.STATUSCODE).send(response);
        });
    });

    //edit AboutUs
    api.post('/editAboutUs', function (req, res) {
        apiService.editAboutUs(req.body, function (response) {
            res.status(response.STATUSCODE).send(response);
        });
    });

    //list User
    api.get('/snapchatCallback', function (req, res) {
        apiService.listUser(req.query, function (response) {
            res.status(response.STATUSCODE).send(response);
        });
    });

    //list Booking
    api.get('/listBooking', function (req, res) {
        apiService.listBooking(req.query, function (response) {
            res.status(response.STATUSCODE).send(response);
        });
    });

    
    //testNotification
    api.post('/testNotification', function (req, res) {
        apiService.testNotification(req.body, function (response) {
            res.status(response.STATUSCODE).send(response);
        });
    });

    //social Login
    api.post('/socialLogin', (req, res) => {

        apiService.socialRegister(req.body, function (response) {
             res.status(response.STATUSCODE).send(response);
        });
    });

    /******************************
     *  Middleware to check token
     ******************************/
    api.use(function (req, res, next) {

        //console.log('req.body------>',req.body)
        //console.log('req.headers------>',req.headers)
        //console.log('req.query------>',req.query)

        var token = req.body.authtoken || req.query.authtoken || req.headers['x-access-token'];
        if (token) {
            jwt.verify(token, secretKey, function (err, decoded) {
                if (err) {
                    res.status(400).send({
                        success: false,
                        STATUSCODE: 400,
                        message: "Session timeout! Please login again.",
                        response: err
                    });
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            res.status(404).send({
                success: false,
                STATUSCODE: 404,
                message: "Please provide required information",
                response: {}
            });
        }
    });
    /******************************
     *  Middleware to check token
     ******************************/


    //list User
    api.get('/reportedUserList', function (req, res) {
        apiService.reportedUserList(req.query, function (response) {
            res.status(response.STATUSCODE).send(response);
        });
    });

    //edit User
    api.post('/editUser', function (req, res) {
        console.log('req.files--->',req.files)
        apiService.editUser(req.body, req.files, function (response) {
            res.status(response.STATUSCODE).send(response);
        });
    });

    //Change password
    api.post('/changePassword', function (req, res) {
        req.body.userId = req.decoded.id;
        apiService.changePassword(req.body, function (response) {
            res.status(response.STATUSCODE).send(response)
        })
    });

    // Edit Profile
    api.post('/editProfile', function (req, res) {
        req.body.userId = req.decoded.id;
        apiService.editProfile(req.body, req.files, function (response) {
            res.status(response.STATUSCODE).send(response);
        });
    });

    // Delete User
    api.post('/deleteUser', function (req, res) {
        apiService.deleteUser(req.body, function (response) {
            res.status(response.STATUSCODE).send(response);
        });
    });

    // View Profile
    api.post('/viewProfile', function (req, res) {
        req.body.userId = req.decoded.id;
        apiService.viewProfile(req.body, function (response) {
            res.status(response.STATUSCODE).send(response);
        });
    });

    // Update Multiple Profile Image 
    api.post('/updateProfileImage', function (req, res) {
        apiService.updateProfileImage(req.body, req.files, function (response) {
            res.status(response.STATUSCODE).send(response);
        });
    });
    
    // Add Feedback
    api.post('/addFeedback', function (req, res) {

        apiService.addFeedback(req.body,  function (response) {
            res.status(response.STATUSCODE).send(response);
        });
    });
    
    // Add Booking
    api.post('/addBooking', function (req, res) {

        apiService.addBooking(req.body,  function (response) {
            res.status(response.STATUSCODE).send(response);
        });
    });
    
    // Edit Booking
    api.post('/editBooking', function (req, res) {

        apiService.editBooking(req.body,  function (response) {
            res.status(response.STATUSCODE).send(response);
        });
    });
 

    // Add Vehicle
    api.post('/addVehicle', function (req, res) {

        apiService.addVehicle(req.body, req.files, function (response) {
            res.status(response.STATUSCODE).send(response);
        });
    });
    
    // Edit Vehicle
    api.post('/editVehicle', function (req, res) {

        apiService.editVehicle(req.body, req.files, function (response) {
            res.status(response.STATUSCODE).send(response);
        });
    });

    // Add Review
    api.post('/addReview', function (req, res) {

        apiService.addReview(req.body,  function (response) {
            res.status(response.STATUSCODE).send(response);
        });
    });

    module.exports = api;


