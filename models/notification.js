let mongoose = require('mongoose');
let NotificationType = require('./notification_type');
let Schema = mongoose.Schema;

let NotificationSchema = new Schema({
    user_id: {
		type: Schema.Types.ObjectId,
        required: true
	},
    notification_type_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'NotificationType'
    },
	read: {
		type: Boolean,
        required: true
	},
	created_at: {
		type: Date,
        required: true
	},
});

NotificationSchema.pre('save', function(next){
	let now = new Date();
    if (!this.created_at) {
		this.created_at = now;
	}
    this.read = false;
	next();
});

const Notification = module.exports = mongoose.model('Notification', NotificationSchema);
