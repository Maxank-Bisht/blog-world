const mongoose = require('mongoose');
const { isEmail, isAlphanumeric } = require('validator');
const bcrypt = require('bcrypt');

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

const User = mongoose.model('user', userSchema);

module.exports = User;
