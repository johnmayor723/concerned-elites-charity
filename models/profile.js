var mongoose = require("mongoose");
//var passportLocalMongoose = require("passport-local-mongoose");

var profileSchema = new mongoose.Schema({
    title: String,
    image: String,
    description :String
});

//UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("Profile", profileSchema);