require('dotenv').config();
const jwt = require('jsonwebtoken');
const jwt_secret = process.env.JWT_SECRET;
const User = require('../models/User');

const requireAuth = (req, res, next) => {
	const token = req.cookies.jwt;

	if (token) {
		jwt.verify(token, jwt_secret, (err, decodedToken) => {
			if (err) {
				conole.log(err.message);
				res.redirect('/login');
			} else {
				next();
			}
		});
	} else {
		res.redirect('/login');
	}
};

//check user
const checkUser = (req, res, next) => {
	const token = req.cookies.jwt;
	if (token) {
		jwt.verify(token, jwt_secret, async (err, decodedToken) => {
			if (err) {
				conole.log(err.message);
				res.locals.user = null;
				next();
			} else {
				const user = await User.findById(decodedToken.id);
				res.locals.user = user;
				next();
			}
		});
	} else {
		res.locals.user = null;
		next();
	}
};

//get current User details
const getCurrentUser = async (req, res) => {
	const token = req.cookies.jwt;
	if (token) {
		const result = jwt.verify(token, jwt_secret, async (err, decodedToken) => {
			if (err) {
				conole.log(err.message);
				return null;
			} else {
				const user = await User.findById(decodedToken.id);
				return user;
			}
		});
		return result;
	} else {
		console.log('No Token Found');
		return null;
	}
};

module.exports = { requireAuth, checkUser, getCurrentUser };
