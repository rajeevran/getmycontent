var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

var Schema = mongoose.Schema;

var privacySchema = new Schema({
    _id: { type: String},
    description: { type: String, default: '' },
    status: { type: String, enum: ['yes', 'no',], default: 'yes'  }
    }, 
    {
            timestamps: true
    });


privacySchema.plugin(mongoosePaginate);
privacySchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('Privacy', privacySchema);