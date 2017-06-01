let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserSchema = new Schema({
	email: {
		type: String,
		required: true,
		lowercase: true,
		unique: true
	},
	first_name: {
		type: String
	},
	last_name: {
		type: String
	},
	birthday: {
		type: Date
	},
	gender: {
		type: String
	},
	picture: {
		type: String
	},
	watched_apartments: {
		type: Array
	},
	created_at: {
		type: Date,
		required: true
	},
	auth0_uid: {
		type: String,
		required: true,
		unique: true
	}
});

UserSchema.pre('create', function(next){
	let now = new Date();
	if(this.watched_apartments === null || this.watched_apartments === undefined){
		this.watched_apartments = [];
	}
	if (this.created_at === null || this.created_at === undefined) {
		this.created_at = now;
	}
	next();
});

module.exports = mongoose.model('User', UserSchema);
