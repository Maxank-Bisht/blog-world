require('dotenv').config();
const mongoose = require('mongoose');
const { isEmail, isAlphanumeric } = require('validator');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: [true, 'Please Enter A Username'],
		index: true,
		lowercase: true,
		validate: [isAlphanumeric, 'Username should only contain letter and numbers'],
	},
	email: {
		type: String,
		required: [true, 'Please Enter An Email'],
		index: true,
		lowercase: true,
		validate: [isEmail, 'Please Enter A Valid Email'],
	},
	password: {
		type: String,
		required: [true, 'Please enter a password'],
		minlength: [6, 'Minimun password length is 6 character'],
	},
	verify: {
		type: Boolean,
		required: false,
	},
});
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1, username: 1 }, { unique: true });

userSchema.pre('save', async function (next) {
	const salt = await bcrypt.genSalt();
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

//static method to login user
userSchema.statics.login = async function (email, password) {
	const user = await this.findOne({ email });
	if (user) {
		const auth = await bcrypt.compare(password, user.password);
		if (auth) {
			return user;
		}
		throw Error('Incorrect Password');
	}
	throw Error('Incorrect Email');
};

userSchema.statics.verifyEmail = async (token, email) => {
	const url = `http://localhost:3000/confirmation/${token}`;
	const transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: process.env.MY_EMAIL,
			pass: process.env.MY_PASSWORD,
		},
	});
	try {
		transporter.sendMail(
			{
				from: process.env.MY_EMAIL,
				to: `${email}`,
				subject: 'Verify your email for signing up at NodeBlogs',
				html: `
					<h2>Confirmation Email from NodeBlogs</h2>
					<p>You are receiving this email because your email address is used to sign-up at <strong>NodeBlogs</strong></p>
					<p>Please confirm verification by clicking on the link: <a href="${url}">Verify</a></p>
					<p>If you didn't tried to signup then simply ignore this mail.</p>`,
			},
			(err, response) => {
				if (err) {
					console.log(err);
				} else {
					console.log('mail sent');
				}
			}
		);
	} catch (err) {
		console.log('cannot send email');
		console.log(err);
	}
};

const User = mongoose.model('user', userSchema);

module.exports = User;
