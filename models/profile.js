var mongoose = require("mongoose");
//var passportLocalMongoose = require("passport-local-mongoose");

var profileSchema = new mongoose.Schema({
    name: String,
    image: String,
    description :String
});

//UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("Profile", profileSchema);