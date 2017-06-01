let mongoose = require('mongoose');
let Aparment = require('./apartment');
let Schema = mongoose.Schema;

let EventSchema = new Schema({
	apartment_id: {
		type: Schema.Types.ObjectId,
        required: true,
		ref: 'Apartment'
	},
	start_time: {
		type: Date,
        required: true
	},
	end_time: {
		type: Date,
        required: true
	},
	max_subscribers: {
		type: Number
	},
	waiting_subscribers: {
		type: Array,
        required: true
	},
	approved_subscribers: {
		type: Array,
        required: true
	},
	hidden_subscribers: {
		type: Array,
        required: true
	},
	created_at: {
		type: Date,
        required: true
	}
});

EventSchema.pre('save', function(next){
	let now = new Date();
	this.waiting_subscribers = [];
	this.approved_subscribers = [];
	this.hidden_subscribers = [];
	if (!this.created_at) {
		this.created_at = now;
	}
	next();
});

const Event = module.exports = mongoose.model('Event', EventSchema);
