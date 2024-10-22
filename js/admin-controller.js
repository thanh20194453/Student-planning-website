module.exports = function(server, db) {
    server.get('/admin/get/semester', (req, res) => {
        if (req.session.login && req.session.role === 'ADMIN') {
            db.query('SELECT * FROM Semester', [], (db_err, db_res, fields) => {
                res.send(db_res);
                res.end();
            });
        }
    });

    server.get('/admin/get/accounts', (req, res) => {
        if (req.session.login && req.session.role === 'ADMIN') {
            db.query('SELECT * FROM Account', [], (db_err, db_res, fields) => {
                res.send(db_res);
                res.end();
            });
        }
    });

    server.get('/admin/get/class-list', (req, res) => {
        if (req.session.login && req.session.role === 'ADMIN') {
            req.session.addclassid=req.headers.class_id;
            db.query('SELECT * FROM Class', [], (db_err, db_res, fields) => {
                res.send(db_res);
                res.end();
            });
        }
    });

    server.get('/admin/get/course', (req, res) => {
        let course_id = req.headers.course_id;
        if (req.session.login && req.session.role === 'ADMIN') {
            db.query('SELECT * FROM Course WHERE course_id = ?', [course_id], (db_err, db_res, fields) => {
                res.send(db_res);
                res.end();
            });
        }
    });

    server.get('/admin/get/student', (req, res) => {
        let student_id = req.headers.student_id;
        if (req.session.login && req.session.role === 'ADMIN') {
            db.query('SELECT Account.*, StudentClass.class_id FROM Account JOIN StudentClass ON Account.id = StudentClass.student_id WHERE Account.id = ? AND Account.role = \'STUDENT\'', [student_id], (db_err, db_res, fields) => {
                res.send(db_res);
                res.end();
            });
        }
    });

    server.get('/admin/get/class-curriculum', (req, res) => {
        let class_id = req.headers.class_id;
        if (req.session.login && req.session.role === 'ADMIN') {
            db.query('SELECT Course.course_name, Course.course_id, Course.credit, Course.credit_HP, Curriculum.semester_dk, Curriculum.compulsory, Course.faculty FROM Curriculum JOIN Course ON Curriculum.course_id = Course.course_id WHERE Curriculum.class_id = ?', [class_id], (db_err, db_res, fields) => {
                res.send(db_res);
                res.end();
            });
        }
    });

    server.get('/admin/get/class-student', (req, res) => {
        let class_id = req.headers.class_id;
        if (req.session.login && req.session.role === 'ADMIN') {
            db.query('SELECT Account.first_name, Account.last_name, Account.id, Account.username, Account.gender FROM Account JOIN StudentClass ON Account.id = StudentClass.student_id WHERE StudentClass.class_id = ?', [class_id], (db_err, db_res, fields) => {
                res.send(db_res);
                res.end();
            });
        }
    });

    server.get('/admin/get/courses', (req, res) => {
        if (req.session.login && req.session.role === 'ADMIN') {
            db.query('SELECT * FROM Course', [], (db_err, db_res, fields) => {
                res.send(db_res);
                res.end();
            });
        }
    });

    server.get('/admin/get/course-requirement', (req, res) => {
        if (req.session.login && req.session.role === 'ADMIN') {
            db.query('SELECT * FROM CourseRequirement', [], (db_err, db_res, fields) => {
                res.send(db_res);
                res.end();
            });
        }
    });

    server.get('/admin/get/registration-courses', (req, res) => {
        if (req.session.login && req.session.role === 'ADMIN') {
            db.query('SELECT Course.*, COUNT(CourseRegistration.student_id) AS std_count FROM CourseRegistration JOIN (Course, Semester) ON (CourseRegistration.course_id = Course.course_id AND CourseRegistration.semester = Semester.current_s) GROUP BY CourseRegistration.course_id', [], (db_err, db_res, fields) => {
                res.send(db_res);
                res.end();
            });
        }
    });

    server.get('/admin/get/registration-classes', (req, res) => {
        if (req.session.login && req.session.role === 'ADMIN') {
            db.query('SELECT CourseClass.* FROM CourseClass JOIN Semester ON CourseClass.semester = Semester.current_s', [], (db_err, db_res, fields) => {
                res.send(db_res);
                res.end();
            });
        }
    });

    server.get('/admin/get/semester-class', (req, res) => {
        let class_id = req.headers.class_id;
        if (req.session.login && req.session.role === 'ADMIN') {
            db.query('SELECT CONCAT(Account.last_name, \' \', Account.first_name) AS name, Enrolment.student_id, StudentClass.class_id FROM Account JOIN (StudentClass, Enrolment, Semester) ON (Account.id = Enrolment.student_id AND StudentClass.student_id = Account.id AND Enrolment.student_id = Account.id AND Enrolment.semester = Semester.current_s) WHERE Enrolment.class_id = ?', [class_id], (db_err, db_res, fields) => {
                res.send(db_res);
                res.end();
            });
        }
    });

    server.post('/admin/add/class', (req, res) => {
        if (req.session.login && req.session.role === 'ADMIN') {
            db.query('INSERT INTO Class (class_id) VALUES ?', [req.body], (db_err, db_res, fields) => {
                req.session.addclassid=req.body[0][0];
                if (db_err) {
                    console.log(db_err);
                    console.log(db_res);
                    res.send('Fail');
                    res.end();
                } else {
                    res.send('Success');
                    res.end();
                }
            });
        }
    });

    server.post('/admin/update/accounts', (req, res) => {
        if (req.session.login && req.session.role === 'ADMIN') {
            db.query('SELECT id FROM Account', [], (db_err, db_res, fields) => {
                let s1 = new Set();
                let s2 = new Set();
                for (let i = 0, row; row = db_res[i]; i += 1) {
                    s1.add(row.id);
                }
                for (let i = 0, row; row = req.body[i]; i += 1) {
                    if (!s1.has(row[4])) {
                        db.query('INSERT INTO Account (username, password, first_name, last_name, id, gender, role) VALUES ?', [[row]]);
                    } else {
                        db.query('UPDATE Account SET password = ?, first_name = ?, last_name = ?, gender = ?, role = ? WHERE id = ?', [row[1], row[2], row[3], row[5], row[6], row[4]]);
                    }
                    s2.add(row[4]);
                }
                for (let i = 0, row; row = db_res[i]; i += 1) {
                    if (!s2.has(row.id)) {
                        db.query('DELETE FROM Account WHERE id = ?', [row.id]);
                    }
                }
                res.send('Updated account table');
                res.end();
            });
        }
    });

    server.post('/admin/update/semester', (req, res) => {
        if (req.session.login && req.session.role === 'ADMIN') {
            db.query('UPDATE Semester SET current_s = ?, s_time = ?', req.body, (db_err, db_res, fields) => {
                res.send('Updated');
                res.end();
            });
        }
    });

    server.post('/admin/update/courses', (req, res) => {
        if (req.session.login && req.session.role === 'ADMIN') {
            db.query('SELECT * FROM Course', [], (db_err, db_res, fields) => {
                let s = new Set();
                for (let i = 0, row; row = db_res[i]; i += 1) {
                    s.add(row.course_id);
                }
                for (let i = 0, row; row = req.body[i]; i += 1) {
                    if (s.has(row[0])) {/* nếu id trùng thì update */
                        db.query('UPDATE Course SET course_name = ?, credit = ?, credit_HP = ?, progress_weight = ?, faculty = ? WHERE course_id = ?', [row[1], row[2], row[3], row[4], row[5], row[0]], (db_err, db_res, fields) => {
                            if (db_err) {
                                console.log(db_err);
                                console.log(db_res);
                            }
                        });
                    } else {
                        db.query('INSERT INTO Course (course_id, course_name, credit, credit_HP, progress_weight, faculty) VALUES (?, ?, ?, ?, ?, ?)', row, (db_err, db_res, fields) => {
                            if (db_err) {
                                console.log(db_err);
                                console.log(db_res);
                            }
                        });
                    }
                }
                s = new Set();/* chức năng xóa */
                for (let i = 0, row; row = req.body[i]; i += 1) {
                    s.add(row[0]);
                }
                for (let i = 0, row; row = db_res[i]; i += 1) {
                    if (!s.has(row.course_id)) {
                        db.query('DELETE FROM Course WHERE course_id = ?', [row.course_id], (db_err, db_res, fields) => {
                            if (db_err) {
                                console.log(db_err);
                                console.log(db_res);
                            }
                        });
                    }
                }
            });
            res.send('Success');
            res.end();
        }
    });

    server.post('/admin/update/class-curriculum', (req, res) => {
        let class_id = req.session.addclassid;
        if (req.session.login && req.session.role === 'ADMIN') {
            db.query('SELECT course_id FROM Curriculum WHERE class_id = ?', [class_id], (db_err, db_res, fields) => {
                let s = new Set();
                for (let i = 0, row; row = db_res[i]; i += 1) {
                    s.add(row.course_id);
                }
                for (let i = 0, val; val = req.body[i]; i += 1) {
                    if (!s.has(val[0])) {
                        db.query('INSERT INTO Curriculum (class_id, course_id, semester_dk, compulsory) VALUES (?, ?, ?, ?)', [class_id, val[0],val[1],val[2]], (db_err1, db_res1, fields1) => {
                            if (db_err1) {
                                console.log(db_err1);
                                console.log(db_res1);
                            }
                        });
                    }
                }
                s = new Set();
                for (let i = 0, val; val = req.body[i]; i += 1) {
                    s.add(val[0]);
                }
                for (let i = 0, row; row = db_res[i]; i += 1) {
                    if (!s.has(row.course_id)) {
                        db.query('DELETE FROM Curriculum WHERE class_id = ? AND course_id = ?', [class_id, row.course_id], (db_err1, db_res1, fields1) => {
                            if (db_err1) {
                                console.log(db_err1);
                                console.log(db_res1);
                            }
                        });
                    }
                }
            });
            res.send('Updated');
            res.end();
        }
    });

    server.post('/admin/update/student-list', (req, res) => {
        let class_id = req.headers.class_id;
        if (req.session.login && req.session.role === 'ADMIN') {
            db.query('SELECT * FROM StudentClass WHERE class_id = ?', [class_id], (db_err, db_res, fields) => {
                let s1 = new Set();
                let s2 = new Set();
                for (let i = 0, row; row = db_res[i]; i += 1) {
                    s1.add(row.student_id);
                }
                for (let i = 0, val; val = req.body[i]; i += 1) {
                    if (s1.has(val)) {
                        db.query('UPDATE StudentClass SET class_id = ? WHERE student_id = ?', [class_id, val], (db_err1, db_res1, fields1) => {});
                    } else {
                        db.query('INSERT INTO StudentClass (class_id, student_id) VALUES ?', [[[class_id, val]]], (db_err1, db_res1, fields1) => {});
                    }
                    s2.add(val);
                }
                for (let i = 0, row; row = db_res[i]; i += 1) {
                    if (!s2.has(row.student_id)) {
                        db.query('DELETE FROM StudentClass WHERE student_id = ?', [row.student_id], (db_err1, db_res1, fields1) => {});
                    }
                }
                res.send('Updated');
                res.end();
            });
        }
    });

    server.post('/admin/update/class-info', (req, res) => {
        if (req.session.login && req.session.role === 'ADMIN') {
            db.query('UPDATE Class SET class_name = ?, teacher_id = ?,hp_coban = ?,hp_nghanh = ?  WHERE class_id = ?', [req.body[0], req.body[1],req.body[2],req.body[3], req.session.addclassid], (db_err, db_res, fields) => {
                if (db_err) {
                    res.send('Fail');
                    res.end();
                } else {
                    res.send('Success');
                    res.end();
                }
            });
        }
    });

    server.post('/admin/update/registration-classes', (req, res) => {
        if (req.session.login && req.session.role === 'ADMIN') {
            db.query('SELECT * FROM Semester', [], (sdb_err, sdb_res, sfields) => {
                let semester = sdb_res[0].current_s;
                let status = sdb_res[0].s_time;
                if (status !== 'CLASS') {
                    res.send('This is not the time for update class list');
                    res.end();
                    return;
                }
                db.query('SELECT * FROM Course', [], (db_err3, db_res3, fields3) => {
                    let listcourse = new Set();
                    let flag=0;
                    for (let i = 0, row; row = db_res3[i]; i += 1) {
                        listcourse.add(row.course_id);
                    }
                    for (let i = 0, row; row = req.body[i]; i += 1) {
                        if (!listcourse.has(row[1])){
                            flag=1;
                        }
                    }
                    if (flag==1){
                        res.send('Course id not exit');
                        res.end();
                    }else{
                        db.query('SELECT * FROM CourseClass WHERE semester = ?', [semester], (db_err, db_res, fields) => {
                            let s1 = new Set();
                            let s2 = new Set();
                            for (let i = 0, row; row = db_res[i]; i += 1) {
                                s1.add(row.class_id);
                            }
                            for (let i = 0, row; row = req.body[i]; i += 1) {
                                if (s1.has(row[0])) {
                                    db.query('UPDATE CourseClass SET course_id = ?, teacher_id = ?, class_day = ?, start_time = ?, end_time = ? WHERE class_id = ?', [row[1], row[2], row[3], row[4], row[5], row[0]], (db_err1, db_res1, fields) => {
                                        if (db_err1) {
                                            console.log(db_err1);
                                            console.log(db_res1);
                                        }
                                    });
                                } else {
                                    db.query('INSERT INTO CourseClass (class_id, course_id, teacher_id, class_day, start_time, end_time, semester) VALUES ?', [[[row[0], row[1], row[2], row[3], row[4], row[5], semester]]], (db_err1, db_res1, fields1) => {
                                        if (db_err1) {
                                            console.log(db_err1);
                                            console.log(db_res1);
                                        }
                                    });
                                }
                                s2.add(row[0]);
                            }
                            for (let i = 0, row; row = db_res[i]; i += 1) {
                                if (!s2.has(row.class_id)) {
                                    db.query('DELETE FROM CourseClass WHERE class_id = ?', [row.class_id], (db_err1, db_res1, fields1) => {
                                        if (db_err1) {
                                            console.log(db_err1);
                                            console.log(db_res1);
                                        }
                                    });
                                }
                            }
                            res.send('Updated');
                            res.end();
                        });
                    }
                });
            });
        }
    });

    server.post('/admin/update/semester-class', (req, res) => {
        let class_id = req.headers.class_id;
        if (req.session.login && req.session.role === 'ADMIN') {
            db.query('SELECT * FROM Semester', [], (sdb_err, sdb_res, sfields) => {
                let semester = sdb_res[0].current_s;
                let status = sdb_res[0].s_time;
                if (status !== 'CLASS') {
                    res.send('This is not the time for changing student list');
                    res.end();
                    return;
                }
                db.query('SELECT * FROM Enrolment WHERE class_id = ? AND semester = ?', [class_id, semester], (db_err, db_res, fields) => {
                    let s1 = new Set();
                    let s2 = new Set();
                    for (let i = 0, row; row = db_res[i]; i += 1) {
                        s1.add(row.student_id);
                    }
                    for (let i = 0, val; val = req.body[i]; i += 1) {
                        if (!s1.has(val)) {
                            db.query('INSERT INTO Enrolment (student_id, class_id, semester) VALUES ?', [[[val, class_id, semester]]]);
                        }
                        s2.add(val);
                    }
                    for (let i = 0, row; row = db_res[i]; i += 1) {
                        if (!s2.has(row.student_id)) {
                            db.query('DELETE FROM Enrolment WHERE semester = ? AND student_id = ? AND class_id = ?', [semester, row.student_id, class_id]);
                        }
                    }
                    res.send('Updated');
                    res.end();
                });
            });
        }
    });

    server.post('/admin/update/course-requirement', (req, res) => {
        if (req.session.login && req.session.role === 'ADMIN') {
            db.query('SELECT * FROM CourseRequirement', [], (db_err, db_res, fields) => {
                let s = new Set();
                for (let i = 0, row; row = db_res[i]; i += 1) {
                    s.add(row.course_id + ' ' + row.require_id);
                }
                for (let i = 0, row; row = req.body[i]; i += 1) {
                    if (!s.has(row[0] + ' ' + row[1])) {
                        db.query('INSERT INTO CourseRequirement (course_id, require_id) VALUES (?, ?)', [row[0], row[1]], (db_err, db_res, fields) => {
                            if (db_err) {
                                console.log(db_err);
                                console.log(db_res);
                            }
                        });
                    }
                }
                s = new Set();
                for (let i = 0, row; row = req.body[i]; i += 1) {
                    s.add(row[0] + ' ' + row[1]);
                }
                for (let i = 0, row; row = db_res[i]; i += 1) {
                    if (!s.has(row.course_id + ' ' + row.require_id)) {
                        db.query('DELETE FROM CourseRequirement WHERE course_id = ? AND require_id = ?', [row.course_id, row.require_id], (db_err, db_res, fields) => {
                            if (db_err) {
                                console.log(db_err);
                                console.log(db_res);
                            }
                        });
                    }
                }
            });
            res.send('Success');
            res.end();
        }
    });
};
