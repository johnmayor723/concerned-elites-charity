const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require('mongoose')
const path = require('path');
const passport = require('passport')
const LocalStrategy = require("passport-local")
const multer = require('multer')
const app = express()
const User = require("./models/user")
const Profile = require("./models/profile")
const Project = require("./models/project")

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

// SET STORAGE
var storage = multer.diskStorage({
  destination: './public/files',
  filename: function(req, file, fn){
    fn(null,  new Date().getTime().toString()+'-'+file.fieldname+path.extname(file.originalname));
  }
}); 

var upload = multer({ storage: storage })

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

// logout route
app.get("/logout", function(req, res){
   req.logout();
   res.redirect("/profiles");
});

//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/home");
}

//admin routes

//admin dashboard
app.get("/profiles",isLoggedIn , function(req, res) {
   res.render('profiles')
   
})

//get the project page
app.get("/projectlists", function(req, res){
     Project.find({}, function(err, found){
        if(err){
            console.log(err)
            res.redirect("/home")
        } else{
           res.render("projects", {projects:found})
           
        }
    })
})

//get memebers page
app.get("/memberslists", function(req, res){
     Profile.find({}, function(err, found){
        if(err){
            console.log(err)
            res.redirect("/home")
        } else{
            res.render("members", {profiles:found})
         
        }
    })
})

//create members profile
app.post('/profiles',upload.single('image'), function(req, res){
    var name          = req.body.name;
    var description   = req.body.desc
    var image  = "files/"+req.file.filename;
    var newProfile = {
        name : name, 
        description : description, 
        image : image
    }
      Profile.create(newProfile, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            res.redirect("/profiles");
           console.log(newlyCreated)
        }
    });
})

//create projects in the database
app.post('/createProject',upload.single('image'), function(req, res){
    var title          = req.body.title
    var description   = req.body.desc
    var image  = "files/"+req.file.filename;
    var newProject = {
        title : title, 
        description : description, 
        image : image
    }
      Project.create(newProject, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            res.redirect("/profiles");
           //console.log(newlyCreated)
        }
    });
   
    
})

// show profile
app.get("/profile/profile.id", function(req, res){
      
})
// edit profile

app.put("/:id",isLoggedIn, function(req, res){
    // find and update the correct campground
    Profile.findByIdAndUpdate(req.params.id, req.body.profile, function(err, updatedCampground){
       if(err){
           res.redirect("/projects");
       } else {
           //redirect somewhere(show page)
           res.redirect("/projects/" + req.params.id);
       }
    });
});

// delete profile
app.delete("/:id",isLoggedIn, function(req, res){
   Profile.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/profiles");
      } else {
          res.redirect("/profiles");
      }
   });
})

//show project

//edit project
app.put("/:id",isLoggedIn, function(req, res){
    // find and update the correct campground
    Project.findByIdAndUpdate(req.params.id, req.body.project, function(err, updated){
       if(err){
           res.redirect("/campgrounds");
       } else {
           //redirect somewhere(show page)
           res.redirect("/projects/" + req.params.id);
       }
    });
});

//delete project
app.delete("/:id",isLoggedIn, function(req, res){
   Project.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/projects");
      } else {
          res.redirect("/projects");
      }
   });
})


app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});

app.listen(process.env.PORT, function(){
    console.log("server started running")
})