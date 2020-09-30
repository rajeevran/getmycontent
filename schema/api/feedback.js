var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

var FeedBackschema = new Schema({
    _id: { type: String},

    fromUser: {
               type: String,
               ref:'User'
              },
    rating:  {
            type: Number,   
            required: false,
            default: 0
            },

    message:{
            type: String, 
            required: false,
            default: ''
            }
}, {
    timestamps: true
});

FeedBackschema.plugin(mongoosePaginate);
FeedBackschema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('FeedBack', FeedBackschema);