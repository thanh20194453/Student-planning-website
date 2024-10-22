const path = require('path');
const express = require('express');
const session = require('express-session');
const mysql = require('mysql');

const port = 8000;
const server = express();
const db = mysql.createConnection({
    host: 'localhost',
    user: 'newuser',
    password: '',
    database: 'thesis'
});

server.use(session({
    secret: 'my server',
    resave: true,
    saveUninitialized: true
}));
server.use(express.json());
server.use(express.urlencoded({extended: true}));
server.use(express.static(path.join(__dirname, '/css')));

// Nagivation
server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/html/login.html'));
});

server.get('/home', (req, res) => {
    if (req.session.login) {
	if (req.session.role === 'TEACHER') res.sendFile(path.join(__dirname + '/html/teacher-homepage.html'));
        if (req.session.role === 'STUDENT') res.sendFile(path.join(__dirname + '/html/student-homepage.html'));
        if (req.session.role === 'ADMIN') res.sendFile(path.join(__dirname + '/html/admin-semester.html'));
    } else {
        res.redirect("/");
    }
});

server.get('/admin/account', (req, res) => {
    if (req.session.login) {
	if (req.session.role === 'ADMIN') res.sendFile(path.join(__dirname + '/html/admin-account.html'));
    } else {
        res.redirect("/");
    }
});

server.get('/admin/course', (req, res) => {
    if (req.session.login) {
	if (req.session.role === 'ADMIN') res.sendFile(path.join(__dirname + '/html/admin-course.html'));
    } else {
        res.redirect("/");
    }
});

server.get('/admin/course-requirement', (req, res) => {
    if (req.session.login) {
	if (req.session.role === 'ADMIN') res.sendFile(path.join(__dirname + '/html/admin-course-requirement.html'));
    } else {
        res.redirect("/");
    }
});

server.get('/admin/class', (req, res) => {
    if (req.session.login) {
	if (req.session.role === 'ADMIN') res.sendFile(path.join(__dirname + '/html/admin-class.html'));
    } else {
        res.redirect("/");
    }
});

server.get('/admin/registration', (req, res) => {
    if (req.session.login) {
	if (req.session.role === 'ADMIN') res.sendFile(path.join(__dirname + '/html/admin-registration.html'));
    } else {
        res.redirect("/");
    }
});

server.get('/admin/semester-class', (req, res) => {
    if (req.session.login) {
	if (req.session.role === 'ADMIN') res.sendFile(path.join(__dirname + '/html/admin-semester-class.html'));
    } else {
        res.redirect("/");
    }
});

server.get('/teacher/midterm', (req, res) => {
    if (req.session.login) {
	if (req.session.role === 'TEACHER') res.sendFile(path.join(__dirname + '/html/teacher-midterm.html'));
    } else {
        res.redirect("/");
    }
});

server.get('/teacher/final', (req, res) => {
    if (req.session.login) {
	if (req.session.role === 'TEACHER') res.sendFile(path.join(__dirname + '/html/teacher-final.html'));
    } else {
        res.redirect("/");
    }
});

server.get('/student/register/course', (req, res) => {
    if (req.session.login) {
	if (req.session.role === 'STUDENT') res.sendFile(path.join(__dirname + '/html/student-register-course.html'));
    } else {
        res.redirect("/");
    }
});

server.get('/student/register/class', (req, res) => {
    if (req.session.login) {
	if (req.session.role === 'STUDENT') res.sendFile(path.join(__dirname + '/html/student-register-class.html'));
    } else {
        res.redirect("/");
    }
});

server.get('/student/registered', (req, res) => {
    if (req.session.login) {
	if (req.session.role === 'STUDENT') res.sendFile(path.join(__dirname + '/html/student-registered.html'));
    } else {
        res.redirect("/");
    }
});

server.get('/student/predict', (req, res) => {
    if (req.session.login) {
	if (req.session.role === 'STUDENT') res.sendFile(path.join(__dirname + '/html/student-predict-CPA.html'));
    } else {
        res.redirect("/");
    }
});
// Authentication
server.post('/auth', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    db.query('SELECT * FROM Account WHERE username = ? AND password = ?', [username, password], (db_err, db_res, fields) => {
	if (db_res.length > 0) {
	    req.session.login = true;
	    req.session.username = db_res[0].username;
            req.session.role = db_res[0].role;
            req.session.user_id = db_res[0].id;
            console.log(`Account ${username} with id ${req.session.user_id} logged in as ${req.session.role}`);
            if (req.session.role === 'STUDENT') {
                db.query('SELECT StudentClass.class_id FROM StudentClass JOIN Class ON StudentClass.student_id = ? AND StudentClass.class_id = Class.class_id', [req.session.user_id], (db_err_1, db_res_1, fields_1) => {
                    if (db_res_1.length > 0) {
                        req.session.class_id = db_res_1[0].class_id;
                    } else {
                        console.log(`No student found for account ${username}`);
                    }
                    res.redirect("/home");
                });
            } else {
                res.redirect("/home");
            }
	} else {
	    // res.send('Account does not exist/Wrong password');
            res.redirect("/");
	    res.end();
	}
    });
});

server.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.redirect('/');
    });
});

// Add controller modules
require('./js/admin-controller.js')(server, db);
require('./js/student-controller.js')(server, db);
require('./js/teacher-controller.js')(server, db);

// Start server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
