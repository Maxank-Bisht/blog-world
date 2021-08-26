const http = require('http');
const fs = require('fs');
const _ = require('lodash');

const server = http.createServer((req, res) => {
	//set respons header
	res.setHeader('Content-Type', 'text/html');

	let path = './views/';

	switch (req.url) {
		case '/':
			path += 'index.html';
			break;
		case '/about':
			path += 'about.html';
			break;
		default:
			path += '404.html';
			break;
	}
	//send an html file
	fs.readFile(path, (err, data) => {
		if (err) {
			console.log(err);
			res.end();
		} else {
			res.write(data);
			res.end();
		}
	});
});

server.listen(3000, 'localhost', () => {
	console.log('Listening to request in port 3000');
});
