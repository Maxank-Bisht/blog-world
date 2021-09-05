require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const blogRoutes = require('./routes/blogRoute');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');

const username = process.env.DATABASE_USERNAME;
const password = process.env.DATABASE_PASSWORD;
const dbname = process.env.DATABASE_NAME;
// const username = 'mike-jr';
// const password = 'test123';
// const dbname = 'Mike-DB';

const port = process.env.PORT || 3000;

//express app
const app = express();

//middleware & static files
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

//register view engine
app.set('view engine', 'ejs');

//connect to MongoDB
const dbURI = `mongodb+srv://${username}:${password}@cluster0.qfxbp.mongodb.net/${dbname}`;

mongoose
	.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
	.then((result) => {
		console.log('connected to DB');
		//listen for request
		app.listen(port);
	})
	.catch((err) => console.log(err));

//routes
app.get('*', checkUser);
app.get('/', (req, res) => res.redirect('/blogs'));
app.get('/about', (req, res) =>
	res.render('about', { title: 'About Us', heading: 'About Us', img_url: '/assets/img/about-bg.jpg' })
);

//blogs
app.use('/blogs', blogRoutes);
app.use(authRoutes);

//404 page
app.use((req, res) => {
	res.status(404).render('404', {
		title: 'Error - Page not Found!',
		heading: 'Page Not Found!',
		img_url: '/assets/img/post-sample-image.jpg',
	});
});
