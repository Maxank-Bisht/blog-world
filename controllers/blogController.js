const Blog = require('../models/blogs');
const { getCurrentUser } = require('../middleware/authMiddleware');

const blog_index = (req, res) => {
	Blog.find()
		.sort({ createdAt: -1 })
		.then((result) => {
			res.render('blogs/index', {
				title: 'All Blogs',
				heading: 'All Blogs',
				blogs: result,
				img_url: '/assets/img/home-bg.jpg',
			});
		})
		.catch((err) => console.log(err));
};

const blog_details = (req, res) => {
	const id = req.params.id;
	Blog.findById(id)
		.then((result) => {
			res.render('blogs/details', {
				blog: result,
				title: 'Blog Details',
				img_url: '/assets/img/singleBlog.jpg',
				heading: result.title,
			});
		})
		.catch((err) =>
			res.status(404).render('404', {
				title: 'Blog Not Found!!',
				heading: 'Page Not Found!',
				img_url: '/assets/img/post-sample-image.jpg',
			})
		);
};

const blog_create_get = (req, res) => {
	res.render('blogs/create', { title: 'Create a New Blog' });
};

const blog_create_post = (req, res) => {
	getCurrentUser(req, res)
		.then((currentUser) => {
			if (currentUser === null) {
				res.redirect('/login');
			} else {
				let blog = new Blog(req.body);
				blog.userId = currentUser._id;
				blog.userName = currentUser.username;
				blog.save()
					.then((result) => res.redirect('/blogs'))
					.catch((err) => {
						console.log(err);
						return;
					});
			}
		})
		.catch((err) => {
			console.log(err);
			return;
		});
};

const blog_delete = (req, res) => {
	const id = req.params.id;
	Blog.findByIdAndDelete(id)
		.then((result) => {
			res.json({ redirect: '/blogs' });
		})
		.catch((err) => console.log(err));
};

module.exports = {
	blog_index,
	blog_details,
	blog_create_get,
	blog_create_post,
	blog_delete,
};
