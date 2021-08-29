const express = require('express');
const mongoose = require('mongoose');
const { USER_NAME } = require('./');

// const username = process.env.USER_NAME;
// const password = process.env.USER_PASSWORD;
// const dbname = process.env.DB_NAME;
const username = 'mike-jr';
const password = 'test123';
const dbname = 'Mike-DB';

const PORT = process.env.PORT || 3000;

const blogRoutes = require('./routes/blogRoute');

//express app
const app = express();

//connect to MongoDB
const dbURI = `mongodb+srv://${username}:${password}@cluster0.qfxbp.mongodb.net/${dbname}`;

mongoose
	.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then((result) => {
		console.log('connected to DB');
		//listen for request
		app.listen(PORT);
	})
	.catch((err) => {
		console.log(err);
	});

//register view engine
app.set('view engine', 'ejs');

//middleware & static files
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
	res.redirect('/blogs');
});

app.get('/about', (req, res) => {
	res.render('about', { title: 'About' });
});

//blogs
app.use('/blogs', blogRoutes);

//404 page
app.use((req, res) => {
	res.status(404).render('404', { title: 'Error -Page not Found!' });
});
