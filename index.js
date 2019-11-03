const Joi = require("joi"); // what is returned from this module is a class and we use Javascript convention Pascal case to name our classes

const express = require("express"); // require('express') returns a function

const app = express();

app.use(express.json()); // adding a piece of middleware and app.use allows us to use it in the request pipeline

const courses = [
	{ id: 1, name: "course1" },
	{ id: 2, name: "course2" },
	{ id: 3, name: "course3" }
];

// we want to implement a couple of endpoints that respond to an http request

// this is how we define a route
// specify a path or url, callback function which is also called
// a route handler
app.get("/", (req, res) => {
	res.send("Hello World!");
});

// define new routes by calling app.get
// with this structure as application grows, we can move routes to different files

// express gives our application a skeleton, a structure

app.get("/api/courses", (req, res) => {
	res.send(courses);
});

// specify port and pass a function that will be called when app starts listening on given port
// app.listen(3000, () => console.log("listening on port 3000"));

// when you deploy your app to a hosting environment, the port is dynamically assigned.  We cannot rely on 3000 being available.
// fix this by using an environment variable.

// an environment var is a var that is pat of env in which a process runs.  value is set outside of the application.

// PORT is an env var.

// so far we have had to stop the web server in the terminal
// start it agian, everytime we make a change

// we are going to install nodemon short for node monitor

// PORT -- attempt to read the value of environment port (if it exists) otherwise use 3000
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

// we can set environment vars on mac by using export
// at terminal $ export PORT=5000

// id is the paraemter, function is the route handler
app.get("/api/courses/:id", (req, res) => {
	// res.send(req.query);
	// write some logic to look for the course with the given id
	const course = courses.find(c => c.id === parseInt(req.params.id));
	if (!course) {
		// 404 by convention use 404 means object not found
		res.status(404).send("The course with the given ID was not found");
	}
	res.send(course); // we do have a course with given id
});

// express lets us use query string parameters for anything that is optional like sortBy=name
// ?sortBy=name
// query string params provide additional data to our backend services

// we route params provide essential or required values

app.post("/api/courses", (req, res) => {
	// a schema - defines the shape of our objects.  what properties do we have, what is the type of each prop, do we have an enum, do we have a string, do we have a number, what range should that number be

	const { error } = validateCourse(req.body);
	if (error) {
		res.status(400).send(error.details[0].message);
		return;
	}

	// route handler
	const course = {
		id: courses.length + 1,
		name: req.body.name // in order for this to work, we need to enable parsing of JSON objects in the body of the request.  By default, this feature is not enabled in Express.
	};
	courses.push(course);
	// By convention, when we post an object ot the server, when the server creates a new object or resource, we should return that new object in the body of the response.
	res.send(course);

	// we use the PUT method for updating resources
	app.put("/api/courses/:id", (req, res) => {
		// Look up the course
		// if not existing, return 404
		const course = courses.find(c => c.id === parseInt(req.params.id));
		if (!course) {
			// 404 by convention use 404 means object not found
			res.status(404).send("The course with the given ID was not found");
		}

		// Validate
		// If invalid, return 400 - Bad request

		const { error } = validateCourse(req.body);

		if (error) {
			// 400 Bad Request
			res.status(400).send(error.details[0].message);
			return; // return because we don't want to get to rest of the function
		}

		// Update course
		course.name = req.body.name;

		// Return the updated course
		res.send(course);
	});

	function validateCourse(course) {
		const schema = {
			name: Joi.string()
				.min(3)
				.required()
		};

		return Joi.validate(course, schema);
	}
}); // we use courses because going to post to the collection of courses
