var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');

var mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

//Create UserSchema
var AdminSchema = new mongoose.Schema({
    _id: {type: String, required: true },
	firstName: {type: String, required: true },
	lastName: {type: String, required: true },
	email: {type: String, required: true, index: {unique : true}},
    password: {type: String, required: true, select: false},
    profileImage: {type: String},
    permission: {
        view: { type: String, enum: ['1', '0'], default: '1'},
        add: { type: String, enum: ['1', '0'], default: '0'},        
        edit: { type: String, enum: ['1', '0'], default: '0'},
        delete: { type: String, enum: ['1', '0'], default: '0'}
    },
    authtoken: {type: String,default: ''},
    status: {  type: String, enum: ['yes', 'no'], default: 'no' }
    },{
        timestamps: true
    });

AdminSchema.pre('save', function(next){
    var admin = this;
    if(!admin.isModified('password')) return next();

    bcrypt.hash(admin.password, null, null, function(err, hash){
        if(err){return next(err);}

        admin.password = hash;
        next();
    });
});

AdminSchema.plugin(mongoosePaginate);
AdminSchema.plugin(mongooseAggregatePaginate);
// Export your module
module.exports = mongoose.model("Admin", AdminSchema);
