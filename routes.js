const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

router.get('/login', (req,res)=>{
   res.render('login'); 
});

router.post('/login', (req,res,next)=>{
	passport.authenticate('local', function(err,user) {
		if(user) {
	  		req.logIn(user, function(err) {
				res.redirect('/');
			});
		} else {
	  		res.render('login', {message:'Your login or password is incorrect.'});
		}
	})(req, res, next);
});

router.get('/register', (req,res)=>{
   res.render('register');
});

router.post('/register', (req,res)=>{	
	User.register(new User({username:req.body.username,
							first: req.body.first,
							last: req.body.last,
							avatar: req.body.avatar,
							epithet: req.body.epithet,
							about: req.body.about,
						   }), 
		req.body.password, function(err, user){
		if (err) {
			res.render('register',{message:'The username already exists!'});
		} else {
			passport.authenticate('local')(req, res, function() {
				res.redirect('/');
			});
		}
	});	
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;