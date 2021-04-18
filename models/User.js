var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
// set up a mongoose model
var UserSchema = new Schema({
    phone: String,
    password: String,
    email:String,
    name:String,
    status:String,
    avatar:String,
    video:String,
    banner:String,
    type:String,
    createdDate:Date,
    modifiedDate:Date,
    rejectedReason:String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};
module.exports = mongoose.model('User', UserSchema);