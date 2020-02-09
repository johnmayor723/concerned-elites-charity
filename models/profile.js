var mongoose = require("mongoose");
//var passportLocalMongoose = require("passport-local-mongoose");

var profileSchema = new mongoose.Schema({
    firstname: String,
    surname: String,
    image: String,
    description :String,
    state: String,
    ocupation: String,
    gender:String,
    DOB : String,
    location: String
});

//UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("Profile", profileSchema);