let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let NotificationTypeSchema = new Schema({
    message: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    }
});

const NotificationType = module.exports = mongoose.model('NotificationTypeSchema', NotificationTypeSchema);
