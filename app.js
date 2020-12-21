//requires
require('./db');
require('./auth');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
//----

//----
const slug = require('slug'); //for creating proper urls
//----
const mongoose = require('mongoose');
//user, blog, comment, post
const Comment = mongoose.model('Comment');
const Post = mongoose.model('Post');
const Feedback = mongoose.model('Feedback');
//----
//passport related plugin
const passport = require('passport');

//----
const app = express();


// enable sessions
const session = require('express-session');
const sessionOptions = {
    secret: 'secret cookie thang (store this elsewhere!)',
    resave: true,
  	saveUninitialized: true
};
app.use(session(sessionOptions));

//-----custom middleware-----
const logger = (req,res,next)=>{
    console.log('-------------');
    console.log("Method:",req.method);
    console.log("Path:",req.path);
    console.log("Query:",JSON.stringify(req.query));
    next();
};
//app.use(logger);

//---------------------------
function getLastTen(arr){
	const toSend = [];
	let i=arr.length-1;
	while(i>=0&&i>=arr.length-10){
		toSend.push(arr[i]);
		i--;
	}
	return toSend;
}
function getBlogFromUrl(url){
	const elems = url.split('/').reverse();
	const ret = elems[2]+'/'+elems[1]+'/'+elems[0];
	return ret;
}
//---------------------------
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// body parser setup
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files
app.use(express.static(path.join(__dirname, 'public')));
//---------------------------
app.use(passport.initialize());
app.use(passport.session());
//drop req.user to every hbs template
app.use(function(req, res, next){
	res.locals.user = req.user;
	next();
});
//-------
app.use('/',require('./routes'));
//-----------ROUTES------------
app.get('/', (req, res) => {
    res.redirect('/home');
});

app.get('/home', (req, res)=>{
	Post.find(function(err,posts){
		Comment.find(function(err,comments){
			const toSend = getLastTen(posts);
			const comms = getLastTen(comments);
			res.render('index',{posts:toSend,comments:comms});
			
		})
    });
});

app.post('/home', (req,res)=>{
    const tick = new Date();
    const user = req.body.name;
    const header = req.body.header;
    const body = req.body.body;
    const date = tick.toLocaleString();
    const toInsert = {
        user: user,
        header: header,
        body: body,
		slug: 'blog/'+slug(user)+'/'+slug(header),
		userslug: slug(user),
		headerslug: slug(header),
        createdAt: date,
    }
    if(user===''){
        toInsert['user']="anonymous";
    }
    new Post(toInsert).save(function(){
       res.redirect('/home'); 
    });
});

app.get('/search',(req,res)=>{
	const q = req.query.q;
	Post.find(function(err,posts){
		if(q){
			posts = posts.filter(function(p){
				const hasUser = p.user.includes(q);
				const hasHeader = p.header.includes(q);
				return hasUser||hasHeader;
			});
		}
		
		const toSend=posts;
		
		res.render('search',{posts:posts});
	});
});

app.get('/blog', (req,res)=>{
	res.redirect('/home');
});

app.get('/blog/*/*',(req,res)=>{
	const url = req.originalUrl.split('/');
	url.splice(0,2);
	Post.find({userslug:url[0],headerslug:url[1]},(err,p)=>{
		const q = p[0].slug;
		Comment.find({slug:q},(err,comms)=>{
			comms = getLastTen(comms);
			res.render('blog',{post:p[0], comments:comms});
		});
	});
});

app.post('/blog/*/*',(req,res)=>{
	const url=req.get('referer');
	const slug = getBlogFromUrl(url);
	const comment = req.body.comm;
	
	const toInsert={
		user: req.body.user,
		slug: slug,
		url: url,
		comment: comment,
		createdAt: new Date(),
	};
	
	new Comment(toInsert).save(function(){
		res.redirect(req.get('referer'));
	});
});

app.get('/about', (req,res)=>{
    res.render('about');
});

app.get('/contact-us', (req,res)=>{
	Feedback.find(function(err,feedbacks){
		const toSend = getLastTen(feedbacks);
        res.render('contact',{feedbacks:toSend});
    });
});

app.post('/contact-us', (req,res)=>{
	const name = req.body.name;
	const data = req.body.data;

	const toInsert = {
		name: name,
		feedback: data,
	};
	if(name===''){
		toInsert['name'] = 'anonymous';
	}
	
	new Feedback(toInsert).save(function(){
       res.redirect('/contact-us'); 
    });
});

//from passport-local-mongoose
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
//--------------------------------------

//app.listen(29061);
app.listen(process.env.PORT || 3000);
