var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

var Schema = mongoose.Schema;
var bookingschema = new Schema({
    
            _id                     : { type: String, required : true },
            bookingNumber           : { type: String, required : true },
            pickupLocation          : { type: String, required : true },
            dropLocation            : { type: String, required : true },
            pickupDate              : { type: Date,   required : true },
            dropDate                : { type: Date,   required : true },
            vehicleDetail           : {
                                        name: {
                                        type: String,
                                        },
                                        color: {
                                        type: String,
                                        },
                                        type: {
                                        type: String,
                                        },
                                        vin: {
                                        type: String
                                        }
                                      },
            customerId              : { type: String, required : true },
            driverId                : { type: String, required : false },
            vehicleId               : { type: String, required : false },
            price                   : { type: Number, required : true },
            distance                : { type: Number, required : true },
            rating                  : { type: Number, required : false },
            pickupNotes             : { type: String, required : false },
            deliveryStatus          : { 
                                        type: String,  
                                        default:'initiate' , 
                                        enum: ['initiate', 'delivered'], 
                                        required : true 
                                      },
            isJourneyCompleted      : { 
                                        type: Boolean, 
                                        default:false , 
                                        required : true 
                                      },
            driverConfirmation      : { 
                                        type: String,  
                                        default:'initiate' , 
                                        enum: ['initiate', 'decline', 'confirm'], 
                                        required : true 
                                      },
            customerConfirmation    : { 
                                        type: String,  
                                        default:'initiate' , 
                                        enum: ['initiate', 'decline', 'confirm'], 
                                        required : true 
                                      },
            driverStatus            : { 
                                        type: String,  
                                        default:'free' , 
                                        enum: ['free',  'assigned', 'schedule', 'complete'], 
                                        required : true 
                                      }

    }, 
    {
     timestamps: true
    });

bookingschema.plugin(mongoosePaginate);
bookingschema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('Booking', bookingschema);