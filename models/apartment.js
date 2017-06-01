let mongoose = require('mongoose');
let User = require('./user');
let Schema = mongoose.Schema;

let ApartmentSchema = new Schema({
	address: {
		type: String,
		required: true
	},
	city: {
		type: String,
		required: true
	},
	location: {
		type: Object,
		required: true
	},
	rent: {
		type: Number,
		required: true
	},
	rooms_number: {
		type: Number,
		required: true
	},
	square_footage: {
		type: Number,
		required: true
	},
	elevator: {
		type: Boolean,
		required: true
	},
	pets: {
		type: Boolean,
		required: true
	},
	parking: {
		type: Boolean,
		required: true
	},
	smoking: {
		type: Boolean,
		required: true
	},
	entrance_date: {
		type: Date,
		required: true
	},
	picture: {
		type: String,
		required: false
	},
	slug: {
		type: String,
		required: false,
		unique: true
	},
	owner_id: {
		type: String,
		required: true,
		ref: 'Users'
	},
	created_at: {
		type: Date
	}
});

ApartmentSchema.pre('save', function(next){
	let now = new Date();
	if (!this.created_at) {
		this.created_at = now;
	}
	next();
});

const Apartment = module.exports = mongoose.model('Apartment', ApartmentSchema);
