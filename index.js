const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require('mongoose')
const path = require('path');
const passport = require('passport')
const LocalStrategy = require("passport-local")
const multer = require('multer')
const methodOverride = require("method-override")
const app = express()
const User = require("./models/user")
const Profile = require("./models/profile")
const Project = require("./models/project")
const userRoutes = require('./routes/user')
const projectRoutes = require('./routes/project')
const profileRoutes = require('./routes/profile')

var DbUrl = "mongodb://charity:sito123@ds231090.mlab.com:31090/tekdealzdb"
mongoose.connect(DbUrl)


//app configuration

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride("_method"));

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
    Project.find({}, function(err, projects){
        res.render("index",{projects:projects} )
    })
    
})
app.get("/home", function(req, res) {
    res.redirect("/")
})

app.get('/about', function(req, res){
    Profile.find({}, function(err, profiles){
       
        if(err){
            console.log(err)
        }else{
             if(req.isAuthenticated){
             var admin = req.user
            res.render('about', {profiles:profiles, admin:admin})
            } 
        }
    })
   
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
             if(req.isAuthenticated){
             var admin = req.user
            res.render("projects", {projects:found, admin : admin})
            } 
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
            if(req.isAuthenticated){
             var admin = req.user
            res.render("members", {profiles:found, admin : admin})
            } 
         
        } 
    })
})

//create members profile
app.post('/profiles',upload.single('image'), function(req, res){
    var firstname        = req.body.firstname;
    var surname        = req.body.surname;
    var description   = req.body.desc
    var state = req.body.state
    var DOB = req.body.DOB
    var gender= req.body.gender
    var location = req.body.address
    var ocupation = req.body.ocupation
    var image  = "files/"+req.file.filename;
    var newProfile = {
       firstname, surname, description, state, DOB, gender, location, image, ocupation
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
    if(req.file){
         var title = req.body.title
    var description   = req.body.desc
    var image  =  "files/"+req.file.filename; 
    var newProject = {
        title : title, 
        description : description, 
        image : image
    }
      Project.create(newProject, function(err, newlyCreated){
        if(err){
            console.log(err);
            res.send(err)
        } else {
            //redirect back to campgrounds page
            res.redirect("/profiles");
           //console.log(newlyCreated)
        } 
    });
   
    
    } else{
         var title = req.body.title
    var description   = req.body.desc
    var image  =  "images/cover_bg_1.jpg"
    var newProject = {
        title : title, 
        description : description, 
        image : image
    }
      Project.create(newProject, function(err, newlyCreated){
        if(err){
            console.log(err);
            res.send(err)
        } else {
            //redirect back to campgrounds page
            res.redirect("/profiles");
           //console.log(newlyCreated)
        } 
    });
   
    }
   
})

//get edit profile form
app.get('/profiles/:id/edit', function(req, res) {
      Profile.findById(req.params.id, function(err, found){
        res.render("editprofile", {profile: found});
    });
})
//show profile
app.get('/profiles/:id', function(req, res){
    Profile.findById(req.params.id, function(err, found){
        if(err){
            res.redirect('/about')
            console.log(err)
        } else{
            console.log(found)
            res.render('memberShow', {profile:found})
        }
    })
})      

// edit profile
app.put("/profiles/:id",isLoggedIn, upload.single('image'), function(req, res){
    
   if(req.file){
        var image=  "files/"+req.file.filename;
        var firstname        = req.body.firstname;
    var surname        = req.body.surname;
    var description   = req.body.desc
    var state = req.body.state
    var DOB = req.body.DOB
    var gender= req.body.gender
    var location = req.body.address
    var ocupation = req.body.ocupation
    var newProfile = {
       firstname, surname, description, state, DOB, gender, location, image, ocupation
    }
     Profile.findByIdAndUpdate(req.params.id, newProfile, function(err, updated){
       if(err){
           res.redirect("/profiles");
       } else {
           //redirect somewhere(show page)
           res.redirect("/profiles");
       }
    });
   } else {
       Profile.findById(req.params.id, function(err, found){
           var image = found.image
           var firstname = req.body.firstname || found.firstname
           var surname = req.body.surname || found.surname
            var description   = req.body.desc || found.description
            var state = req.body.state || found.state
            var DOB = req.body.DOB || found.DOB
            var gender= req.body.gender || found.gender
            var location = req.body.address || found.location
            var ocupation = req.body.ocupation || found.ocupation
            var newProfile = {
               firstname, surname, description, state, DOB, gender, location, image, ocupation
    }
           Profile.findByIdAndUpdate(req.params.id, newProfile, function(err, updated){
       if(err){
           res.redirect("/profiles");
       } else {
           //redirect somewhere(show page)
           res.redirect("/profiles");
       }
    });
       })
   }
    
    //var image = getImage()
    //var image  = "files/"+req.file.filename;
    
   
});

// delete profile
app.delete("/profiles/:id",isLoggedIn, function(req, res){
   Profile.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/profiles");
      } else {
          res.redirect("/profiles");
      }
   });
})

//get edit project form
app.get('/projects/:id/edit',isLoggedIn, function(req, res) {
      Project.findById(req.params.id, function(err, found){
        res.render("editproject", {project: found});
    });
})
//edit project
app.put("/projects/:id",isLoggedIn, upload.single('image'), function(req, res){
    // find and update the correct campground
     var description   = req.body.description
    var title = req.body.title
    var image  = "files/"+req.file.filename;
    var newProject = {
        title : title, 
        description : description, 
        image : image
    }
    Project.findByIdAndUpdate(req.params.id, newProject, function(err, updated){
       if(err){
          // res.redirect("/profiles");
           console.log(err)
       } else {
           //redirect somewhere(show page)
           //res.redirect("/profiles");
           console.log(updated)
           console.log(newProject)
           res.redirect("/profiles");
       
       }
    });
});

//delete project
app.delete("/projects/:id",isLoggedIn, function(req, res){
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


const server =app.listen(process.env.PORT, function(){
    console.log("server started running")
    console.log(process.env.PORT)
})
app.get("/chat", function(req, res){
    res.render('chat')
})

const io = require("socket.io")(server)

//listen on every connection
io.on('connection', (socket) => {
	console.log('New user connected')

	//default username
	socket.username = "Anonymous"

    //listen on change_username
    socket.on('change_username', (data) => {
        socket.username = data.username
    })

    //listen on new_message
    socket.on('new_message', (data) => {
        //broadcast the new message
        io.sockets.emit('new_message', {message : data.message, username : socket.username});
    })

    //listen on typing
    socket.on('typing', (data) => {
    	socket.broadcast.emit('typing', {username : socket.username})
    })
})
