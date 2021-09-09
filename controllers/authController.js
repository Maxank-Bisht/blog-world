require('dotenv').config();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const jwt_secret = process.env.JWT_SECRET;

//error handler
const handleErrors = (err) => {
	let errors = { username: '', email: '', password: '' };
	//incorrect email
	if (err.message === 'Incorrect Email') {
		errors.email = 'This email is not register.';
	}
	//incorrect email
	if (err.message === 'Incorrect Password') {
		errors.password = 'The password is incorrect';
	}
	if (err.message === 'user exist') {
		errors.username = 'Username exist.. try something else';
	}
	if (err.message === 'Email not sent') {
		errors.email = 'This email does not exists!';
	}
	if (err.message === 'Email is not verified') {
		errors.email = 'Please verify you email';
	}

	if (err.code === 11000) {
		//duplicate email
		errors.email = 'This email is already registered';
		return errors;
	}

	//validation errors
	if (err.message.includes('user validation failed')) {
		Object.values(err.errors).forEach(({ properties }) => {
			errors[properties.path] = properties.message;
		});
	}
	return errors;
};

const maxAge = 1 * 24 * 60 * 60;
//creating web tokens
const createToken = (id) => {
	return jwt.sign({ id }, jwt_secret, {
		expiresIn: maxAge,
	});
};

module.exports.signup_get = (req, res) => {
	if (req.cookies.jwt) {
		const token = req.cookies.jwt;
		if (token) {
			jwt.verify(token, jwt_secret, (err, decodedToken) => {
				if (err) {
					conole.log(err.message);
					res.redirect('/signup');
				} else {
					res.redirect('/');
				}
			});
		}
	}
	res.render('signup', { title: 'Sign Up' });
};
module.exports.login_get = (req, res) => {
	if (req.cookies.jwt) {
		const token = req.cookies.jwt;
		if (token) {
			jwt.verify(token, jwt_secret, (err, decodedToken) => {
				if (err) {
					conole.log(err.message);
					res.redirect('/login');
				} else {
					res.redirect('/');
				}
			});
		}
	}
	res.render('login', { title: 'Login' });
};
module.exports.signup_post = async (req, res) => {
	const { username, email, password } = req.body;
	try {
		const usernameExist = await User.findOne({ username: username });
		if (usernameExist) {
			throw Error('user exist');
		} else {
			const user = await User.create({ username, email, password, verify: false });
			const token = createToken(user._id);
			User.verifyEmail(req, token, email)
				.then((info) => {
					if (info) {
						res.status(201).json({ userId: user._id });
					} else {
						throw new Error('Email not sent');
					}
				})
				.catch((err) => {
					console.log(err);
					return;
				});
		}
	} catch (error) {
		console.log(error.message);
		const errors = handleErrors(error);
		res.status(400).json({ errors });
	}
};
module.exports.login_post = async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await User.login(email, password);
		const token = createToken(user._id);
		if (user.verify) {
			res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
			res.status(200).json({ user: user._id });
		} else {
			throw Error('Email is not verified');
		}
	} catch (err) {
		console.log(err.message);
		const errors = handleErrors(err);
		res.status(400).json({ errors });
	}
};

module.exports.logout_get = (req, res) => {
	res.cookie('jwt', '', { maxAge: 1 });
	res.redirect('/');
};

module.exports.confirmation_get = (req, res) => {
	res.render('confirmation', { title: 'Verification' });
};
