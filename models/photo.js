const mongoose = require("mongoose")

var photoSchema = new mongoose.Schema({
    image:String,
    Title:String,
    description:String
})

var Photo = new mongoose.model("Photo", photoSchema)

module.exports = Photo