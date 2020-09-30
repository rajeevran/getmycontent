var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

var Schema = mongoose.Schema;
var userschema = new Schema({
    
            _id                     : { type: String, required : true},
            firstName               : { type: String, default: '' },
            lastName                : { type: String, default: '' },
            profileImage            : { type: String, default: '' },
            gender                  : { type: String },
            email                   : { type: String, default: '' },
            emailVerificationToken  : { type: String, default: '' },
            phoneNumber             : { type: String, default: '' },
            dob                     : { type: Date },
            role                    : { type: String, enum: ['driver', 'customer']},
            ccbill                  : {
                                        paymentMethod: {
                                        type: String,
                                        },
                                        accountNumber: {
                                        type: String,
                                        },
                                        accountHolderName: {
                                        type: String,
                                        },
                                        bankName: {
                                        type: String,
                                        },
                                        validity: {
                                        type: String,
                                        },
                                        cvcCode: {
                                        type: String,
                                        }
                                      },
           driverDetail             : {
                                        licenceNumber: {
                                        type: String,
                                        },
                                        companyInformation: {
                                        type: String,
                                        },
                                        insuaranceNumber: {
                                        type: String,
                                        },
                                        mc: {
                                        type: String,
                                        },
                                        vin: {
                                        type: String,
                                        },
                                        dot: {
                                        type: String,
                                        },
                                        trip: {
                                        type: Number,
                                        default:0
                                        },
                                        rating: {
                                        type: Number,
                                        default:0
                                        }
                                     },
            email_verify           : { type: Boolean, default: false },
            bookingId              : { type: String, default: '' },
            otp                    : { type: String, default: '' },
            password               : { type: String, default: '' },
            authToken              : { type: String, default: '' },
            appType                : { type: String, enum: ['IOS', 'ANDROID', 'BROWSER']},
            socialLogin            : { type:Object },
            deviceToken            : { type: String, default: '' },
            deviceId               : { type: String, default: '' },
            status                 : { type: Boolean, default: true }
    }, 
    {
     timestamps: true
    });
userschema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password'))
        return next();
    
    bcrypt.hash(user.password, null, null, function (err, hash) {
        if (err) {
            return next(err);
        }
        if(user.password !== ""){
            user.password = hash;
        }
        next();
    });
});

userschema.plugin(mongoosePaginate);
userschema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('User', userschema);