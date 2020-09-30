
var AdminSchema = require('../../schema/admin/admin');
var UserSchema = require('../../schema/api/users');

var BookingSchema   = require('../../schema/api/booking');
var config = require('../../config');
var async = require("async");
var bcrypt = require('bcrypt-nodejs');
var mailProperty = require('../../modules/sendMail');
var jwt = require('jsonwebtoken');
var jwtOtp = require('jwt-otp');
var fs = require('fs');
var mongoose = require('mongoose');
var ObjectID = mongoose.Types.ObjectId;
var secretKey = config.secretKey;

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

var commonModel = {

    authenticate: function (jwtData, callback) {
        if (jwtData["x-access-token"]) {
            jwt.verify(jwtData["x-access-token"], config.secretKey, function (err, decoded) {
                if (err) {
                    callback({
                        success: false,
                        STATUSCODE: 400,
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

    changePassword: async function (data, callback) {
        console.log('data----',data)
    
            //====JWT Token verification
            var decoded = await jwt.verify(data.token, secretKey);

            console.log('decoded---->',decoded)
            data.adminId = decoded.adminId
            console.log('data after decoded---->',data)

            if (decoded !== null) {

                    AdminSchema.findOne({
                        _id: data.adminId
                    }, function (err, resDetails) {
                        if (err) {
                            callback({
                                success: false,
                                STATUSCODE: 505,
                                message: "INTERNAL DB ERROR",
                                response: err
                            });
                        } else {
                            if (resDetails == null) {
                                callback({
                                    success: false,
                                    STATUSCODE: 502,
                                    message: "Admin does not exist",
                                    response: {}
                                });
                            } else {
                                bcrypt.hash(data.newPassword, null, null, function (err, hash) {
                                    if (err) {
                                        callback({
                                            success: false,
                                            STATUSCODE: 505,
                                            message: "INTERNAL DB ERROR",
                                            response: err
                                        });
                                    } else {
                                        AdminSchema.update({
                                            _id: resDetails._id
                                        }, {
                                            $set: {
                                                "password": hash
                                            }
                                        }, function (err, result) {
                                            if (err) {
                                                callback({
                                                    success: false,
                                                    STATUSCODE: 505,
                                                    message: "INTERNAL DB ERROR",
                                                    response: err
                                                });
                                            } else {
                                    
                                                mailProperty('resetPasswordMail')(resDetails.email, {
                                                    name: resDetails.firstName +' '+resDetails.lastName,
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
                
            }else{

                callback({
                    success: false,
                    STATUSCODE: 505,
                    message: "Token not provided",
                    response: {}
                }); 

            }
        
    },
    sendEmail: async function (data, callback) {
        console.log('data----',data)

                    try{
                        mailProperty('adminToUserMail')(data.email, {
                            name            : data.name,
                            adminresponse   : data.adminresponse,
                            site_url        : config.liveUrl,
                            date            : new Date()
                        }).send();
    
                        callback({
                            success: true,
                            STATUSCODE: 200,
                            message: "Mail Sent Successfully.Please check your registered email.",
                            response: { status: "success" }
                        });

                    }catch(err){

                        callback({
                            success: false,
                            STATUSCODE: 505,
                            message: err.message,
                            response: err
                        });

                    }
            
    },

    forgotpassword: function (data, callback) {
        console.log('data----',data)

            AdminSchema.findOne({
                email: data.email.toLowerCase()
            }, {
                fullname: 1
            }, function (err, resDetails) {
                if (err) {
                    callback({
                        success: false,
                        STATUSCODE: 505,
                        message: "INTERNAL DB ERROR",
                        response: err
                    });
                } else {
                    if (resDetails == null) {
                        callback({
                            success: false,
                            STATUSCODE: 502,
                            message: "User does not exist",
                            response: {}
                        });
                    } else {
                        bcrypt.hash(data.password, null, null, function (err, hash) {
                            if (err) {
                                callback({
                                    success: false,
                                    STATUSCODE: 505,
                                    message: "INTERNAL DB ERROR",
                                    response: err
                                });
                            } else {
                                AdminSchema.update({
                                    _id: resDetails._id
                                }, {
                                    $set: {
                                        password: hash
                                    }
                                }, function (err, result) {
                                    if (err) {
                                        callback({
                                            success: false,
                                            STATUSCODE: 505,
                                            message: "INTERNAL DB ERROR",
                                            response: err
                                        });
                                    } else {
                                        callback({
                                            success: true,
                                            STATUSCODE: 200,
                                            message: "Password changed.Please check your registered email.",
                                            response: resDetails
                                        });
                                    }
                                });
                            }
                        });

                    }
                }
            });
        
    },

    listAdmin: function (data, callback) {
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

        if(data.adminId){
            query['_id'] = data.adminId
        }           

        if(data.firstName){
            query['firstName'] = data.firstName
        }   

        if (data.searchName) {
            queryName = {
                "$or": [{
                    "firstName": new RegExp(data.searchName, 'i')
                }, {
                    "lastName": new RegExp(data.searchName, 'i')
                }]
            }
        }


        query = ( data.searchName !== undefined || data.searchName !== '' ) ? { ...query ,...queryName} : query

        //searchArray.push({'description': new RegExp(data.searchTerm, 'i')});

        var aggregate = AdminSchema.aggregate();
        aggregate.match(query);
        aggregate.sort({
            'updatedAt': -1
        })

        var options = {
            page: page,
            limit: limit
        }

        AdminSchema.aggregatePaginate(aggregate, options, function (err, results, pageCount, count) {
            if (err) {
                callback({
                    success: false,
                    STATUSCODE: 505,
                    message: err,
                    response: {}
                });

            } else {

                
                results.map( (result) => {

                    let profile_image = result.profileImage;

                    if (!profile_image || profile_image == '') {
                        profile_image = config.userDemoPicPath;
                    } else {
                        profile_image = result.profileImage;
                    }
                    result.profileImage = profile_image

                } )


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
                    message: "Admin List",
                    response: data//[...results]
                });

            }
        });

     },

    addAdmin: async function (data, fileData, callback) { 
        
    console.log('data----',data)

        if (data) {
            AdminSchema.findOne({
                    email: data.email
                }, {
                    _id: 1,
                    email: 1,
                },
                  (err, result) =>{
                    if (err) {
                        callback({
                            success: false,
                            STATUSCODE: 505,
                            message: "INTERNAL DB ERROR",
                            response: []
                        });
                    } else {
                        if (result != null) {
                            callback({
                                success: false,
                                STATUSCODE: 4004,
                                message: "Email address already exist",
                                response: result
                            });
                        } else {

                                new AdminSchema(data).save( async (err, result) => {
                                    if (err) {
                                        callback({
                                                success: false,
                                                STATUSCODE: 505,
                                                message: "INTERNAL DB ERROR",
                                                response: []
                                        });
                                    } else {
                                        console.log('fileData-------->',fileData);

                                        if( fileData && fileData !== null){
                                    
                                                let imageUploaded = new Promise( (resolve,reject) => { 

                                                    var pic = fileData.profileImage;
                                                    var ext = pic.name.slice(pic.name.lastIndexOf('.'));
                                                    var fileName = Date.now() + ext;
                                                    var folderpath = config.UploadAdminProfilePath;
                                                    pic.mv(folderpath + fileName,  (err) => {
                                                        if (err) {
                                                            reject(err)
                                                            callback({
                                                                "success": false,
                                                                "STATUSCODE": 505,
                                                                "message": "INTERNAL DB ERROR",
                                                                "response": err
                                                            })
                                                        } else {
                                                            //data._id = new ObjectID;
                                                            if(data.profileImage == (config.AdminProfilePath + fileName) )
                                                            {

                                                            }else{
                                                                data.profileImage = config.AdminProfilePath + fileName;
                                                            }
                                                            resolve(data.profileImage)
                                                            console.log('image upload')
                                                        }
                                                    })

                                            })

                                            data.profileImage = await imageUploaded

                                            let updateResponse = await AdminSchema.update({_id: result._id}, {
                                                            $set: {"profileImage": data.profileImage}           
                                                            });
                                        }

                                    let findAdminResponse = await AdminSchema.findOne({_id: result._id})
                                    if(findAdminResponse !== null)
                                    {
                                        findAdminResponse.profileImage = findAdminResponse.profileImage !== undefined ?
                                                                         config.liveUrl+findAdminResponse.profileImage:''
                                    }

                                    callback({
                                            success: true,
                                            STATUSCODE: 200,
                                            message: "Admin registered successfully.",
                                            response: findAdminResponse
                                    });
                                }
                            });
                        }
                    }
                });
        } else {
            callback({
                success: false,
                STATUSCODE: 505,
                message: "INTERNAL DB ERROR",
                response: []
            });
        }
    },

    // Edit Admin Information
    editAdmin: async function (data, fileData, callback) {

        console.log('edit data-------->', data);
        
        if (data) {

            let admin = await AdminSchema.findOne({
                _id: data.adminId
            }, function (err, result) {
                if (err) {
                    callback({
                        success: false,
                        STATUSCODE: 505,
                        message: "Error Occur while editing admin",
                        response: err
                    });
                }
            });

            if (admin !== null) {

                console.log('data.password---',typeof(data.password))
                let hash = bcrypt.hashSync(data.password);
                console.log('hash---',hash)
                console.log('admin.password---',admin.password)

                AdminSchema.update({
                    _id: data.adminId
                }, {
                    $set: {
                        firstName: data.firstName !== undefined ? data.firstName : admin.firstName,
                        ...(( data.password)     ? { password : hash }             : {}),
                        lastName: data.lastName !== undefined ? data.lastName : admin.lastName,
                        profileImage: data.profileImage !== undefined ? data.profileImage : admin.profileImage,
                        email: data.email !== undefined ? data.email : admin.email,
                        status: data.status !== undefined ? data.status : admin.status
                    }
                }, async (err, resUpdate) => {
                    if (err) {
                        callback({
                            success: false,
                            STATUSCODE: 505,
                            message: "INTERNAL DB ERROR",
                            response: err
                        });
                    } else {

                        console.log('fileData-------->',fileData);
                        
                        if( fileData && fileData !== null){

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

                            let imageUploaded = new Promise( (resolve,reject) => { 

                                var pic = fileData.profileImage;
                                var ext = pic.name.slice(pic.name.lastIndexOf('.'));
                                var fileName = Date.now() + ext;
                                var folderpath = config.UploadAdminProfilePath;
                                pic.mv(folderpath + fileName,  (err) => {
                                    if (err) {
                                        reject(err)
                                        callback({
                                            "success": false,
                                            "STATUSCODE": 505,
                                            "message": "INTERNAL DB ERROR",
                                            "response": err
                                        })
                                    } else {
                                        //data._id = new ObjectID;
                                        if(data.profileImage == (config.AdminProfilePath + fileName) )
                                        {

                                        }else{
                                            data.profileImage = config.AdminProfilePath + fileName;
                                        }
                                        resolve(data.profileImage)
                                        console.log('image upload')
                                    }
                                })

                        })

                        data.profileImage = await imageUploaded

                        await AdminSchema.update({_id: admin._id}, {
                                        $set: {"profileImage": data.profileImage}           
                                        });
                      }

                      let adminUpdatedDetails = await AdminSchema.findOne({_id: data.adminId})
                      if(adminUpdatedDetails !== null)
                      {
                          adminUpdatedDetails.profileImage = adminUpdatedDetails.profileImage !== undefined ?
                                                           config.liveUrl+adminUpdatedDetails.profileImage:''
                      }

                        callback({
                            success: true,
                            STATUSCODE: 200,
                            message: "Admin updated successfully.",
                            response: adminUpdatedDetails
                           
                        });
                    }
                });

            } else {
                callback({
                    success: false,
                    STATUSCODE: 4004,
                    message: "Admin is not valid.",
                    response: {}
                });
            }

        } else {
            callback({
                success: false,
                STATUSCODE: 505,
                message: "INTERNAL DB ERROR",
                response: {}
            });
        }
    },
    
    // Delete Admin Information
    deleteAdmin: async function (data,  callback) {
        if (data) {

            let admin = await AdminSchema.findOne({
                _id: data.adminId
            }, function (err, result) {
                if (err) {
                    callback({
                        success: false,
                        STATUSCODE: 505,
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

                AdminSchema.remove({
                    _id: data.adminId
                }, async (err, resRemoved) => {

                if (err) {
                        callback({
                            success: false,
                            STATUSCODE: 505,
                            message: "INTERNAL DB ERROR",
                            response: err
                        });
                } else {

                        callback({
                            success: true,
                            STATUSCODE: 200,
                            message: "Admin removed Successfully.",
                            response: {}
                        
                        });
                    }
                });

            } else {
                callback({
                    success: false,
                    STATUSCODE: 4004,
                    message: "Admin is not valid.",
                    response: {}
                });
            }

        } else {
            callback({
                success: false,
                STATUSCODE: 505,
                message: "INTERNAL DB ERROR",
                response: {}
            });
        }
    }, 

    addUser: async function (data, fileData, callback) {
        console.log('data----',data)
    
            if (data) {
                UserSchema.findOne({
                        email: data.email
                    }, {
                        _id: 1,
                        email: 1,
                    },
                      (err, result) =>{
                        if (err) {
                            callback({
                                success: false,
                                STATUSCODE: 505,
                                message: "INTERNAL DB ERROR",
                                response: []
                            });
                        } else {
                            if (result != null) {
                                callback({
                                    success: false,
                                    STATUSCODE: 4004,
                                    message: "Email address already exist",
                                    response: result
                                });
                            } else {
    
                                    new UserSchema(data).save( async (err, result) => {
                                        if (err) {
                                            callback({
                                                    success: false,
                                                    STATUSCODE: 505,
                                                    message: "INTERNAL DB ERROR",
                                                    response: []
                                            });
                                        } else {
                                            console.log('fileData-------->',fileData);
    
                                            if( fileData && fileData !== null){
                                        
                                                    let imageUploaded = new Promise( (resolve,reject) => { 
    
                                                        var pic = fileData.profileImage;
                                                        var ext = pic.name.slice(pic.name.lastIndexOf('.'));
                                                        var fileName = Date.now() + ext;
                                                        var folderpath = config.UploadAdminProfilePath;
                                                        pic.mv(folderpath + fileName, async (err) => {
                                                            if (err) {
                                                                reject(err)
                                                                callback({
                                                                    "success": false,
                                                                    "STATUSCODE": 505,
                                                                    "message": "INTERNAL DB ERROR",
                                                                    "response": err
                                                                })
                                                            } else {
                                                                //data._id = new ObjectID;
                                                                if(data.profileImage == (config.AdminProfilePath + fileName) )
                                                                {
    
                                                                }else{
                                                                    data.profileImage = config.AdminProfilePath + fileName;
                                                                }

                                                                await UserSchema.update({_id: result._id}, {
                                                                    $set: {
                                                                        "profile": [{
                                                                            media: data.profileImage,
                                                                            isMain: true
                                                                        }
                                                                        ]
                                                                    }           
                                                                });

                                                                resolve(data.profileImage)
                                                                console.log('image upload')
                                                            }
                                                        })
    
                                                })
    
                                                data.profileImage = await imageUploaded
    
                                                let updateResponse = await UserSchema.update({_id: result._id}, {
                                                                $set: {"profileImage": data.profileImage}           
                                                                });
                                                               
                                                
                                            
                                            }
    
                                        let findUserResponse = await UserSchema.findOne({_id: result._id})
                                        if(findUserResponse !== null)
                                        {
                                            findUserResponse.profileImage = findUserResponse.profileImage !== undefined ?
                                                                             findUserResponse.profileImage:''
                                        }
    
                                        callback({
                                                success: true,
                                                STATUSCODE: 200,
                                                message: "User registered successfully.",
                                                response: findUserResponse
                                        });
                                    }
                                });
                            }
                        }
                    });
            } else {
                callback({
                    success: false,
                    STATUSCODE: 505,
                    message: "INTERNAL DB ERROR",
                    response: []
                });
            }
    },
  

    // List User
    listUser: async function (data, callback) {
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
 
         if(data.userId){
             query['_id'] = data.userId
         }           
 
         if(data.firstName){
             query['firstName'] = new RegExp(data.firstName, 'i')
         }   
 
         if(data.lastName){
             query['lastName'] = new RegExp(data.lastName, 'i')
         }   
       
         if(data.phoneNumber){
             query['phoneNumber'] = data.phoneNumber
         } 
 
         if(data.email){
             query['email'] = data.email
         } 
 
         if(data.gender){
             query['gender'] = data.gender
         } 
 
         
         if(data.age){
             query['age'] = parseInt(data.age)
         }        
 
         if(data.status === false || data.status === 'false' ){
             query['status'] = false
         }         
         if(data.status === true || data.status === 'true'){
             query['status'] = true
         }   
 
         if(data.dob){
             query['dob'] = new Date(data.dob)
         } 
         
        
        if(data.role){
            query['role'] = data.role
        } 

         if (data.searchName) {
             query['firstName'] = new RegExp(data.searchName, 'i')
         }
 
         var aggregate = UserSchema.aggregate(
             {
                 $match: query
             },
            
             {
                 $group : {
     
                     _id :"$_id",
                     firstName : {
                         "$first": "$firstName"
                     },
                     lastName : {
                         "$first": "$lastName"
                     },
                     phoneNumber : {
                         "$first": "$phoneNumber"
                     },
                     role : {
                         "$first": "$role"
                     },
                     ccbill : {
                         "$first": "$ccbill"
                     },
                     profileImage : {
                         "$first": "$profileImage"
                     },
                     gender : {
                         "$first": "$gender"
                     },
                     email : {
                         "$first": "$email"
                     },
                     phoneNumber : {
                         "$first": "$phoneNumber"
                     },
                     age : {
                         "$first": "$age"
                     },
                     dob : {
                         "$first": "$dob"
                     },
                     bookingId : {
                         "$first": "$bookingId"
                     },
                     email_verify : {
                         "$first": "$email_verify"
                     },
                     password : {
                         "$first": "$password"
                     },
                     authToken : {
                         "$first": "$authToken"
                     },
                     appType : {
                         "$first": "$appType"
                     },
                     socialLogin : {
                         "$first": "$socialLogin"
                     },
                     deviceToken : {
                         "$first": "$deviceToken"
                     },
                     deviceId : {
                         "$first": "$deviceId"
                     },
                     driverDetail : {
                         "$first": "$driverDetail"
                     },
                     ccbill : {
                         "$first": "$ccbill"
                     },
                     
                     status : {
                         "$first": "$status"
                     },
                     
                     updatedAt : {
                         "$first": "$updatedAt"
                     },
                 }
             },
             {
                 $project : {
                     _id : 1,
                     firstName: 1,
                     lastName: 1,
                     profileImage: 1,
                     role: 1,
                     ccbill: 1,
                     phoneNumber: 1,
                     gender : 1,
                     email : 1,
                     dob : 1,
                     email_verify : 1,
                     bookingId : 1,
                     otp : 1,
                     password : 1,
                     authToken : 1,
                     appType : 1,
                     socialLogin : 1,
                     deviceToken : 1,
                     deviceId : 1,
                     driverDetail : 1,
                     ccbill : 1,
                     status : 1,
                     updatedAt:1
                 }
             }, 
             {
                 $sort: {updatedAt: -1}
             }
 
         );
         // aggregate.match(query);
         // aggregate.sort({
         //     'updatedAt': -1
         // })
 
         var options = {
             page: page,
             limit: limit
         }
 
         UserSchema.aggregatePaginate(aggregate, options, function (err, results, pageCount, count) {
             if (err) {
                 callback({
                     success: false,
                     STATUSCODE: 400,
                     message: err,
                     response: {}
                 });
 
             } else {
 
                 
                 results.map( (result) => {
 
                     let profile_image = result.profileImage;
                     //let selfie_image = result.selfieImage;
 
                     if (!profile_image || profile_image == '') {
                         profile_image = config.userDemoPicPath;
                     } else {
                         profile_image = result.profileImage;
                     }
 
 
                     result.profileImage = profile_image
 
                 } )
 
 
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
                     message: "User List",
                     response: data
                 });
 
             }
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
                UserSchema.update({
                    _id: data.userId
                }, {
                    $set: {
                        ...(( data.firstName)    ? { firstName : data.firstName }                   : {}),
                        ...(( data.lastName)     ? { lastName : data.lastName }                     : {}),
                        ...(( data.gender)       ? { gender : data.gender }                         : {}),
                        ...(( data.phoneNumber)  ? { phoneNumber : data.phoneNumber }               : {}),
                        ...(( data.bookingId)    ? { bookingId : data.bookingId }                   : {}),
                        ...(( data.email)        ? { email : data.email }                           : {}),
                        ...(( data.role)         ? { role  : data.role }                            : {}),
                        ...(( data.dob !== undefined && data.dob !== 'undefined' && data.dob !== 'null')          ? { dob : data.dob }                 : {}),  
                        ...(( data.status)       ? { status : data.status }                         : {}),
                        ...(( data.ccbill)       ? { ccbill :JSON.parse(data.ccbill) }              : {}),
                        ...(( data.driverDetail) ? { driverDetail :JSON.parse(data.driverDetail)}   : {})
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
                        if(data.bookingId)
                        {

                            await BookingSchema.update({
                                _id: data.bookingId
                            }, {
                                $set: {
                                        driverId    : data.userId,
                                        driverStatus: 'assigned'
                                     }
                            })
                        }

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


    // List Booking
    listBooking: async function (data, callback) {
        console.log('data----',data)

        var page = 1,
        limit = 10,
        query = {},
        queryName = {};


        if(data.bookingId){
            query['_id'] = data.bookingId
        }           

        if(data.isJourneyCompleted){
            query['isJourneyCompleted'] = data.isJourneyCompleted
        }  

        if(data.deliveryStatus){
            query['deliveryStatus'] = data.deliveryStatus
        }  

        if(data.searchName){
            query['bookingNumber'] = data.searchName
        }  
        
        var aggregate = await BookingSchema.find(query);

                var data = {
                    docs:aggregate,
                    total: aggregate.length
                }
                callback({
                    success: true,
                    STATUSCODE: 200,
                    message: "Booking List",
                    response: data
                });
    },


    // List Driver
    listDriver: async function (data, callback) {
        console.log('data----',data)

        var page = 1,
        limit = 10,
        query = {}

        query['role'] = 'driver'

        if(data.driverId){
            query['_id'] = data.driverId
        }           

        var aggregate = await UserSchema.find(query);

                var data = {
                    docs:aggregate,
                    total: aggregate.length
                }
                callback({
                    success: true,
                    STATUSCODE: 200,
                    message: "Driver List",
                    response: data
                });
    },

    // List Customer
    listCustomer: async function (data, callback) {
        console.log('data----',data)

        var page = 1,
        limit = 10,
        query = {}

        query['role'] = 'customer'

        if(data.driverId){
            query['_id'] = data.driverId
        }           

        var aggregate = await UserSchema.find(query);

                var data = {
                    docs:aggregate,
                    total: aggregate.length
                }
                callback({
                    success: true,
                    STATUSCODE: 200,
                    message: "Customer List",
                    response: data
                });
    },

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
}

module.exports = commonModel;