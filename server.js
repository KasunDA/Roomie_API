// Requirements
let express = require('express');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let morgan = require('morgan');
let favicon = require('serve-favicon');
let helmet = require('helmet');

// Constants
const app = new express();
const port = process.env.PORT || 8080;
const router = express.Router();
const db = 'mongodb://roomiecuriel:zpvou3gwc5R@ds145128.mlab.com:45128/roomie_db';

// Morgan Middleware
app.use(morgan('dev'));

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// Connect to the database
mongoose.Promise = global.Promise;
mongoose.connect(db, function(err, res){
	if(err){
		console.log('Failed to connect to database');
	}else{
		console.log('Connected to database');
	}
});

// Favicon
app.use(favicon(__dirname + '/favicon.ico'));

// Helmet
app.use(helmet());

// Router
let apiRouter = require(__dirname + '/router.js')(app, router);
app.use(apiRouter);

// Initialization
app.listen(port, function(){
	console.log('Listening on port ' + port + '...');
});
