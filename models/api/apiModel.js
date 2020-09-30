
var UserSchema      = require('../../schema/api/users');
var TermsSchema     = require('../../schema/api/terms');
var AboutUsSchema   = require('../../schema/api/aboutus');
var PrivacySchema   = require('../../schema/api/privacy');
var BlockUserSchema = require('../../schema/api/blockuser');
var FeedBackSchema  = require('../../schema/api/feedback');
var ReviewSchema    = require('../../schema/api/review');
var BookingSchema   = require('../../schema/api/booking');
var VehicleSchema   = require('../../schema/api/vehicle');
var config          = require('../../config');
var async           = require("async");
var bcrypt          = require('bcrypt-nodejs');
var mailProperty    = require('../../modules/sendMail');
var fcmNotification = require('../../modules/fcmNotification');
var jwt             = require('jsonwebtoken');
var fs              = require('fs');
var https           = require('https');
var request         = require('request');
var mongo           = require('mongodb');
var ObjectID        = mongo.ObjectID;
var secretKey       = config.secretKey;
//BlockUser
//create auth token
createToken = (admin) => {
    var tokenData = {
        id: admin._id
    };
    var token = jwt.sign(tokenData, secretKey, {
        expiresIn: 86400
    });
    return token;
};

randomString = (len, charSet) => {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
  };

const download = (url, dest) => {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                if (res.statusCode !== 200) {
                    var err = new Error('File couldn\'t be retrieved');
                    err.status = res.statusCode;
                    return reject(err);
                }
                var chunks = [];
                res.setEncoding('binary');
                res.on('data', (chunk) => {
                    chunks += chunk;
                }).on('end', () => {
                    var stream = fs.createWriteStream(dest);
                    stream.write(chunks, 'binary');
                    stream.on('finish', () => {
                        resolve('File Saved !');
                    });
                    res.pipe(stream);
                })
            }).on('error', (e) => {
                console.log("Error: " + e);
                reject(e.message);
            });
        })
    };


    // request.head(url, (err, res, body) => {
    //   request(url)
    //     .pipe(fs.createWriteStream(path))
    //     .on('close', callback)
    // })
  //}
  

var apiModel = {

    authenticate: function (jwtData, callback) {
        if (jwtData["x-access-token"]) {
            jwt.verify(jwtData["x-access-token"], config.secretKey, function (err, decoded) {
                if (err) {
                    callback({
                        success: false,
                        STATUSCODE: 420,
                        message: "Session timeout! Please login again.",
                        response: err
                    });
                } else {
                    callback({
                        success: true,
                        STATUSCODE: 200,
                        message: "Authenticate successfully.",
                        response: decoded
                    });
                }
            });
        }
    },

    //register employee
    register: function (data, fileData, callback) {

    	console.log('daata---->', data)
        if (data) {
            UserSchema.findOne({
                    email: data.email
                }, {
                    _id: 1,
                    email: 1,
                },
                function (err, result) {
                    if (err) {
                        callback({
                            success: false,
                            STATUSCODE: 400,
                            message: err.message,
                            response: err
                        });
                    } else {
                        if (result !== null) {
                            callback({
                                success: false,
                                STATUSCODE: 404,
                                message: "Email address already exist",
                                response: result
                            });
                        } else {

                            new UserSchema(data).save(async function (err, result) {
                                if (err) {
                                    callback({
                                        success: false,
                                        STATUSCODE: 400,
                                        message: err.message,
                                        response: err
                                    });
                                } else {


                                    // mailProperty('emailVerificationMail')(data.email, {
                                    //     name: data.fullName,
                                    //     email: data.email,
                                    //     verification_code: otp,
                                    //     site_url: config.liveUrl,
                                    //     date: new Date()
                                    // }).send();

                                    if(fileData  && fileData != null)
                                    {
                                        let imageUploaded = new Promise( (resolve,reject) => { 

                                            var pic = fileData.profileImage;
                                            var ext = pic.name.slice(pic.name.lastIndexOf('.'));
                                            var fileName = Date.now() + ext;
                                            var folderpath = config.UploadUserProfilePath;
                                            pic.mv(folderpath + fileName,  (err) => {
                                                if (err) {
                                                    reject(err)
                                                    callback({
                                                        "success": false,
                                                        "STATUSCODE": 400,
                                                        "message": err.message,
                                                        "response": err
                                                    })
                                                } else {
                                                    //data._id = new ObjectID;
                                                    if(data.profileImage == (config.UserProfilePath + fileName) )
                                                    {
        
                                                    }else{
                                                        data.profileImage = config.UserProfilePath + fileName;
                                                    }
                                                    resolve(data.profileImage)
                                                    console.log('image upload')
                                                }
                                            })
        
                                        })
        
                                        data.profileImage = await imageUploaded
        
                                        await UserSchema.update({_id: result._id}, {
                                                        $set: {"profileImage": data.profileImage}           
                                        });
                                        result.profileImage = data.profileImage
                                    }
   
                                    let otp = Math.random().toString().replace('0.', '').substr(0, 4);

                                    await UserSchema.update({_id:result._id},
                                        {
                                            $set:{
                                                otp : otp
    
                                            }
                                        })

                                    callback({
                                        success: true,
                                        STATUSCODE: 200,
                                        message: "Registered Successfully.",
                                        response: result
                                    });
                                }
                            });
                        }
                    }
                });
        } else {
            callback({
                success: false,
                STATUSCODE: 401,
                message: 'No data provided',
                response: []
            });
        }
    },

    //Social Login
    socialRegister: (data, callback) => {


        console.log('data.socialLogin---',(data.socialLogin));
        
        UserSchema.findOne({
           ...(data.socialLogin ? { "socialLogin.socialId": (data.socialLogin).socialId } : {})
        }, async (err, user) => {
            if (err) {
                console.log("Error1", err);
                callback({
                    success: false,
                    STATUSCODE: 400,
                    message: err.message,
                    response: err
                });
            } else {
                if (user) 
                {
                    let token = createToken(user);
                    user.authToken      = token;
                    user.socialLogin    = data.socialLogin;
                    //data.profileImage   = data.socialLogin.image
                    user.deviceId       = data.deviceId

                    user.save();
                    console.log('data.socialLogin--->',user)
                
                    callback({
                        success: true,
                        STATUSCODE: 200,
                        message: "User Details ",
                        response: user
                    })

                } else {
                    data._id = new ObjectID;
                    let token = createToken(data);
                    let deviceId = data.deviceId

                    if (token) {

                        const url = data.socialLogin.image
                        const path = `${config.UploadUserProfilePath}${data.socialLogin.socialId}.png`
                        const UserProfilePath = `${config.UserProfilePath}${data.socialLogin.socialId}.png`
                        
                        await download(url, path)

                        data = {
                            _id            : new ObjectID,
                            socialLogin    : data.socialLogin,
                            profileImage   : UserProfilePath,
                            deviceId       : data.deviceId,
                            firstName      : data.firstName,
                            lastName       : data.lastName,
                            email          : data.email,
                            phoneNumber    : data.phoneNumber
                        }

                        console.log('data social register--->',data)

                        new UserSchema(data).save(function (err, result) {
                            if (err) {
                                console.log("Error2", err);
                                callback({
                                    success: false,
                                    STATUSCODE: 404,
                                    message: err.message,
                                    response: err
                                });
                            } else {
                              
                                var all_result = {

                                    authToken   : token,
                                    deviceId    : deviceId,
                                    _id         : result._id,
                                    firstName   : data.firstName,
                                    lastName    : data.lastName,
                                    email       : result.email,
                                    role        : result.role,
                                    phoneNumber : data.phoneNumber,
                                    profileImage: UserProfilePath,
                                    socialLogin : result.socialLogin

                                }
                                    callback({
                                        success: true,
                                        STATUSCODE: 200,
                                        message: "User Successfully Logged in.",
                                        response: all_result
                                    
                                });
                            }
                        });
                    }
                }
            }
        })
    },

    //verifyEmailOtp
    verifyEmailOtp: function (data, callback) {
        if (data) {

            UserSchema.findOne({
                'email': data.email.toLowerCase(),
                'otp': data.otp
                },
                async function (err, resDetails) {
                    if (err) {
                        callback({
                            success: false,
                            STATUSCODE: 400,
                            message: "something went wrong!",
                            response: err
                        });
                    } else {
                        if (resDetails === null) {
                            callback({
                                success: false,
                                STATUSCODE: 404,
                                message: "Otp Verification Failed!",
                                response: {}
                            });
                        } else {

                            UserSchema.update({
                                'email': data.email.toLowerCase(),
                                    }, {
                                        $set: {
                                            'email_verify': true
                                        }
                                    }, async (err, resUpdate) => {
                                        if (err) {
                                            callback({
                                                success: false,
                                                STATUSCODE: 400,
                                                message: err.message,
                                                response: err
                                            });
                                        }
                                    }) 

                                   let userdata = await UserSchema.findOne({
                                        'email': data.email.toLowerCase()
                                    })
                                    
                                    callback({
                                        success: true,
                                        STATUSCODE: 200,
                                        message: "Otp Verify successfully",
                                        response: userdata
                                    });
                                }                                               
                    }
                });
        } else {
            callback({
                success: false,
                STATUSCODE: 400,
                message: 'No data provided',
                response: {}
            });
        }
    },
    
    //login
    login: async function (data, callback) {

        let email = data.email
        let phoneNumber = data.phoneNumber
        let query = {}
        if(data.email)
        {
            query["email"] = email
        }

        if(data.phoneNumber)
        {
            query["phoneNumber"] = phoneNumber
        }

        if ( (data.email || data.phoneNumber) ) {

           UserSchema.findOne(query, function (err, result) {
                if (err) {
                    callback({
                        success: false,
                        STATUSCODE: 400,
                        message: err.message,
                        response: err
                    });

                } else {
                    if (result === null) {

                        callback({
                            success: false,
                            STATUSCODE: 404,
                            message: "Wrong password or email. Please provide registered details.",
                            response: []
                        });


                    } else {

                        // if (result.email_verify === false) {
                        //     var all_result = {
                        //         authtoken: '',
                        //         _id: result._id,
                        //         fullName: result.fullName ,
                        //         email: result.email
                        //     }
                        //     callback({
                        //         success: false,
                        //         STATUSCODE: 404,
                        //         message: "Your account is not activated. Please activate your account from your register email.",
                        //         response: all_result
                        //     });
                        // } else {

                            bcrypt.compare(data.password.toString(), result.password, function (err, response) {
                                // result == true
                                if (response == true) {

                                    var token = createToken(result);
                                    UserSchema.update({
                                        _id: result._id
                                    }, {
                                        $set: {
                                            deviceToken: data.deviceToken,
                                            appType: data.appType
                                        }
                                    }, function (err, resUpdate) {
                                        if (err) {
                                            callback({
                                                success: false,
                                                STATUSCODE: 400,
                                                message: err.message,
                                                response: err
                                            });
                                        } else {

                                            let profile_image = result.profileImage;

                                            if (!profile_image || profile_image == '') {
                                                profile_image =  config.userDemoPicPath;
                                            } else {
                                                profile_image =  result.profileImage;
                                            }
                                            result.authToken = token
                                            result.profileImage = profile_image
                                            result.password = data.password

                                            // var all_result = {
                                            //     authtoken: token,
                                            //     _id: result._id,
                                            //     fullName: result.fullName,
                                            //     email: result.email,
                                            //     gender: result.gender,
                                            //     phoneNumber: result.phoneNumber,
                                            //     role: result.role,
                                            //     profileImage: profile_image
                                            // }

                                            callback({
                                                success: true,
                                                STATUSCODE: 200,
                                                message: "Logged your account",
                                                response: result
                                            });
                                        }
                                    });
                                } else {
                                    callback({
                                        
                                        success: false,
                                        STATUSCODE: 404,
                                        message: "Wrong password or email. Please provide registered details.",
                                        response: []
                                    });
                                }
                            });
                        //}


                    }
                }
            })
        } else {
            callback({
                success: false,
                STATUSCODE: 400,
                message: 'No data provided',
                response: {}
            });
        }
    },

    // forget password
    forgotPassword: function (data, callback) {
        console.log('data----',data)
        if (data.email) {
            UserSchema.findOne({
                email: data.email
            }, async function (err, resDetails) {
                if (err) {
                    callback({
                        success: false,
                        STATUSCODE: 400,
                        message: err.message,
                        response: err
                    });
                } else {
                    if (resDetails == null) {
                        callback({
                            success: false,
                            STATUSCODE: 404,
                            message: "User does not exist",
                            response: {}
                        });
                    } else {
                        
                        let emailVerificationToken = randomString(48)
                        let otp                    = Math.random().toString().replace('0.', '').substr(0, 4);

                        mailProperty('forgotPasswordMail')(data.email, {
                                    name                    : `${resDetails.firstName}  ${resDetails.lastName}`,
                                    email                   : resDetails.email,
                                    otp                     : otp,
                                    reset_password_link     : config.liveUrl+'resetPassword/'+emailVerificationToken,
                                    site_url                : config.liveUrl,
                                    date                    : new Date()
                        }).send();

                        await UserSchema.update({email: data.email}, 
                            {
                                $set:{
                                    emailVerificationToken : emailVerificationToken,
                                    otp                    : otp
                                }
                            })

                        callback({
                            success     : true,
                            STATUSCODE  : 200,
                            message     : "Mail Sent Successfully for Resetting Password.",
                            response    : "Mail Sent Successfully.Please Check Your Registered Email To Reset Password."
                        });
                    }
                }
            });
        } else {
            callback({
                success: false,
                STATUSCODE: 400,
                message: "User email id not provided",
                response: {}
            });
        }
    },

    // reset password
    resetPassword: function (data, callback) {
        console.log('data----',data)
        if (data._id) {
            UserSchema.findOne({  _id: data._id  
            }, function (err, resDetails) {
                if (err) {
                    callback({
                        success: false,
                        STATUSCODE: 400,
                        message: err.message,
                        response: err
                    });
                } else {
                    if (resDetails == null) {
                        callback({
                            success: false,
                            STATUSCODE: 404,
                            message: "User does not exist",
                            response: {}
                        });
                    } else {
                        bcrypt.hash(data.newPassword, null, null, function (err, hash) {
                            if (err) {
                                callback({
                                    success: false,
                                    STATUSCODE: 400,
                                    message: err.message,
                                    response: err
                                });
                            } else {
                                UserSchema.update({
                                    _id: resDetails._id
                                }, {
                                    $set: {
                                        "password": hash
                                    }
                                }, function (err, result) {
                                    if (err) {
                                        callback({
                                            success: false,
                                            STATUSCODE: 400,
                                            message: err.message,
                                            response: err
                                        });
                                    } else {
                            
                                        mailProperty('resetPasswordMail')(resDetails.email, {
                                            name: `${resDetails.firstName}  ${resDetails.lastName}`,
                                            email: resDetails.email,
                                            reset_password: data.newPassword,
                                            site_url: config.liveUrl,
                                            date: new Date()
                                        }).send();

                                        callback({
                                            success: true,
                                            STATUSCODE: 200,
                                            message: "Password changed Successfully.Please check your registered email.",
                                            response: { _id: resDetails._id, password:data.newPassword }
                                        });
                                    }
                                });
                            }
                        });

                    }
                }
            });
        } else {
            callback({
                success: false,
                STATUSCODE: 400,
                message: "Please provide id",
                response: {}
            });
        }
    },

    reportedUserList: async function (data, callback) {
        // console.log('data----',data)
 
         var page = 1,
         limit = 10,
         query = {},
         queryName = {};
 
         if (data.page) {
             page = parseInt(data.page);
         }
 
         if (data.limit) {
             limit = parseInt(data.limit);
         }
 
         if(data.reportId){
             query['_id'] = data.reportId
         }  
   
         if(data.fromUser){
             query['fromUser'] = data.fromUser
         } 
 
         if(data.toUser){
            query['toUser'] = data.toUser
        } 
 
        if(data.message){
            query['message'] = new RegExp(data.message, 'i')
        } 

        if(data.title){
            query['title'] = new RegExp(data.title, 'i')
        } 

         var aggregate = BlockUserSchema.aggregate(
             {
                 $match: query
             },
             
             { 
                 $lookup : {
                     from : 'users',
                     localField : 'fromUser',
                     foreignField : '_id',
                     as : 'fromUser'
                 }
             },
             {
                 $unwind : { path : '$fromUser', preserveNullAndEmptyArrays : true } 
             },
             {
                 $lookup : {
                     from : 'users',
                     localField : 'toUser',
                     foreignField : '_id',
                     as : 'toUser'
                 }
             },
             {
                 $unwind : { path : '$toUser', preserveNullAndEmptyArrays : true } 
             },
         
             {
                 $group : {
                    "message" : "",
                    "title" : "",
                     _id :"$_id",
                     toUser : {
                         "$first": "$toUser"
                     },
                     fromUser : {
                         "$first": "$fromUser"
                     },
                     message : {
                         "$first": "$message"
                     },
                     title : {
                         "$first": "$title"
                     },
                     updatedAt : {
                         "$first": "$updatedAt"
                     }
                 }
             },
             {
                 $project : {
                     _id : 1,
                     fromUser: 1,
                     toUser: 1,
                     message: 1,
                     title:1,
                     updatedAt:1
                 }
             }, 
             {
                 $sort: {updatedAt: -1}
             }
 
         );
 
         var options = {
             page: page,
             limit: limit
         }
 
         BlockUserSchema.aggregatePaginate(aggregate, options, function (err, results, pageCount, count) {
             if (err) {
                 callback({
                     success: false,
                     STATUSCODE: 400,
                     message: err,
                     response: {}
                 });
 
             } else {
 
 
                 var data = {
                     docs:results,
                     pages: pageCount,
                     total: count,
                     limit: limit,
                     page: page
                 }
                 callback({
                     success: true,
                     STATUSCODE: 200,
                     message: "Reported User List",
                     response: data
                 });
 
             }
         });
     },
    // List User
    listUser: async function (data, callback) {
        console.log('data----',data)

        callback({
            success: true,
            STATUSCODE: 200,
            message: "Snapchat callback List",
            response: {}
        });
    },

    // Edit User Information
    editUser: async function (data, fileData, callback) {
        if (data) {
            console.log('data------->',data)
            let user = await UserSchema.findOne({
                _id: data.userId
            }, function (err, result) {
                if (err) {
                    callback({
                        success: false,
                        STATUSCODE: 400,
                        message: "Error Occur while editing user",
                        response: err
                    });
                }
            });

            if (user !== null) {
                let definedccbill={}
                if(data.ccbill)
                {
                    definedccbill = JSON.parse(data.ccbill)
                }

                UserSchema.update({
                    _id: data.userId
                }, {
                    $set: {
                        ...(( data.authToken)    ? { authToken : data.authToken }                   : {}),
                        ...(( data.deviceId)     ? { deviceId : data.deviceId }                     : {}),
                        ...(( data.lastName)     ? { lastName : data.lastName }                     : {}),
                        ...(( data.gender)       ? { gender : data.gender }                         : {}),
                        ...(( data.phoneNumber)  ? { phoneNumber : data.phoneNumber }               : {}),
                        ...(( data.email)        ? { email : data.email }                           : {}),
                        ...(( data.role)         ? { role : data.role }                             : {}),
                        ...(( data.dob !== undefined && data.dob !== 'undefined' && data.dob !== 'null')          ? { dob : data.dob }                 : {}),  
                        ...(( data.status)       ? { status : data.status }                         : {}),
                        ...(( data.ccbill)       ? { ccbill : JSON.parse(data.ccbill) }             : {}),
                        ...(( data.driverDetail) ? { driverDetail :JSON.parse(data.driverDetail) }  : {})
                    }
                }, async (err, resUpdate) => {
                    if (err) {
                        callback({
                            success: false,
                            STATUSCODE: 400,
                            message: err.message,
                            response: err
                        });
                    } else {

                        console.log('fileData-------->',fileData);
                        
                        if( fileData && fileData !== null){

                            
                            if (user.profileImage !== undefined && user.profileImage != '')
                            {

                                let pf_image = `./public/${user.profileImage}`;
                                fs.unlink(pf_image, (err) => {
                                    if (err) {
                                        console.log('err', err);
                                    } else {
                                        console.log(user.profileImage + ' was deleted');
                                    }
                                });
                            }
                            //profileImage
                                let imageUploaded = new Promise( (resolve,reject) => { 

                                    var pic = fileData.profileImage;
                                    var ext = pic.name.slice(pic.name.lastIndexOf('.'));
                                    var fileName = Date.now() + ext;
                                    var folderpath = config.UploadUserProfilePath;
                                    pic.mv(folderpath + fileName,  (err) => {
                                        if (err) {
                                            reject(err)
                                            callback({
                                                "success": false,
                                                "STATUSCODE": 400,
                                                "message": err.message,
                                                "response": err
                                            })
                                        } else {
                                            //data._id = new ObjectID;
                                            if(data.profileImage == (config.UserProfilePath + fileName) )
                                            {

                                            }else{
                                                data.profileImage = config.UserProfilePath + fileName;
                                            }
                                            resolve(data.profileImage)
                                            console.log('image upload')
                                        }
                                    })

                                })

                                data.profileImage = await imageUploaded

                                await UserSchema.update({_id: user._id}, {
                                                $set: {"profileImage": data.profileImage}           
                                });
                          
                        }

                      let userUpdatedDetails = await UserSchema.findOne({_id: data.userId})
                      if(userUpdatedDetails !== null)
                      {
                          userUpdatedDetails.profileImage = userUpdatedDetails.profileImage !== undefined ?
                                                           userUpdatedDetails.profileImage:''
                          userUpdatedDetails.selfieImage = userUpdatedDetails.selfieImage !== undefined ?
                                                           userUpdatedDetails.selfieImage:''                                                           
                      }
                        callback({
                            success: true,
                            STATUSCODE: 200,
                            message: "User updated successfully.",
                            response: userUpdatedDetails
                           
                        });
                    }
                });

            } else {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "User is not valid.",
                    response: {}
                });
            }

        } else {
            callback({
                success: false,
                STATUSCODE: 400,
                message: 'No data provided',
                response: {}
            });
        }
    },

    //update Profile Image
    updateProfileImage: async function (data, fileData, callback) {
        if (data) {
            console.log('data------->',data)
            let user = await UserSchema.findOne({
                _id: data.userId
            }, function (err, result) {
                if (err) {
                    callback({
                        success: false,
                        STATUSCODE: 400,
                        message: "Error Occur while editing user",
                        response: err
                    });
                }
            });

            if (user !== null) {
                let filterProfileImage = []
                let filterMainProfileImage = []

                if(user.profile)
                {
                    if(user.profile.length > 0)
                    {
                        filterMainProfileImage =  user.profile.filter( (userprofileimage) => {

                            if(userprofileimage._id == data.profileImageId)
                            {

                                return userprofileimage
                            }
                        });

                        filterProfileImage =  user.profile
                        .map( (userprofileimage) => {
        
                            userprofileimage.isMain = false
                            return userprofileimage
                        //    data.profileImageId
                        });
                     }
                }
               
                UserSchema.update({
                    _id: data.userId 
                }, {
                    $set: {
                        ...(( data.action == 'makemain')     ? { profile : filterProfileImage }             : {})
                    }
                }, async (err, resUpdate) => {
                    if (err) {
                        callback({
                            success: false,
                            STATUSCODE: 400,
                            message: err.message,
                            response: err
                        });
                    } else {

                        if( data.action == 'makemain' && user.profile )
                        {
                            if(user.profile.length > 0)
                            {
                                await UserSchema.update({_id: user._id, "profile._id":data.profileImageId }, {
                                    $set: {
                                        "profile.$.isMain": data.isMain,
                                        ...(filterMainProfileImage.length > 0 ?  {"profileImage": filterMainProfileImage.map( (mainImg) => { return  mainImg.media }) } : {} ),

                                    }           
                                });

                            }
                        }else if(data.action == 'delete' && user.profile )
                        {
                            if(user.profile.length > 0)
                            {
                                filterProfileImage =  user.profile
                                .filter( userprofileimage => userprofileimage._id !=  data.profileImageId );
                                console.log('filterProfileImage--->',filterProfileImage)

                                await UserSchema.update({_id: user._id }, {
                                    $set: {
                                        "profile": filterProfileImage
                                    }           
                                });

                            }

                        }
                        console.log('fileData-------->',fileData);
                        
                        if( fileData && fileData !== null){

                            //profileImage

                            if(fileData.profile)
                            {

                               let filterImage =  user.profile.filter( (userprofileimage) => {

                                    if(userprofileimage._id == data.profileImageId)
                                    {

                                        return userprofileimage
                                    }
                                //    data.profileImageId
                                });
                                //console.log('file index--->',index[0].media)
                                if (filterImage.length > 0) {

                                    filterImage.map( async (profileimg) => {  
                           
                                        if (profileimg !== undefined && profileimg != '')
                                        {

                                            let pf_image = `./public/${profileimg.media}`;
                                            fs.unlink(pf_image, (err) => {
                                                if (err) {
                                                    console.log('err', err);
                                                } else {
                                                    console.log(profileimg.media + ' was deleted');
                                                }
                                            });
                                        }

                                        let imageUploaded = new Promise( (resolve,reject) => { 
            
                                            var pic = fileData.profile;
                                            var ext = pic.name.slice(pic.name.lastIndexOf('.'));
                                            var fileName = Date.now() + ext;
                                            var folderpath = config.UploadUserProfilePath;
                                            pic.mv(folderpath + fileName,  (err) => {
                                                if (err) {
                                                    reject(err)
                                                    callback({
                                                        "success": false,
                                                        "STATUSCODE": 400,
                                                        "message": err.message,
                                                        "response": err
                                                    })
                                                } else {
                                                    //data._id = new ObjectID;
                                                    if(data.profile == (config.UserProfilePath + fileName) )
                                                    {

                                                    }else{
                                                        data.profile = config.UserProfilePath + fileName;
                                                        // uploadedArrayImage.push({
                                                        //     media: data.profile
                                                        // })
                                                    }
                                                    resolve(data.profile)
                                                    console.log('image upload')
                                                }
                                            })

                                        })

                                        let updatedProfileImg = await imageUploaded

                                        //data.profile = await imageUploaded

                                        await UserSchema.update({_id: user._id, "profile._id":data.profileImageId }, {
                                                        $set: {
                                                            "profile.$.media": updatedProfileImg,
                                                        }           
                                        });
                            })
                            }
                            }
                        }

                      let userUpdatedDetails = await UserSchema.findOne({_id: data.userId})
                      
                        callback({
                            success: true,
                            STATUSCODE: 200,
                            message: "Personal information has been updated.",
                            response: userUpdatedDetails
                           
                        });
                    }
                });

            } else {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "User is not valid.",
                    response: {}
                });
            }

        } else {
            callback({
                success: false,
                STATUSCODE: 400,
                message: 'No data provided',
                response: {}
            });
        }
    },

    // Delete User Information
    deleteUser: async function (data,  callback) {
        if (data) {

            let admin = await UserSchema.findOne({
                _id: data.userId
            }, function (err, result) {
                if (err) {
                    callback({
                        success: false,
                        STATUSCODE: 400,
                        message: "Error Occur while removing admin",
                        response: err
                    });
                }
            });

            if (admin !== null) {


                if (admin.profileImage !== undefined && admin.profileImage != '')
                {

                    let pf_image = `./public/${admin.profileImage}`;
                    fs.unlink(pf_image, (err) => {
                        if (err) {
                            console.log('err', err);
                        } else {
                            console.log(admin.profileImage + ' was deleted');
                        }
                    });
                }

                UserSchema.remove({
                    _id: data.userId
                }, async (err, resRemoved) => {

                if (err) {
                        callback({
                            success: false,
                            STATUSCODE: 400,
                            message: err.message,
                            response: err
                        });
                } else {

                        callback({
                            success: true,
                            STATUSCODE: 200,
                            message: "User removed Successfully.",
                            response: {}
                        
                        });
                    }
                });

            } else {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "User is not valid.",
                    response: {}
                });
            }

        } else {
            callback({
                success: false,
                STATUSCODE: 400,
                message: 'No data provided',
                response: {}
            });
        }
    },
    
    // snap chat Callback
    snapchatCallback: function (data, callback) {
        console.log('data----',data)
                callback({
                    success: true,
                    STATUSCODE: 200,
                    message: "Snapchat callback List",
                    response: {}
                });
     },


    // List Terms
    listTerms: function (data, callback) {
        console.log('data----',data)

        var page = 1,
        limit = 3,
        query = {},
        queryName = {};

        if (data.page) {
            page = parseInt(data.page);
        }

        if (data.limit) {
            limit = parseInt(data.limit);
        }

        if(data.termId){
            query['_id'] = data.termId
        }           

        var aggregate = TermsSchema.aggregate();
        aggregate.match(query);
        aggregate.sort({
            'updatedAt': -1
        })

        var options = {
            page: page,
            limit: limit
        }

        TermsSchema.aggregatePaginate(aggregate, options, function (err, results, pageCount, count) {
            if (err) {
                callback({
                    success: false,
                    STATUSCODE: 400,
                    message: err,
                    response: {}
                });

            } else {

                var data = {
                    docs:results,
                    pages: pageCount,
                    total: count,
                    limit: limit,
                    page: page
                }
                callback({
                    success: true,
                    STATUSCODE: 200,
                    message: "Terms List",
                    response: data
                });

            }
        });
     },

    // testNotification
    testNotification: async function (data, callback) {
        console.log('data----',data)
        
        const userDeviceId   =  data.deviceId
        let  fullname        = ''
        let  userAge         = ''
        let  userSpec        = ''
        let  userCity        = ''
        let  userCountry     = ''
        let  overallUserInfo = 'This is test message'

        //console.log('--udata data.userId---',data.userId)

        // if(data.userId){

        //     let udata = await UserSchema.findOne({_id:data.userId})
        //                       .populate('personal.specialization') 
        //     if(udata.personal.specialization.length>0)
        //     {
        //         async.each(udata.personal.specialization, (spec)=>{
        //             userSpec = userSpec + spec.name + ' ,'
        //         })
        //     }

        //     fullname    = udata.personal.fullname.indexOf(' ') > -1 ? (udata.personal.fullname.split(' '))[0] : udata.personal.fullname
        //     userAge     = udata.personal.age
        //     userSpec    = userSpec.substr(0, userSpec.length-1)
        //     userCity    = udata.personal.city
        //     userCountry = udata.personal.country

        //     overallUserInfo = fullname +', '+userAge+', in '+userCity+', '+userCountry
        // }
        // data.to_user = userSpecializationArray

        let message = overallUserInfo //+ ' Called to talk about ' + specializationNameArray.substr(0, specializationNameArray.length-1);
        
        let notificationResponse = await fcmNotification.fcmSentPush(data, userDeviceId, message)
        console.log('notificationResponse---->',notificationResponse)

        callback({
            success: true,
            STATUSCODE: 200,
            message: "test Notification",
            response: notificationResponse
        });
     },

    // Edit Terms Information
    editTerms: async function (data,  callback) {
        if (data) {

            let term = await TermsSchema.findOne({
                _id: data.termId
            }, function (err, result) {
                if (err) {
                    callback({
                        success: false,
                        STATUSCODE: 400,
                        message: "Error Occur while editing term",
                        response: err
                    });
                }
            });

            if (term !== null) {

                TermsSchema.update({
                    _id: data.termId
                }, {
                    $set: {
                        description: data.description !== undefined ? data.description : term.description
                    }
                }, async (err, resUpdate) => {
                    if (err) {
                        callback({
                            success: false,
                            STATUSCODE: 400,
                            message: err.message,
                            response: err
                        });
                    } else {


                      let termUpdatedDetails = await TermsSchema.findOne({_id: data.termId})
                 
                        callback({
                            success: true,
                            STATUSCODE: 200,
                            message: "Term information has been updated.",
                            response: termUpdatedDetails
                           
                        });
                    }
                });

            } else {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "Terms is not valid.",
                    response: {}
                });
            }

        } else {
            callback({
                success: false,
                STATUSCODE: 400,
                message: 'No data provided',
                response: {}
            });
        }
    },  

    // List PrivacyPolicy
    listPrivacyPolicy: function (data, callback) {
        console.log('data----',data)

        var page = 1,
        limit = 3,
        query = {},
        queryName = {};

        if (data.page) {
            page = parseInt(data.page);
        }

        if (data.limit) {
            limit = parseInt(data.limit);
        }

        if(data.privacyId){
            query['_id'] = data.privacyId
        }           

        var aggregate = PrivacySchema.aggregate();
        aggregate.match(query);
        aggregate.sort({
            'updatedAt': -1
        })

        var options = {
            page: page,
            limit: limit
        }

        PrivacySchema.aggregatePaginate(aggregate, options, function (err, results, pageCount, count) {
            if (err) {
                callback({
                    success: false,
                    STATUSCODE: 400,
                    message: err,
                    response: {}
                });

            } else {

                var data = {
                    docs:results,
                    pages: pageCount,
                    total: count,
                    limit: limit,
                    page: page
                }
                callback({
                    success: true,
                    STATUSCODE: 200,
                    message: "Privacy List",
                    response: data
                });

            }
        });
    },

    // Edit PrivacyPolicy Information
    editPrivacyPolicy: async function (data, callback) {
        if (data) {

            let term = await PrivacySchema.findOne({
                _id: data.privacyId
            }, function (err, result) {
                if (err) {
                    callback({
                        success: false,
                        STATUSCODE: 400,
                        message: "Error Occur while editing term",
                        response: err
                    });
                }
            });

            if (term !== null) {

                PrivacySchema.update({
                    _id: data.privacyId
                }, {
                    $set: {
                        description: data.description !== undefined ? data.description : term.description
                    }
                }, async (err, resUpdate) => {
                    if (err) {
                        callback({
                            success: false,
                            STATUSCODE: 400,
                            message: err.message,
                            response: err
                        });
                    } else {


                        let termUpdatedDetails = await PrivacySchema.findOne({_id: data.privacyId})
                    
                        callback({
                            success: true,
                            STATUSCODE: 200,
                            message: "Privacy information has been updated.",
                            response: termUpdatedDetails
                            
                        });
                    }
                });

            } else {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "Privacy is not valid.",
                    response: {}
                });
            }

        } else {
            callback({
                success: false,
                STATUSCODE: 400,
                message: 'No data provided',
                response: {}
            });
        }
    } ,

    // List AboutUs
    listAboutUs: function (data, callback) {
        console.log('data----',data)

        var page = 1,
        limit = 3,
        query = {},
        queryName = {};

        if (data.page) {
            page = parseInt(data.page);
        }

        if (data.limit) {
            limit = parseInt(data.limit);
        }

        if(data.aboutUsId){
            query['_id'] = data.aboutUsId
        }           

        var aggregate = AboutUsSchema.aggregate();
        aggregate.match(query);
        aggregate.sort({
            'updatedAt': -1
        })

        var options = {
            page: page,
            limit: limit
        }

        AboutUsSchema.aggregatePaginate(aggregate, options, function (err, results, pageCount, count) {
            if (err) {
                callback({
                    success: false,
                    STATUSCODE: 400,
                    message: err,
                    response: {}
                });

            } else {

                var data = {
                    docs:results,
                    pages: pageCount,
                    total: count,
                    limit: limit,
                    page: page
                }
                callback({
                    success: true,
                    STATUSCODE: 200,
                    message: "About Us List",
                    response: data
                });

            }
        });
    },
    
    // Edit AboutUs Information
    editAboutUs: async function (data, callback) {
        if (data) {

            let aboutus = await AboutUsSchema.findOne({
                _id: data.aboutUsId
            }, function (err, result) {
                if (err) {
                    callback({
                        success: false,
                        STATUSCODE: 400,
                        message: "Error Occur while editing aboutus",
                        response: err
                    });
                }
            });

            if (aboutus !== null) {

                AboutUsSchema.update({
                    _id: data.aboutUsId
                }, {
                    $set: {
                        description: data.description !== undefined ? data.description : aboutus.description
                    }
                }, async (err, resUpdate) => {
                    if (err) {
                        callback({
                            success: false,
                            STATUSCODE: 400,
                            message: err.message,
                            response: err
                        });
                    } else {


                        let aboutusUpdatedDetails = await AboutUsSchema.findOne({_id: data.aboutUsId})
                    
                        callback({
                            success: true,
                            STATUSCODE: 200,
                            message: "About Us information has been updated.",
                            response: aboutusUpdatedDetails
                            
                        });
                    }
                });

            } else {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "About Us is not valid.",
                    response: {}
                });
            }

        } else {
            callback({
                success: false,
                STATUSCODE: 400,
                message: 'No data provided',
                response: {}
            });
        }
    } ,

    // Add Feedback
    addFeedback: async function (data, callback) {
        console.log('data---',data)
        if (data) {

                    new FeedBackSchema(data).save( async (err, result) => {
                        if (err) {
                            callback({
                                    success: false,
                                    STATUSCODE: 400,
                                    message: err.message,
                                    response: err
                            });
                        } else {
                        callback({
                            success: true,
                            STATUSCODE: 200,
                            message: "Thank you for your Feedback.",
                            response: result
                            
                        });
                    }
                });

        } else {
            callback({
                success: false,
                STATUSCODE: 400,
                message: 'No data provided',
                response: {}
            });
        }
    } ,

    
    // Add Review
    addReview: async function (data, callback) {
        console.log('data---',data)
        if (data) {

            let userReview      = await ReviewSchema.findOne({fromUser: data.fromUser , toUser: data.toUser})

            let userTotalRating = await ReviewSchema.aggregate(
                    {
                        $match : {toUser: data.toUser}
                    },
                    {

                        $group: { 
                                    _id: null, 
                                    total: { 
                                        $sum: "$rating" 
                                    },
                                    count: {
                                        $sum: 1
                                      } 
                                } 
                    }
                 )

            console.log('userTotalRating---',userTotalRating)

            let rating  = 0
            if(userTotalRating.length > 0)
            {
                if(data.rating)
                {

                    rating = ( (userTotalRating[0].total + data.rating ) / (userTotalRating[0].count +1 ) ).toFixed(1);
                    
                    await UserSchema.update(
                        {
                            _id : data.toUser
                        },
                        {
                            $set : {
                                "driverDetail.rating" : rating
                            }
                        }
                    )

                }
            }else{

                await UserSchema.update(
                    {
                        _id : data.toUser
                    },
                    {
                        $set : {
                            "driverDetail.rating" : data.rating
                        }
                    }
                )
                
            }

            if( userReview === null)
            {
                    new ReviewSchema(data).save( async (err, result) => {
                        if (err) {
                            callback({
                                    success: false,
                                    STATUSCODE: 400,
                                    message: err.message,
                                    response: err
                            });
                        } else {
                        callback({
                            success: true,
                            STATUSCODE: 200,
                            message: "Thank you for your Feedback.",
                            response: result
                            
                        });
                    }
                    });

            }else{
                    await ReviewSchema.update( {
                        fromUser: data.fromUser , toUser: data.toUser
                    },
                    {
                        $set:{
                            rating : data.rating,
                            message: data.message,
                        }
                    }
                    
                    )

                    let userReview = await ReviewSchema.findOne({fromUser: data.fromUser , toUser: data.toUser})

                    callback({
                        success: true,
                        STATUSCODE: 200,
                        message: "Thank you for your Feedback.",
                        response: userReview
                        
                    });
                }
            } else {
                    callback({
                        success: false,
                        STATUSCODE: 400,
                        message: 'No data provided',
                        response: {}
                    });
            }
    } ,

    // List Booking
    listBooking: function (data, callback) {
        console.log('data----',data)

        var page = 1,
        limit = 10,
        query = {},
        queryName = {};

        if (data.page) {
            page = parseInt(data.page);
        }

        if (data.limit) {
            limit = parseInt(data.limit);
        }

        if(data.bookingId){
            query['_id'] = data.bookingId
        }           

        if(data.searchName){
            query['bookingNumber'] = new RegExp(data.searchName, 'i')
        }  
        var aggregate = BookingSchema.aggregate(
            {
                $match: query
            },
            
            { 
                $lookup : {
                    from : 'users',
                    localField : 'customerId',
                    foreignField : '_id',
                    as : 'customerId'
                }
            },
            {
                $unwind : { path : '$customerId', preserveNullAndEmptyArrays : true } 
            },
            {
                $lookup : {
                    from : 'users',
                    localField : 'driverId',
                    foreignField : '_id',
                    as : 'driverId'
                }
            },
            {
                $unwind : { path : '$driverId', preserveNullAndEmptyArrays : true } 
            },
            {
                $group : {
                    _id :"$_id",
                    pickupLocation : {
                        "$first": "$pickupLocation"
                    },
                    dropLocation : {
                        "$first": "$dropLocation"
                    },
                    pickupDate : {
                        "$first": "$pickupDate"
                    },
                    dropDate : {
                        "$first": "$dropDate"
                    },
                    customerId : {
                        "$first": "$customerId"
                    },
                    driverId : {
                        "$first": "$driverId"
                    },
                    distance : {
                        "$first": "$distance"
                    },
                    price : {
                        "$first": "$price"
                    },
                    bookingNumber : {
                        "$first": "$bookingNumber"
                    },
                    driverStatus : {
                        "$first": "$driverStatus"
                    },
                    customerConfirmation : {
                        "$first": "$customerConfirmation"
                    },
                    driverConfirmation : {
                        "$first": "$driverConfirmation"
                    },
                    isJourneyCompleted : {
                        "$first": "$isJourneyCompleted"
                    },
                    deliveryStatus : {
                        "$first": "$deliveryStatus"
                    },
                    vehicleDetail : {
                        "$first": "$vehicleDetail"
                    },
                    createdAt : {
                        "$first": "$createdAt"
                    },
                    updatedAt : {
                        "$first": "$updatedAt"
                    }
                }
            },
            {
                $project : {
                    _id : 1,
                    pickupLocation : 1,
                    dropLocation : 1,
                    pickupDate : 1,
                    dropDate : 1,
                    customerId : 1,
                    driverId : 1,
                    distance : 1,
                    price : 1,
                    bookingNumber : 1,
                    driverStatus : 1,
                    customerConfirmation : 1,
                    driverConfirmation : 1,
                    isJourneyCompleted : 1,
                    deliveryStatus : 1,
                    vehicleDetail :1,
                    createdAt : 1,
                    updatedAt : 1
                }
            }, 
            {
                $sort: {updatedAt: -1}
            }

        );

        var options = {
            page: page,
            limit: limit
        }
        BookingSchema.aggregatePaginate(aggregate, options, function (err, results, pageCount, count) {
            if (err) {
                callback({
                    success: false,
                    STATUSCODE: 400,
                    message: err,
                    response: {}
                });

            } else {

                var data = {
                    docs:results,
                    pages: pageCount,
                    total: count,
                    limit: limit,
                    page: page
                }
                callback({
                    success: true,
                    STATUSCODE: 200,
                    message: "Booking List",
                    response: data
                });

            }
        });
    },
    
    //Add Booking
    addBooking:  async function (data, callback) {
        console.log('data---',data)
        if (data) {

                   let bookingLog =  await BookingSchema.aggregate([
                       {
                           $group : {
                               _id:null,
                               count:{$sum:1}
                           }
                       }
                   ])

                   if(bookingLog.length > 0)
                   {
                    data.bookingNumber = 'BOOKING ' +  (parseInt(bookingLog[0].count) + 1)
                   }else{
                    data.bookingNumber = 'BOOKING ' + 1

                   }
                    new BookingSchema(data).save(  (err, result) => {
                        if (err) {
                            callback({
                                    success: false,
                                    STATUSCODE: 400,
                                    message: err.message,
                                    response: err
                            });
                        } else {
                        callback({
                            success: true,
                            STATUSCODE: 200,
                            message: "Booking done Succesfully.",
                            response: result
                            
                        });
                    }
                });

        } else {
            callback({
                success: false,
                STATUSCODE: 400,
                message: 'No data provided',
                response: {}
            });
        }
    } ,

    // Edit Booking Information
    editBooking: async function (data,  callback) {
        if (data) {

            let booking = await BookingSchema.findOne({
                _id: data.bookingId
            }, function (err, result) {
                if (err) {
                    callback({
                        success: false,
                        STATUSCODE: 400,
                        message: err.message,
                        response: err
                    });
                }
            });

            if (booking !== null) {

                BookingSchema.update({
                    _id: data.bookingId
                }, {
                    $set: {
                        ...(( data.customerId)           ? { customerId : data.customerId }                     : {}),
                        ...(( data.driverId)             ? { driverId : data.driverId }                         : {}),
                        ...(( data.price)                ? { price : data.price }                               : {}),
                        ...(( data.distance)             ? { distance : data.distance }                         : {}),
                        ...(( data.pickupNotes)          ? { pickupNotes : data.pickupNotes }                   : {}),
                        ...(( data.deliveryStatus)       ? { deliveryStatus : data.deliveryStatus }             : {}),
                        ...(( data.isJourneyCompleted)   ? { isJourneyCompleted : data.isJourneyCompleted }     : {}),
                        ...(( data.driverConfirmation)   ? { driverConfirmation : data.driverConfirmation }     : {}),
                        ...(( data.rating)               ? { rating : data.rating }                             : {}),
                        ...(( data.customerConfirmation) ? { customerConfirmation : data.customerConfirmation } : {})
                    }
                }, async (err, resUpdate) => {
                    if (err) {
                        callback({
                            success: false,
                            STATUSCODE: 400,
                            message: err.message,
                            response: err
                        });
                    } else {

                      if(data.deliveryStatus && data.driverId)
                      {
                          if(data.deliveryStatus == 'delivered')
                          {
                            let drivertrip = await UserSchema.findOne({_id:data.driverId})

                            if(drivertrip !== null)
                            {
                                let trip = drivertrip.driverDetail.trip + 1
                                await UserSchema.update(
                                    {
                                        _id: data.driverId
                                    },
                                    {
                                        $set: {
                                            "driverDetail.trip" : trip
                                        }
                                    }
                                )
                            }
                          }
                          //
                          
                      }
                      let driverStatus = booking.driverStatus

                      if(data.isJourneyCompleted == 'true')
                      {
                        driverStatus = 'complete'
                      }

                      if(data.driverConfirmation == 'confirm')
                      {
                        driverStatus = 'schedule'
                      }

                      if(data.driverConfirmation == 'decline')
                      {
                        driverStatus = 'free'
                      }
                      
                      await BookingSchema.update(
                        {
                            _id: data.bookingId
                        },
                        {
                            $set: {
                                "driverStatus" : driverStatus
                            }
                        }
                        )

                      let bookingUpdatedDetails = await BookingSchema.findOne({_id: data.bookingId})
                 
                        callback({
                            success: true,
                            STATUSCODE: 200,
                            message: "Booking information has been updated.",
                            response: bookingUpdatedDetails
                           
                        });
                    }
                });

            } else {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "Booking is not valid.",
                    response: {}
                });
            }

        } else {
            callback({
                success: false,
                STATUSCODE: 400,
                message: 'No data provided',
                response: {}
            });
        }
    },  

    //Add Vehicle
    addVehicle:  function (data, fileData, callback) {
        console.log('data---',data)
        if (data) {

                    new VehicleSchema(data).save(  async (err, result) => {
                        if (err) {
                            callback({
                                    success: false,
                                    STATUSCODE: 400,
                                    message: err.message,
                                    response: err
                            });
                        } else {
                            

                            console.log('fileData-------->',fileData);
                            let uploadedArrayImage = []
                            if( fileData && fileData !== null)
                            {
                               
                                //damage vehicle image
                                if(fileData.damageImage)
                                {

                                    if(fileData.damageImage.length > 0)
                                    {

                                    fileData.damageImage.map( async (damageImage) => {
                                        
                                    // VehicleDamageImagePath: "uploads/vehicle/damageImage/",
                                    // UploadVehicleDamageImagePath:'public/uploads/vehicle/damageImage/',

                                    // VehicleImagePath: "uploads/vehicle/vehicleImage/",
                                    // UploadVehicleImagePath:'public/uploads/vehicle/vehicleImage/',
                                     
                                    new Promise( (resolve,reject) => { 
                                                                       
                                    var pic = damageImage;
                                    console.log('pic upload',pic)

                                    var ext = pic.name.slice(pic.name.lastIndexOf('.'));
                                    var fileName = Date.now() + ext;
                                    var folderpath = config.UploadVehicleDamageImagePath;
                                    pic.mv(folderpath + fileName, async (err) => {
                                        if (err) {
                                            reject(err)
                                            callback({
                                                "success": false,
                                                "STATUSCODE": 400,
                                                "message": err.message,
                                                "response": err
                                            })
                                        } else {
                                          
                                                data.damageImage = config.VehicleDamageImagePath + fileName;
                                                console.log('image upload 1 ' ,fileName,data.damageImage)
                                                
                                                    uploadedArrayImage.push(data.damageImage)
                                                    console.log('image upload2 ',uploadedArrayImage)
                                                    
                                                    await VehicleSchema.update({_id: result._id}, {
                                                        $set: {"damageImage": uploadedArrayImage}           
                                                    });
                                                
                                            
                                            resolve(uploadedArrayImage)
                                            console.log('image upload')
                                            }
                                            })
                                        })
                                    })
                                    }else {
                                    var pic = fileData.damageImage;
                                    var ext = pic.name.slice(pic.name.lastIndexOf('.'));
                                    var fileName = Date.now() + ext;
                                    var folderpath = config.UploadVehicleDamageImagePath;
                                    pic.mv(folderpath + fileName, async (err) => {
                                        if (err) {
                                            callback({
                                                "success": false,
                                                "STATUSCODE": 400,
                                                "message": err.message,
                                                "response": err
                                            })
                                        } else {
                                         
                                            data.damageImage = config.VehicleDamageImagePath + fileName;
                                            console.log('image upload 1 ' ,fileName,data.damageImage)
                                            
                                                uploadedArrayImage.push(data.damageImage)
                                                console.log('image upload2 ',uploadedArrayImage)
                                                
                                                await VehicleSchema.update({_id: result._id}, {
                                                    $set: {"damageImage": uploadedArrayImage}           
                                                });
                                            console.log('image upload')
                                        }
                                        })
                                  }
                                
                                }

                                //initial vehicle image

                                let uploadedVehicleArrayImage = []

                                if(fileData.initialVehicleImage)
                                {

                                    if(fileData.initialVehicleImage.length > 0)
                                    {

                                    fileData.initialVehicleImage.map( async (initialVehicleImage) => {
                                        
                                     
                                    new Promise( (resolve,reject) => { 
                                                                       
                                    var pic = initialVehicleImage;
                                    console.log('pic upload',pic)

                                    var ext = pic.name.slice(pic.name.lastIndexOf('.'));
                                    var fileName = Date.now() + ext;
                                    var folderpath = config.UploadVehicleImagePath;
                                    pic.mv(folderpath + fileName, async (err) => {
                                        if (err) {
                                            reject(err)
                                            callback({
                                                "success": false,
                                                "STATUSCODE": 400,
                                                "message": err.message,
                                                "response": err
                                            })
                                        } else {
                                          
                                                data.initialVehicleImage = config.VehicleImagePath + fileName;
                                                console.log('image upload 1 ' ,fileName,data.initialVehicleImage)
                                                
                                                    uploadedVehicleArrayImage.push(data.initialVehicleImage)
                                                    console.log('image upload2 ',uploadedVehicleArrayImage)
                                                    
                                                    await VehicleSchema.update({_id: result._id}, {
                                                        $set: {"initialVehicleImage": uploadedVehicleArrayImage}           
                                                    });
                                                
                                            
                                            resolve(uploadedVehicleArrayImage)
                                            console.log('image upload')
                                            }
                                            })
                                        })
                                    })
                                    }else {
                                    var pic = fileData.initialVehicleImage;
                                    var ext = pic.name.slice(pic.name.lastIndexOf('.'));
                                    var fileName = Date.now() + ext;
                                    var folderpath = config.UploadVehicleImagePath;
                                    pic.mv(folderpath + fileName, async (err) => {
                                        if (err) {
                                            callback({
                                                "success": false,
                                                "STATUSCODE": 400,
                                                "message": err.message,
                                                "response": err
                                            })
                                        } else {
                                         
                                            data.initialVehicleImage = config.VehicleImagePath + fileName;
                                            console.log('image upload 1 ' ,fileName,data.initialVehicleImage)
                                            
                                                uploadedVehicleArrayImage.push(data.initialVehicleImage)
                                                console.log('image upload2 ',uploadedVehicleArrayImage)
                                                
                                                await VehicleSchema.update({_id: result._id}, {
                                                    $set: {"initialVehicleImage": uploadedVehicleArrayImage}           
                                                });
                                            console.log('image upload')
                                        }
                                        })
                                  }
                                
                                }

                            }
                            await BookingSchema.update({
                                _id: data.bookingId
                            }, {
                                $set: {
                                        vehicleId : result._id 
                                     }
                            })

                        let vehicledetail = await VehicleSchema.findOne({_id: result._id})

                        callback({
                            success: true,
                            STATUSCODE: 200,
                            message: "Vehicle added Succesfully.",
                            response: vehicledetail
                            
                        });
                    }
                })
            
        } else {
            callback({
                success: false,
                STATUSCODE: 400,
                message: 'No data provided',
                response: {}
            });
        }
    } ,
    
    // Edit Vehicle Information
    editVehicle: async function (data, fileData, callback) {
        if (data) {

            let vehicle = await VehicleSchema.findOne({
                _id: data.vehicleId
            }, function (err, result) {
                if (err) {
                    callback({
                        success: false,
                        STATUSCODE: 400,
                        message: err.message,
                        response: err
                    });
                }
            });

            if (vehicle !== null) {

                VehicleSchema.update({
                    _id: data.vehicleId
                }, {
                    $set: {
                        ...(( data.customerId)           ? { customerId : data.customerId }                     : {}),
                          }
                }, async (err, resUpdate) => {
                    if (err) {
                        callback({
                            success: false,
                            STATUSCODE: 400,
                            message: err.message,
                            response: err
                        });
                    } else {

                        //final vehicle image

                        let uploadedVehicleArrayImage = []

                        if(fileData.finalVehicleImage)
                        {

                            if(fileData.finalVehicleImage.length > 0)
                            {

                            fileData.finalVehicleImage.map( async (finalVehicleImage) => {
                                
                                
                            new Promise( (resolve,reject) => { 
                                                                
                            var pic = finalVehicleImage;
                            console.log('pic upload',pic)

                            var ext = pic.name.slice(pic.name.lastIndexOf('.'));
                            var fileName = Date.now() + ext;
                            var folderpath = config.UploadVehicleImagePath;
                            pic.mv(folderpath + fileName, async (err) => {
                                if (err) {
                                    reject(err)
                                    callback({
                                        "success": false,
                                        "STATUSCODE": 400,
                                        "message": err.message,
                                        "response": err
                                    })
                                } else {
                                    
                                        data.finalVehicleImage = config.VehicleImagePath + fileName;
                                        console.log('image upload 1 ' ,fileName,data.finalVehicleImage)
                                        
                                            uploadedVehicleArrayImage.push(data.finalVehicleImage)
                                            console.log('image upload2 ',uploadedVehicleArrayImage)
                                            
                                            await VehicleSchema.update({_id: data.vehicleId}, {
                                                $set: {"finalVehicleImage": uploadedVehicleArrayImage}           
                                            });
                                        
                                    
                                    resolve(uploadedVehicleArrayImage)
                                    console.log('image upload')
                                    }
                                    })
                                })
                            })
                            }else {
                            var pic = fileData.finalVehicleImage;
                            var ext = pic.name.slice(pic.name.lastIndexOf('.'));
                            var fileName = Date.now() + ext;
                            var folderpath = config.UploadVehicleImagePath;
                            pic.mv(folderpath + fileName, async (err) => {
                                if (err) {
                                    callback({
                                        "success": false,
                                        "STATUSCODE": 400,
                                        "message": err.message,
                                        "response": err
                                    })
                                } else {
                                    
                                    data.finalVehicleImage = config.VehicleImagePath + fileName;
                                    console.log('image upload 1 ' ,fileName,data.finalVehicleImage)
                                    
                                        uploadedVehicleArrayImage.push(data.finalVehicleImage)
                                        console.log('image upload2 ',uploadedVehicleArrayImage)
                                        
                                        await VehicleSchema.update({_id: data.vehicleId}, {
                                            $set: {"finalVehicleImage": uploadedVehicleArrayImage}           
                                        });
                                    console.log('image upload')
                                }
                                })
                            }
                        
                        }



                      let vehicleUpdatedDetails = await VehicleSchema.findOne({_id: data.vehicleId})
                 
                        callback({
                            success: true,
                            STATUSCODE: 200,
                            message: "Vehicle information has been updated.",
                            response: vehicleUpdatedDetails
                           
                        });
                    }
                });

            } else {
                callback({
                    success: false,
                    STATUSCODE: 404,
                    message: "Vehicle is not valid.",
                    response: {}
                });
            }

        } else {
            callback({
                success: false,
                STATUSCODE: 400,
                message: 'No data provided',
                response: {}
            });
        }
    }, 

}

async function getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

module.exports = apiModel;