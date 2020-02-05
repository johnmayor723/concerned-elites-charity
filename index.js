const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require('mongoose')
const path = require('path');
const passport = require('passport')
const LocalStrategy = require("passport-local")
const app = express()
const User = require("./models/user")

var DbUrl = "mongodb://charity:sito123@ds231090.mlab.com:31090/tekdealzdb"
mongoose.connect(DbUrl)


//app configuration

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))
app.use(express.static(path.join(__dirname, 'public')));

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



//charity profilesschema

var profileSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String
})

var Profiles = mongoose.model("Profiles", profileSchema)

//user schema

var userSchema = new mongoose.Schema({
    username: String,
    password:String
})

//main routes

app.get("/", function(req, res){
    res.render("index")
})
app.get("/home", function(req, res) {
    res.redirect("/")
})

app.get('/about', function(req, res){
    res.render('about')
})

app.get('/contact', function(req, res){
    res.render('contact')
})

//authentication routes

app.get("/signup", function(req, res){
    res.render("signup")
})

//handle sign up logic
app.post("/signUp", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("signup");
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/profiles"); 
        });
    });
});


app.get('/signIn', function(req, res) {
    res.render("login")
})

// handling login logic
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/profiles", 
        failureRedirect: "/login"
    }), function(req, res){
});

//admin routes

app.get("/profiles", function(req, res) {
    res.render("profiles")
})

app.post('/profiles', function(req, res){
    var name          = req.body.name;
    var description   = req.body.desc
    var image         = req.body.image
    var newProfile = {
        name : name, 
        description : description, 
        image : image
    }
      Profiles.create(newProfile, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            res.redirect("/profiles");
           console.log(newlyCreated)
        }
    });
   
    
})

app.listen(process.env.PORT, function(){
    console.log("server is listening")
})