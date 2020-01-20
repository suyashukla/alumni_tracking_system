var express     =   require("express"),
    app         =   express(),
    bodyParser  =   require("body-parser"),
	mongoose    =   require("mongoose"),
	passport	=	require("passport"),
	LocalStrategy=	require("passport-local"),
	Event		=	require("./models/events"),
	Comment		=	require("./models/comment"),
	User		=	require("./models/user"),
	seedDB		=	require("./seeds");



mongoose.connect("mongodb://localhost/sih_v4", { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
seedDB();

//PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "This is secret",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser	=	req.user;
	next();
});


//=====================
//ROUTES
//=====================

//Home Page
app.get("/", function(req, res){
    res.render("home");
});

//Login Page
app.get("/login", function(req, res){
    res.render("login")
});

//alumni Login Page
app.get("/alumni", function(req, res){
    res.render("alumni")
});

// //Admin Login Page
// app.get("/admin", function(req, res){
//     res.render("admin")
// });

//Dashboard Route
app.get("/wall", isLoggedIn,function(req, res){
    Event.find({}, function(err, allEvents){
		if(err){
			console.log(err);
		}else{
            res.render("wall",{events:allEvents});
        }
    });
});

//CREATE - add new event to DB
app.post("/wall",isLoggedIn, function(req, res){
	//get data from form and add to events array
    var name    =   req.body.nameOfEvent;
    var date    =   req.body.dateOfEvent;
    var desc	=	req.body.description;
	var newEvent={name: name, date: date, description: desc}
	//Create a new event and save to DB
	Event.create(newEvent, function(err, newlyCreate){
		if(err){
			console.log(err);
		}else{
			//redirect back to wall page
			res.redirect("/wall");
		}
    });
});

//New- to show form to create new event
app.get("/wall/new", isLoggedIn, function(req, res){
    res.render("events/new");
});

//SHOW - show more info about one event
app.get("/wall/:id", isLoggedIn, function(req, res){
	//find the event with provided ID
	Event.findById(req.params.id).populate("comments").exec(function(err, foundEvent){
		if(err){
			console.log(err);
		}else{
				console.log(foundEvent);
				//render show template with that event
				res.render("events/show", {event: foundEvent});
		}
	});
});

// ========================================
// COMMENTS ROUTE
// ========================================

app.get("/wall/:id/comments/new", isLoggedIn,function(req, res){
	Event.findById(req.params.id, function(err, event){
		if(err){
			console.log(err);
		}else{
			res.render("comments/new", {event: event});
		}
	});
	
});

app.post("/wall/:id/comments", isLoggedIn,function(req, res){
	//lookup event using ID
	Event.findById(req.params.id, function(err, event){
		if(err){
			console.log(err);
			res.redirect("/wall");
		}else{
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					console.log(err)
				}else{
					event.comments.push(comment);
					event.save();
					res.redirect("/wall/"+event._id);
				}
			});
		}
	});
});

//==========================
// AUTH ROUTES
//==========================

//--------------------------
//Admin Logic
//--------------------------

//show register form
app.get("/admin/register", function(req, res){
	res.render("admin/register");
});
//handle sign up logic
app.post("/admin/register", function(req, res){
	var newUser	=	new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err);
			return res.render("admin/register")
		}
		passport.authenticate("local")(req, res, function(){
			res.redirect("/wall");
		});
	});
});
//show login form
app.get("/admin/login", function(req, res){
	res.render("admin/login");
});
//handling login logic
app.post("/admin/login", passport.authenticate("local",
	{
		successRedirect: "/wall",
		failureRedirect: "/login"
	}),function(req, res){
});

//---------------------------------------------------------------------------

//--------------------------
//Alumni Logic
//--------------------------

//show register form
app.get("/alumni/register", function(req, res){
	res.render("alumni/register");
});
//handle sign up logic
app.post("/alumni/register", function(req, res){
	var newUser	=	new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err);
			return res.render("alumni/register")
		}
		passport.authenticate("local")(req, res, function(){
			res.redirect("/wall");
		});
	});
});
//show login form
app.get("/alumni/login", function(req, res){
	res.render("admin/login");
});
//handling login logic
app.post("/alumni/login", passport.authenticate("local",
	{
		successRedirect: "/wall",
		failureRedirect: "/login"
	}),function(req, res){
});

//----------------------------------------------------------------------------

//logout route
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/");
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}


app.listen(4000, function(){
	console.log("Server Has Started!");
});
