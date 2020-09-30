var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
var Schema = mongoose.Schema;
var reviewschema = new Schema({
    _id:     {
                type: String,
                required: true
             },

    fromUser:{
                type: String,
                ref:'User'
             },

    toUser:  {
                type: String,
                ref:'User'
             },

    rating:  {
                type: Number,   
                required: false,
                default: 0
             },

    message: {
            type: String, 
            required: false,
            default: ''
            }
}, {
    timestamps: true
});

reviewschema.plugin(mongoosePaginate);
reviewschema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('Review', reviewschema);