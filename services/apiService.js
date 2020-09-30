'use strict';
var config = require('../config');
var async = require("async");
var mongo = require('mongodb');
var jwt = require('jsonwebtoken');
var fs = require('fs')
var ObjectID = mongo.ObjectID;

var mailProperty = require('../modules/sendMail');

var ApiModels = require('../models/api/apiModel');
var apiService = {

        //register User
        register: (data, fileData, callback) => {

            console.log('valid data---->',data)
            if (!data.firstName || typeof data.firstName === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "please provide firstName",
                    response: []
                });
            } else if (!data.lastName || typeof data.lastName === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "please provide lastName",
                    response: []
                });
            } else if (!data.phoneNumber || typeof data.phoneNumber === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "please provide phoneNumber",
                    response: []
                });
            } else if (!data.email || typeof data.email === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "please provide email",
                    response: []
                });
            } else if (!data.password || typeof data.password === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "please provide password",
                    response: []
                });
            } else if (!data.role || typeof data.role === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "please provide role",
                    response: []
                });
            } else {
    
                data._id    = new ObjectID;
                data.email  = String(data.email).toLowerCase();

                if(data.ccbill){
                    data.ccbill = JSON.parse(data.ccbill)
                }

                if(data.driverDetail){
                    data.driverDetail = JSON.parse(data.driverDetail)
                }
                
                ApiModels.register(data, fileData, function (result) {
                    callback(result);
                });
            }
        },
        
        //verifyEmailOtp 
        verifyEmailOtp: (data, callback) => {
            if (!data.email || typeof data.email === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "please provide email address",
                    response: []
                });
            } else if (!data.otp || typeof data.otp === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "please provide otp",
                    response: []
                });
            } else {
                ApiModels.verifyEmailOtp(data, function (result) {
                    callback(result);
                });
            }
        },
        //login 
        login: (data, callback) => {
            if (!data.email || typeof data.email === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "please provide email address",
                    response: []
                });
            } else if (!data.password || typeof data.password === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "please provide password",
                    response: []
                });
            } else if (!data.deviceToken || typeof data.deviceToken === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "please provide deviceToken",
                    response: []
                });
            } else if (!data.appType || typeof data.appType === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "please provide appType",
                    response: []
                });
            } else {
                ApiModels.login(data, function (result) {
                    callback(result);
                });
            }
        },

        // Social Login
        socialRegister: (data, callback) => {
        
            if (!data.socialLogin || typeof data.socialLogin === undefined) {
                callback({
                success: false,
                STATUSCODE: 5002,
                message: "socialLogin  Required ",
                response: {}
                });

            } else {
                data.email = data.email?String(data.email).toLowerCase():'';
                ApiModels.socialRegister(data, function (result) {
                callback(result);
            });
            }
        },

        //Forgot password
        forgotPassword: (data, callback) => {
            if (!data.email || typeof data.email === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "please provide email address",
                    response: []
                });
            } else {

                ApiModels.forgotPassword(data, function (result) {
                    callback(result);
                });
            }
        },        

        //reset password 
        resetPassword: (data, callback) => {
            console.log('data',data)
            if (!data.newPassword || typeof data.newPassword === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "please provide password",
                    response: []
                });
            } else {
                ApiModels.resetPassword(data, function (result) {
                    callback(result);
                });
            }
        },

        //listUser
        listUser: function (data, callback) {
            console.log("data",data); 
            ApiModels.listUser(data, function (result) {
                callback(result);
            });
        },

        
        //reportedUserList
        reportedUserList: function (data, callback) {
            console.log("data",data); 
            ApiModels.reportedUserList(data, function (result) {
                callback(result);
            });
        },


        //testNotification
        testNotification: function (data, callback) {
            console.log("data",data); 
            ApiModels.testNotification(data, function (result) {
                callback(result);
            });
        },
        //Edit User
        editUser: async (data, fileData, callback) => {

                if (!data.userId || typeof data.userId === undefined) {
                        callback({
                            success: false,
                            STATUSCODE: 404,
                            message: "Please Provide User Id",
                            response: []
                        });
                } else {

                        ApiModels.editUser(data, fileData, function (result) {
                        callback(result)
                        });
                }
        },
        
        //Edit ProfileImage
        updateProfileImage: async (data, fileData, callback) => {

                if (!data.userId || typeof data.userId === undefined) {
                        callback({
                            success: false,
                            STATUSCODE: 404,
                            message: "Please Provide User Id",
                            response: []
                        });
                }else if (!data.profileImageId || typeof data.profileImageId === undefined) {
                    callback({
                        success: false,
                        STATUSCODE: 404,
                        message: "Please Provide Profile Image Id",
                        response: []
                    });
                }else if (!data.action || typeof data.action === undefined) {
                    callback({
                        success: false,
                        STATUSCODE: 404,
                        message: "Please Provide action",
                        response: []
                    });
                } else {

                        ApiModels.updateProfileImage(data, fileData, function (result) {
                        callback(result)
                        });
                }
        },
        //Delete User
        deleteUser: async (data, callback) => {

            if (!data.userId || typeof data.userId === undefined) {
                    callback({
                        success: false,
                        STATUSCODE: 404,
                        message: "Please Provide User Id",
                        response: {}
                    });
            } else {
                    ApiModels.deleteUser(data, function (result) {
                    callback(result)
                    });
            }
        },
         
        //listTerms
        listTerms: function (data, callback) {
            console.log("data",data); 
            ApiModels.listTerms(data, function (result) {
                callback(result);
            });
        },
        
        //snapchatCallback
        snapchatCallback: function (data, callback) {
            console.log("data",data); 
            ApiModels.snapchatCallback(data, function (result) {
                callback(result);
            });
        },

        
        //Edit Terms
        editTerms: async (data,  callback) => {
            if (!data.termId || typeof data.termId === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "Please Provide Term Id",
                    response: {}
                });
            } else {
                ApiModels.editTerms(data, function (result) {
                callback(result)
                });
            }
           
        },
        
        //listPrivacyPolicy
        listPrivacyPolicy: function (data, callback) {
            console.log("data",data); 
            ApiModels.listPrivacyPolicy(data, function (result) {
                callback(result);
            });
        },

        //Edit PrivacyPolicy
        editPrivacyPolicy: (data,  callback) => {
            
            if (!data.privacyId || typeof data.privacyId === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "Please Provide Privacy Id",
                    response: {}
                });
            } else {
                ApiModels.editPrivacyPolicy(data, function (result) {
                callback(result)
                });
            }

        },
        
        //listAboutUs
        listAboutUs: function (data, callback) {
            console.log("data",data); 
            ApiModels.listAboutUs(data, function (result) {
                callback(result);
            });
        },
        
        //Edit AboutUs
        editAboutUs: (data,  callback) => {
            
            if (!data.aboutUsId || typeof data.aboutUsId === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "Please Provide aboutUs Id",
                    response: {}
                });
            } else {
                ApiModels.editAboutUs(data, function (result) {
                callback(result)
                });
            }

        },

        //addFeedback
        addFeedback: (data,  callback) => {
            
            if (!data.fromUser || typeof data.fromUser === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "Please Provide fromUser Id",
                    response: {}
                });
            }  if (!data.rating || typeof data.rating === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "Please Provide rating ",
                    response: {}
                });
            }else {
                data._id = new ObjectID;
                ApiModels.addFeedback(data, function (result) {
                callback(result)
                });
            }
        },  

        //add Review
        addReview: (data,  callback) => {
            
            if (!data.fromUser || typeof data.fromUser === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "Please Provide fromUser Id",
                    response: {}
                });
            }else if (!data.toUser || typeof data.toUser === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "Please Provide toUser Id",
                    response: {}
                });
            }else if (!data.rating || typeof data.rating === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "Please Provide rating ",
                    response: {}
                });
            }else {
                data._id = new ObjectID;
                ApiModels.addReview(data, function (result) {
                callback(result)
                });
            }
        },  

        //List Booking
        listBooking: function (data, callback) {
            console.log("data",data); 
            ApiModels.listBooking(data, function (result) {
                callback(result);
            });
        },
           

        //Add Booking
        addBooking: (data,  callback) => {

            if (!data.pickupLocation || typeof data.pickupLocation === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "Please Provide pickup Location",
                    response: {}
                });
            }else  if (!data.dropLocation || typeof data.dropLocation === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "Please Provide drop Location ",
                    response: {}
                });
            }else  if (!data.pickupDate || typeof data.pickupDate === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "Please Provide pickup Date ",
                    response: {}
                });
            }else  if (!data.dropDate || typeof data.dropDate === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "Please Provide drop Date ",
                    response: {}
                });
            }else  if (!data.vehicleDetail || typeof data.vehicleDetail === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "Please Provide vehicle Detail ",
                    response: {}
                });
            }else  if (!data.customerId || typeof data.customerId === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "Please Provide customer Id ",
                    response: {}
                });
            }else  if (!data.distance || typeof data.distance === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "Please Provide distance ",
                    response: {}
                });
            } else {
                data._id            = new ObjectID;
                data.vehicleDetail  = JSON.parse(data.vehicleDetail) ;
                data.price          = parseInt(data.distance) * config.COSTPERKM ;
                ApiModels.addBooking(data, function (result) {
                callback(result)
                });
            }
        },          
        //Edit Booking
        editBooking: function (data, callback) {
            console.log("data",data); 
            if (!data.bookingId || typeof data.bookingId === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "Please Provide booking Id",
                    response: {}
                });
            }else{ 

                ApiModels.editBooking(data, function (result) {
                    callback(result);
                });
            }
        },

        //Add Vehicle
        addVehicle: async (data, fileData, callback) => {
            console.log('vehicle type--->',fileData)
            if (!data.name || typeof data.name === undefined) {
                    callback({
                        success: false,
                        STATUSCODE: 404,
                        message: "Please Provide Vehicle Name",
                        response: []
                    });
            }else if (!data.color || typeof data.color === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "Please Provide Vehicle color",
                    response: []
                });
            }else if (!data.type || typeof data.type === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "Please Provide Vehicle type",
                    response: []
                });
            }else if (!data.vin || typeof data.vin === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "Please Provide Vehicle vin",
                    response: []
                });
            }else if (!fileData) {
                
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "Please Provide Vehicle Image",
                    response: []
                });
            }else if (!data.bookingId || typeof data.bookingId === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "Please Provide bookingId",
                    response: []
                });
            } else {
                data._id = new ObjectID
                ApiModels.addVehicle(data, fileData, function (result) {
                    callback(result)
                    });
            }
        },

    
        //Edit Vehicle
        editVehicle: function (data, fileData, callback) {
            console.log("data",data); 
            if (!data.vehicleId || typeof data.vehicleId === undefined) {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "Please Provide vehicle Id",
                    response: {}
                });
            }else{ 

                ApiModels.editVehicle(data, fileData,  function (result) {
                    callback(result);
                });
            }
        },


           
    };
module.exports = apiService;