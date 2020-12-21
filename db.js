const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');


// users
// * our site requires authentication...
// * so users have a username and password
// * they can provide a first and/or last name
// * they can have an epithet (optional)
// * they can have an about (optional)
// * they have a creationDate
const User = new mongoose.Schema({
	first: String,
	last: String,
	epithet: String,
	about: String,
});
User.plugin(passportLocalMongoose);

// a comment in a blog post
// * includes the comment
// * comments will have a associated slug and url
// * comments will be timestamped
const Comment = new mongoose.Schema({
    user: String,
	slug: String,
	url: String,
	comment: {type: String, required: true},
    createdAt: Date,
},{
    _id: true
});

// a post
// * each post will have a related user
// * each post will have a header
// * each post can have a body
// * each post will have a slug
// * each post will have a userslug
// * a blog post can have 0 or more comments
// * each blog post will have a timestamp
const Post = new mongoose.Schema({
    user: String,
    header: {type: String, required: true},
    body: String,
	slug: String,
	userslug: String,
	headerslug: String,
    createdAt: Date,
});

// a testimonal/feedback
// * each feedback will have a	n optional name input
// * each feedback will have text representing the feedback
const Feedback = new mongoose.Schema({
	name: String,
	feedback: String,
});

//mongoose.model('User',User);
//mongoose.model('Blog',Blog);
mongoose.model('Comment',Comment);
mongoose.model('Post',Post);
mongoose.model('Feedback',Feedback);
mongoose.model('User',User);


//---auth----
// is the environment variable, NODE_ENV, set to PRODUCTION? 
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
    // if we're in PRODUCTION mode, then read the configration from a file
    // use blocking file io to do this...
    const fs = require('fs');
    const path = require('path');
    const fn = path.join(__dirname, 'config.json');
    const data = fs.readFileSync(fn);

    // our configuration file will be in json, so parse it and set the
    // conenction string appropriately!
    const conf = JSON.parse(data);
    dbconf = conf.dbconf;
} else {
    // if we're not in PRODUCTION mode, then use
    dbconf = 'mongodb://localhost/project';
}
//---auth----
mongoose.connect(dbconf,{useNewUrlParser: true, useUnifiedTopology: true});