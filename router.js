// Requirements
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const path = require('path');
const helper = require(__dirname + '/helper.js')

// Constants
const allowedOrigins = ['http://localhost:4200', 'https://getroomie-web.herokuapp.com', 'http://galta.co.il'];
const cdnUrl = "./uploads/";
const getLimit = 20;

// Database schemas
const ApartmentSchema = require('./models/apartment');
const UserSchema = require('./models/user');
const EventSchema = require('./models/event');
const NotificationSchema = require('./models/notification');
const NotificationTypeSchema = require('./models/notification_type');

// API router
module.exports = function(app, router) {

	// Requests headers
	app.use(function(req, res, next) {
		if (allowedOrigins.indexOf(req.headers.origin) > -1) {
			res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
			res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
		}
		next();
	});

	// Get all apartments
	router.get('/apartments', function(req, res) {
		ApartmentSchema.find().limit(getLimit).exec(function(err, apartments) {
			if (err) {
				res.json(err);
			}
			res.json(apartments);
		});
	});

	// Get latest apartments
	router.get('/apartments/latest/:_id', (req, res) => {
		ApartmentSchema.find({
			owner_id: {
				$ne: req.params._id
			}
		}).limit(getLimit).exec(function(err, apartments) {
			if (err) {
				res.json(err);
			}
			res.json(apartments);
		});
	});

	// Get watched apartments
	router.get('/apartments/watched/:_id', (req, res) => {
		UserSchema.findOne({
			_id: req.params._id
		}, (err, user) => {
			ApartmentSchema.find({
				_id: {
					$in: user.watched_apartments
				}
			}).limit(getLimit).exec(function(err, apartments) {
				res.json(apartments);
			});
		});
	});

	// Get apartments by owner-ID
	router.get('/apartments/by-owner/:_id', (req, res) => {
		ApartmentSchema.find({
			owner_id: req.params._id
		}).limit(getLimit).exec(function(err, apartments) {
			res.json(apartments);
		});
	});

	// Get apartment by ID
	router.get('/apartments/:_id', (req, res) => {
		let apartment_id;
		try {
			apartment_id = mongoose.Types.ObjectId(req.params._id);
			ApartmentSchema.findOne({
				_id: req.params._id
			}).exec(function(err, apartment) {
				if (err) {
					throw err;
				}
				res.json(apartment);
			});
		} catch (err) {
			res.json(null);
		}
	});

	// Get apartments by query
	router.get('/apartments/search/:query', (req, res) => {
		ApartmentSchema.find(({
			address: {
				'$regex': req.params.query,
				'$options': 'i'
			}
		})).limit(getLimit).exec(function(err, apartments) {
			res.json(apartments);
		});
	});

	// Publish a new apartment
	router.post('/apartments', function(req, res) {
		ApartmentSchema.create(req.body.apartment, function(err, result) {
			if (err) {
				res.json({
					success: false,
					error: err
				});
			} else {
				res.json({
					success: true,
					apartment_id: result._id
				});
			}
		});
	});

	// Update an existing apartment
	router.put('/apartments/:_id', (req, res) => {
		let id = req.params._id;
		let apartment = req.body;
		ApartmentSchema.findOneAndUpdate({
			_id: id
		}, apartment, {}, (err, apartment) => {
			if (err) {
				throw err;
			}
			res.json(apartment);
		});
	});

	// Update the watch-status of an apartment
	router.post('/apartments/toggle-watch-status', (req, res) => {
		let user_id = req.body.user_id;
		let apartment_id = req.body.apartment_id;
		let watched_apartments;
		UserSchema.findOne({
			_id: user_id
		}, function(err, result) {
			if (err) {
				throw err;
			}
			watched_apartments = result.watched_apartments;
			if (watched_apartments.indexOf(apartment_id) == -1) {
				watched_apartments.push(apartment_id);
			} else {
				watched_apartments.splice(watched_apartments.indexOf(apartment_id), 1);
			}
			UserSchema.update({
				_id: user_id
			}, {
				$set: {
					watched_apartments: watched_apartments
				}
			}, function() {
				res.json(watched_apartments);
			});
		});
	});

	// Login user
	router.post('/users/login/', function(req, res, next) {
		hash = bcrypt.hashSync();
		UserSchema.findOne({
			email: req.body.email.toLowerCase()
		}, function(err, result) {
			if (err) {
				throw err;
			}
			if (result != null) {
				if (bcrypt.compareSync(req.body.password, result.password)) {
					result.password = undefined;
					bcrypt.hash(result._id, null, null, function(err, hash) {
						if (err) {
							throw err;
						}
						let response = {
							success: true,
							user: result,
							token: hash
						};
						res.json(response);
					});
				} else {
					res.json({
						"success": false,
						error: "password"
					});
				}
			} else {
				res.json({
					"success": false,
					error: "user"
				});
			}
		});
	});

	// Get user by ID
	router.get('/users/:_id', function(req, res) {
		UserSchema.findOne({
			_id: req.params._id
		}, function(err, result) {
			if (err) {
				throw err;
			}
			res.json(result);
		});
	});

	// Get user by Auth0 ID
	router.post('/users/get_by_auth0_uid/', function(req, res) {
		UserSchema.findOne({
			auth0_uid: req.body.auth0_uid
		}, function(err, result) {
			if (err) {
				throw err;
			}
			res.json(result);
		});
	});

	// Sign up a new user
	router.post('/users/signup/', function(req, res) {
		let user = req.body.user;
		UserSchema.findOne({
			email: user.email
		}, function(err, result) {
			if (err) {
				throw err;
			}
			if (result == null) {
				UserSchema.create(user, function(err, result) {
					if (err) {
						re.json({
							success: false,
							error: err
						});
					} else {
						res.json({
							success: true,
							user_id: result
						});
					}
				});
			} else {
				res.json({
					success: false,
					error: "exist"
				});
			}
		});
	});

	// Get all events
	router.get('/events', function(req, res) {
		EventSchema.aggregate([{
			$lookup: {
				from: "apartments",
				localField: "apartment_id",
				foreignField: "_id",
				as: "apartment"
			},
			$limit: getLimit
		}], function(err, result) {
			if (err) {
				throw err;
			}
			res.json(result);
		});
	});

	// Get event by ID
	router.get('/events/:_id', function(req, res) {
		let apartment_id;
		try {
			apartment_id = mongoose.Types.ObjectId(req.params._id);
			EventSchema.aggregate([{
					$lookup: {
						from: "apartments",
						localField: "apartment_id",
						foreignField: "_id",
						as: "apartment"
					}
				},
				{
					$match: {
						"_id": apartment_id
					}
				},
				{
					$limit: getLimit
				}
			], function(err, result) {
				if (err) {
					throw err;
				}
				res.json(result);
			});
		} catch (err) {
			res.json(null);
		}
	});

	// Get my events
	router.get('/events/by-owner/:_id', function(req, res) {
		let my_apartments = [];
		ApartmentSchema.find({
			owner_id: req.params._id
		}, (err, apartments) => {
			for (let i = 0; i < apartments.length; i++) {
				my_apartments.push(apartments[i]._id);
			}
			EventSchema.aggregate([{
					$lookup: {
						from: "apartments",
						localField: "apartment_id",
						foreignField: "_id",
						as: "apartment"
					}
				},
				{
					$match: {
						"apartment_id": {
							$in: my_apartments
						}
					}
				},
				{
					$limit: getLimit
				}
			], function(err, result) {
				if (err) {
					throw err;
				}
				res.json(result);
			});
		});
	});

	// Get waiting subscribers for event
	router.get('/events/waiting-by-event/:event_id', function(req, res) {
		let eventId = req.params.event_id;
		EventSchema.findOne({
			_id: eventId
		}, (err, result) => {
			if (err) {
				res.json(err);
			}
			UserSchema.find({
				_id: {
					$in: result.waiting_subscribers
				}
			}).limit(getLimit).exec(function(err, result) {
				if (err) {
					res.json(err);
				}
				res.json({
					"event_id": eventId,
					"waiting_subscribers": result
				});
			});
		});
	});

	// Get waiting subscribers for all user's events
	router.get('/events/waiting-by-user/:user_id', function(req, res) {
		let my_apartments = [];
		ApartmentSchema.find({
			owner_id: req.params.user_id
		}).limit(getLimit).exec(function(err, apartments) {
			for (let i = 0; i < apartments.length; i++) {
				my_apartments.push(apartments[i]._id);
			}
			EventSchema.aggregate([{
					$lookup: {
						from: "apartments",
						localField: "apartment_id",
						foreignField: "_id",
						as: "apartment"
					}
				},
				{
					$match: {
						"apartment_id": {
							$in: my_apartments
						}
					}
				},
				{
					$limit: getLimit
				}
			], function(err, result) {
				if (err) {
					throw err;
				}
				res.json(result);
			});
		});
	});

	// Get subscribed-to events
	router.get('/events/subscribed-to-events/:user_id', function(req, res) {
		let user_id = req.params.user_id;
		EventSchema.aggregate([{
				$lookup: {
					from: "apartments",
					localField: "apartment_id",
					foreignField: "_id",
					as: "apartment"
				}
			},
			{
				$match: {
					user_id: {
						$in: subscribers
					}
				}
			},
			{
				$limit: getLimit
			}
		], function(err, result) {
			if (err) {
				throw err;
			}
			res.json(result);
		});
	});

	// Get events for a specific apartment
	router.get('/events/by-apartment/:id', function(req, res) {
		let apartment_id;
		try {
			apartment_id = mongoose.Types.ObjectId(req.params.id);
			EventSchema.find({
				apartment_id: apartment_id
			}, function(err, result) {
				if (err) {
					throw err;
				}
				res.json(result);
			});
		} catch (err) {
			res.json(null);
		}
	});

	// Update the subscribe-status of an apartment
	router.put('/events/toggle-subscribe-status', (req, res) => {
		let user_id = req.body.user_id;
		let event_id = req.body.event_id;
		let approved_subscribers;
		let waiting_subscribers;
		EventSchema.findOne({
			_id: event_id
		}, function(err, result) {
			if (err) {
				throw err;
			}
			approved_subscribers = result.approved_subscribers;
			waiting_subscribers = result.waiting_subscribers;
			if (approved_subscribers.indexOf(user_id) != -1) {
				approved_subscribers.splice(subscribers.indexOf(user_id), 1);
				EventSchema.update({
					_id: event_id
				}, {
					$set: {
						approved_subscribers: approved_subscribers
					}
				}, function() {
					res.json(true);
				});
			} else if (waiting_subscribers.indexOf(user_id) != -1) {
				waiting_subscribers.splice(waiting_subscribers.indexOf(user_id), 1);
				EventSchema.update({
					_id: event_id
				}, {
					$set: {
						waiting_subscribers: waiting_subscribers
					}
				}, function() {
					res.json(true);
				});
			} else {
				if (result.approved_subscribers.length < result.max_subscribers) {
					waiting_subscribers.push(user_id);
					EventSchema.update({
						_id: event_id
					}, {
						$set: {
							waiting_subscribers: waiting_subscribers
						}
					}, function() {
						res.json(true);
					});
				} else {
					res.json(false);
				}
			}
		});
	});

	// Approve a user for an event
	router.put('/events/approve-subscriber', function(req, res) {
		let user_id = req.body.user_id;
		let event_id = req.body.event_id;
		let waiting_subscribers;
		let approved_subscribers;
		EventSchema.findOne({
			_id: event_id
		}, function(err, result) {
			if (err) {
				throw err;
			}
			waiting_subscribers = result.waiting_subscribers;
			approved_subscribers = result.approved_subscribers;
			if (approved_subscribers.length < result.max_subscribers) {
				waiting_subscribers.splice(waiting_subscribers.indexOf(user_id), 1);
				approved_subscribers.push(user_id);
				EventSchema.update({
					_id: event_id
				}, {
					$set: {
						waiting_subscribers: waiting_subscribers,
						approved_subscribers: approved_subscribers
					}
				}, function() {
					res.json(true);
				});
			} else {
				res.json(false);
			}
		});
	});

	// Hide a user from an event
	router.put('/events/hide-subscriber', function(req, res) {
		let user_id = req.body.user_id;
		let event_id = req.body.event_id;
		let waiting_subscribers;
		let hidden_subscribers;
		EventSchema.findOne({
			_id: event_id
		}, function(err, result) {
			if (err) {
				throw err;
			}
			waiting_subscribers = result.waiting_subscribers;
			hidden_subscribers = result.hidden_subscribers;
			waiting_subscribers.splice(waiting_subscribers.indexOf(user_id), 1);
			hidden_subscribers.push(user_id);
			EventSchema.update({
				_id: event_id
			}, {
				$set: {
					waiting_subscribers: waiting_subscribers,
					hidden_subscribers: hidden_subscribers
				}
			}, function() {
				res.json(true);
			});
		});
	});

	// Open a new event
	router.post('/events', function(req, res) {
		EventSchema.create(req.body.event, (err, response) => {
			if (err) {
				throw err;
			}
			res.json(response);
		});
	});

	// Get notifications for user-id
	router.get('/notifications/:user_id', function(req, res) {
		let user_id;
		try {
			user_id = mongoose.Types.ObjectId(req.params.user_id);
			NotificationSchema.aggregate([{
					$lookup: {
						from: "notification_types",
						localField: "type",
						foreignField: "type",
						as: "info"
					}
				},
				{
					$match: {
						"user_id": user_id
					}
				}
			], function(err, result) {
				if (err) {
					throw err;
				}
				res.json(result);
			});
		} catch (err) {
			res.json(null);
		}
	});

	// Return the router
	return router;

}
