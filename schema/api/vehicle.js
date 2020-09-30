var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

var Schema = mongoose.Schema;
var vehicleschema = new Schema({
    
            _id                     : { type: String, required : true },
            name                    : { type: String, required : true },
            color                   : { type: String, required : true },
            type                    : { type: String, required : true },
            vin                     : { type: String, required : true },
            isDamage                : { type: Boolean, default:false, required : true },
            comment                 : { type: String, required : false },
            damageImage             : [{ type: String, required : false }],
            initialVehicleImage     : [{ type: String, required : false }],
            finalVehicleImage       : [{ type: String, required : false }]
    }, 
    {
     timestamps: true
    });

vehicleschema.plugin(mongoosePaginate);
vehicleschema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('Vehicle', vehicleschema);