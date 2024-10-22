module.exports = function(server, db) {
    server.post('/teacher/update/midterm', (req, res) => {
        let class_id = req.headers.class_id;
        if (req.session.login && req.session.role === 'TEACHER') {
            db.query('SELECT * FROM Semester', [], (db_err_, db_res_, fields_) => {
                let semester = db_res_[0].current_s;
                let status = db_res_[0].s_time;
                if (db_res_[0].s_time !== 'SEMESTER') {
                    res.send('The semester has not started yet');
                    res.end();
                    return;
                }
                for (let i = 0, row; row = req.body[i]; i += 1) {
                    if (!row[1]) row[1] = undefined;
                    db.query('UPDATE Enrolment SET midterm_score = ? WHERE student_id = ? AND class_id = ? AND semester = ?', [row[1], row[0], class_id, semester], (db_err, db_res, fields) => {
                    });
                }
                res.send('Updated');
                res.end();
            });
        }
    });

    server.post('/teacher/update/final', (req, res) => {
        let class_id = req.headers.class_id;
        if (req.session.login && req.session.role === 'TEACHER') {
            db.query('SELECT * FROM Semester', [], (db_err_, db_res_, fields_) => {
                let semester = db_res_[0].current_s;
                let status = db_res_[0].s_time;
                if (db_res_[0].s_time !== 'SEMESTER') {
                    res.send('The semester has not started yet');
                    res.end();
                    return;
                }
                for (let i = 0, row; row = req.body[i]; i += 1) {
                    if (!row[1]) row[1] = undefined;
                    db.query('UPDATE Enrolment SET final_score = ? WHERE student_id = ? AND class_id = ? AND semester = ?', [row[1], row[0], class_id, semester], (db_err, db_res, fields) => {
                    });
                }
                res.send('Updated');
                res.end();
            });
        }
    });

    server.get('/teacher/teaching', (req, res) => {
        if (req.session.login && req.session.role === 'TEACHER') {
	    db.query('SELECT CourseClass.class_id, Course.course_name, CourseClass.course_id, CourseClass.class_day, CourseClass.start_time, CourseClass.end_time FROM CourseClass JOIN (Course, Semester) ON (CourseClass.course_id = Course.course_id AND CourseClass.semester = Semester.current_s) WHERE CourseClass.teacher_id = ?', [req.session.user_id], (db_err, db_res, fields) => {
	        res.send(db_res);
	        res.end();
	    });
        }
    });

    server.get('/teacher/class/list', (req, res) => {
        let class_id = req.headers.class_id;
        if (req.session.login && req.session.role === 'TEACHER') {
            db.query('SELECT CONCAT(Account.last_name, \' \', Account.first_name) AS name, StudentClass.student_id, StudentClass.class_id, Enrolment.midterm_score, Enrolment.final_score, Course.progress_weight FROM Enrolment JOIN (Account, StudentClass, CourseClass, Course, Semester) ON (Enrolment.student_id = Account.id AND Account.id = StudentClass.student_id AND Enrolment.semester = Semester.current_s AND Enrolment.class_id = CourseClass.class_id AND Enrolment.semester = CourseClass.semester AND CourseClass.course_id = Course.course_id) WHERE CourseClass.teacher_id = ? AND Enrolment.class_id = ?', [req.session.user_id, class_id], (db_err, db_res, fields) => {
	        res.send(db_res);
	        res.end();
	    });
        }
    });
};
