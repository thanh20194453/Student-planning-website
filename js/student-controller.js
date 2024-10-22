module.exports = function(server, db) {
    server.get('/student/registered/list', (req, res) => {
        if (req.session.login && req.session.role === 'STUDENT') {
            db.query('SELECT Course.course_name, Course.course_id, Enrolment.class_id, CourseClass.class_day, CourseClass.start_time, CourseClass.end_time, Enrolment.midterm_score, Enrolment.final_score, Enrolment.total, Course.progress_weight FROM Enrolment JOIN (CourseClass, Course, Semester) ON (Enrolment.semester = Semester.current_s AND Enrolment.class_id = CourseClass.class_id AND Enrolment.semester = CourseClass.semester AND CourseClass.course_id = Course.course_id) WHERE Enrolment.student_id = ?', [req.session.user_id], (db_err, db_res, fields) => {
                res.send(db_res);
                res.end();
            });
        }
    });

    server.get('/student/register/registered-class', (req, res) => {
        if (req.session.login && req.session.role === 'STUDENT') {
            db.query('SELECT Course.course_name, Course.course_id, Enrolment.class_id, CourseClass.class_day, CourseClass.start_time, CourseClass.end_time FROM Enrolment JOIN (CourseClass, Course, Semester) ON (Enrolment.semester = Semester.current_s AND Enrolment.class_id = CourseClass.class_id AND Enrolment.semester = CourseClass.semester AND CourseClass.course_id = Course.course_id) WHERE Enrolment.student_id = ?', [req.session.user_id], (db_err, db_res, fields) => {
                res.send(db_res);
                res.end();
            });
        }
    });

    server.get('/student/list/registered-class', (req, res) => {
        if (req.session.login && req.session.role === 'STUDENT') {
            db.query('SELECT Course.course_name, Course.course_id, CourseClass.class_id, CourseClass.class_day, CourseClass.start_time, CourseClass.end_time FROM CourseClass JOIN (Course, Semester) ON (CourseClass.semester = Semester.current_s AND CourseClass.course_id = Course.course_id)', [], (db_err, db_res, fields) => {
                res.send(db_res);
                res.end();
            });
        }
    });

    server.get('/student/register/registered-course', (req, res) => {
        if (req.session.login && req.session.role === 'STUDENT') {
            db.query('SELECT Course.* FROM CourseRegistration JOIN (Course, Semester) ON (CourseRegistration.semester = Semester.current_s AND CourseRegistration.course_id = Course.course_id) WHERE CourseRegistration.student_id = ?', [req.session.user_id], (db_err, db_res, fields) => {
                res.send(db_res);
                res.end();
            });
        }
    });

    server.get('/student/predict-course', (req, res) => {
        console.log("ok");
        if (req.session.login && req.session.role === 'STUDENT') {
            db.query('SELECT * FROM Curriculum LEFT JOIN Course ON (Curriculum.course_id = Course.course_id) GROUP BY Curriculum.course_id ', (db_err, db_res, fields) => {
                db.query('SELECT Enrolment.semester, Enrolment.total, CourseClass.course_id  FROM Enrolment LEFT JOIN CourseClass ON (Enrolment.class_id = CourseClass.class_id AND CourseClass.semester=Enrolment.semester) WHERE Enrolment.student_id = ?', [req.session.user_id] ,(db_err1, db_res1, fields1) => {
                    for (let i = 0, row; row = db_res[i]; i += 1) {
                        db_res[i].semester = null;
                        for (let j = 0, row1; row1 = db_res1[j]; j += 1) {
                            if (row.course_id == row1.course_id) {
                                db_res[i].semester = db_res1[j].semester;
                                db_res[i].total = db_res1[j].total;
                            }     
                        }
                    }
                    res.send(db_res);
                    res.end();
                }); 
            });
        }
    });

    server.post('/student/register-class/update', (req, res) => {
        if (req.session.login && req.session.role === 'STUDENT') {
            if (req.session.class_type === 'NORMAL') {
                res.send('Your curriculum does not allow you to register classes');
                res.end();
                return;
            }
            db.query('SELECT * FROM Semester', [], (sdb_err, sdb_res, sfields) => {
                let semester = sdb_res[0].current_s;
                let status = sdb_res[0].s_time;
                if (status !== 'CLASS') {
                    res.send('This is not the time for registering classes');
                    res.end();
                    return;
                }
                db.query('SELECT Course.course_name, Course.course_id, Enrolment.class_id, CourseClass.class_day, CourseClass.start_time, CourseClass.end_time FROM Enrolment JOIN (CourseClass, Course) ON (Enrolment.class_id = CourseClass.class_id AND Enrolment.semester = CourseClass.semester AND CourseClass.course_id = Course.course_id) WHERE Enrolment.semester = ? AND Enrolment.student_id = ?', [semester, req.session.user_id], (db_err, db_res, fields) => {                   
                    let ins = [], del = [];
                    let old = new Set(), new_ = new Set();
                    for (let i = 0, row; row = db_res[i]; i += 1) {
                        old.add(row.class_id);
                    }
                    for (let i = 0, row; row = req.body[i]; i += 1) {
                        new_.add(row[2]);
                        if (!old.has(row[2])) {
                            ins.push([req.session.user_id, row[2], semester]);
                        }
                    }
                    for (let i = 0, row; row = db_res[i]; i += 1) {
                        if (!new_.has(row.class_id)) {
                            del.push(row.class_id);
                        }
                    }
                    
                    for (let i = 0, len = req.body.length; i < len; i += 1) {
                        let row1 = req.body[i];
                        for (let j = i + 1; j < len; j += 1) {
                            let row2 = req.body[j];
                            if (row1[3] === row2[3]) {
                                if (row1[4] > row2[5] || row1[5] < row2[4]) {}
                                else {
                                    res.send('Time conflict between class ' + row1[2] + ' and class ' + row2[2]);
                                    res.end();
                                    return;
                                }
                            }
                        }
                    }
                    
                    ins_func = function (msg) {
                        db.query('INSERT INTO Enrolment (student_id, class_id, semester) VALUES ?', [ins], (db_err3, db_res3, fields3) => {
                            if (db_err3) console.log(db_res3);
                            res.send(msg);
                            res.end();
                        });
                    };
                    if (del.length > 0) {
                        db.query('DELETE FROM Enrolment WHERE student_id = ? AND semester = ? AND class_id IN ?', [req.session.user_id, semester, [del]], (db_err2, db_res2, fields2) => {
                            if (db_err2) console.log(db_res2);
                            if (ins.length > 0) {
                                ins_func('Registration sent');
                            } else {
                                res.send('Registration sent');
                                res.end();
                            }
                        });
                    } else if (ins.length > 0) {
                        ins_func('Registration sent');
                    } else {
                        res.send('Registration sent');
                        res.end();
                    }
                });
            });
        }
    });

    server.post('/student/register-course/update', (req, res) => {
        if (req.session.login && req.session.role === 'STUDENT') {
            if (req.session.class_type === 'NORMAL') {
                res.send('Your curriculum does not allow you to register courses');
                res.end();
                return;
            }
            db.query('SELECT * FROM Semester', [], (sdb_err, sdb_res, sfields) => {
                let semester = sdb_res[0].current_s;
                let status = sdb_res[0].s_time;
                if (status !== 'COURSE') {
                    res.send('This is not the time for registering courses');
                    res.end();
                    return;
                }
                db.query('SELECT course_id FROM CourseRegistration WHERE semester = ? AND student_id = ?', [semester, req.session.user_id], (db_err, db_res, fields) => {
                    let s1 = new Set();
                    let s2 = new Set();
                    for (let i = 0, row; row = db_res[i]; i += 1) {
                        s1.add(row.course_id);
                    }
                    for (let i = 0, val; val = req.body[i]; i += 1) {
                        if (!s1.has(val)) {
                            db.query('INSERT INTO CourseRegistration (course_id, semester, student_id) VALUES ?', [[[val, semester, req.session.user_id]]]);
                        }
                        s2.add(val);
                    }
                    for (let i = 0, row; row = db_res[i]; i += 1) {
                        if (!s2.has(row.course_id)) {
                            db.query('DELETE FROM CourseRegistration WHERE semester = ? AND student_id = ? AND course_id = ?', [semester, req.session.user_id, row.course_id]);
                        }
                    }
                    res.send('Registration sent');
                    res.end();
                });
            });
        }
    });

    server.get('/student/enrolment', (req, res) => {
        if (req.session.login && req.session.role === 'STUDENT') {
	    db.query('SELECT CourseClass.course_id, Enrolment.midterm_score, Enrolment.final_score, Enrolment.total, Course.progress_weight FROM Enrolment JOIN (CourseClass, Course) ON (Enrolment.class_id = CourseClass.class_id AND Enrolment.semester = CourseClass.semester AND CourseClass.course_id = Course.course_id) WHERE student_id = ?', [req.session.user_id], (db_err, db_res, fields) => {
	        res.send(db_res);
	        res.end();
	    });
        }
    });

    server.get('/student/previous-enrolment', (req, res) => {
        if (req.session.login && req.session.role === 'STUDENT') {
	    db.query('SELECT CourseClass.course_id, Enrolment.midterm_score, Enrolment.final_score, Course.progress_weight FROM Enrolment JOIN (CourseClass, Course, Semester) ON (Enrolment.class_id = CourseClass.class_id AND Enrolment.semester = CourseClass.semester AND CourseClass.course_id = Course.course_id AND Enrolment.semester != Semester.current_s) WHERE student_id = ?', [req.session.user_id], (db_err, db_res, fields) => {
	        res.send(db_res);
	        res.end();
	    });
        }
    });

    server.get('/student/curriculum', (req, res) => {
        if (req.session.login && req.session.role === 'STUDENT') {
	    db.query('SELECT Curriculum.course_id,Curriculum.compulsory, Course.course_name, Course.credit, Course.credit_HP, Course.faculty FROM Curriculum JOIN Course ON Curriculum.course_id = Course.course_id WHERE Curriculum.class_id = ?', [req.session.class_id], (db_err, db_res, fields) => {
	        res.send(db_res);
	        res.end();
	    });
        }
    });

    server.get('/student/class/list', (req, res) => {
        let class_id = req.headers.class_id;
        if (req.session.login && req.session.role === 'STUDENT') {
            db.query('SELECT Course.course_name, Course.course_id, CourseClass.class_id, CourseClass.class_day, CourseClass.start_time, CourseClass.end_time FROM CourseClass JOIN (Course, Semester) ON (CourseClass.course_id = Course.course_id AND CourseClass.semester = Semester.current_s) WHERE CourseClass.class_id = ?', [class_id], (db_err, db_res, fields) => {
                res.send(db_res);
                res.end();
            });
        }
    });

    server.get('/student/course/list', (req, res) => {
        let class_id = req.headers.class_id;
        if (req.session.login && req.session.role === 'STUDENT') {
            db.query('SELECT * FROM Course WHERE course_id = ?', [req.headers.course_id], (db_err, db_res, fields) => {
                res.send(db_res);
                res.end();
            });
        }
    });

    server.get('/student/get/course-requirement', (req, res) => {
        if (req.session.login && req.session.role === 'STUDENT') {
            db.query('SELECT * FROM CourseRequirement', [], (db_err, db_res, fields) => {
                res.send(db_res);
                res.end();
            });
        }
    });

    server.post('student/predict/sotin', (req, res) => {
        if (req.session.login && req.session.role === 'STUDENT') {
            db.query('SELECT * FROM Curriculum LEFT JOIN Course ON (Curriculum.course_id = Course.course_id)', (db_err, db_res, fields) => {
                db.query('SELECT Enrolment.semester, Enrolment.total, CourseClass.course_id  FROM Enrolment LEFT JOIN CourseClass ON (Enrolment.class_id = CourseClass.class_id) WHERE Enrolment.student_id = ?', [req.session.user_id] ,(db_err1, db_res1, fields1) => {
                    for (let i = 0, row; row = db_res[i]; i += 1) {
                        db_res[i].semester = null;
                        for (let j = 0, row1; row1 = db_res1[j]; j += 1) {
                            if (row.course_id == row1.course_id) {
                                db_res[i].semester = db_res1[j].semester;
                                db_res[i].total = db_res1[j].total;
                            }     
                        }
                    }
                    for (let k = 0, row2; row2 = req.body[k]; k += 1){
                        
                    }
                    const highs_settings = {
                        // In node, locateFile is not needed
                        // In the browser, point locateFile to the URL of the wasm file (see below)
                        locateFile: (file) => "https://lovasoa.github.io/highs-js/" + file
                    };
                    const highs = require("highs")(highs_settings);
                    highs.solve(`Maximize
                    obj: x + 2 y
                    Subject To
                    c1: x + y <= 20
                    c2: x - y >= -30
                    Bounds
                    0 <= x
                    0 <= y
                    End`);
                    console.log("a");  
                    res.end();
                }); 
            });
        }
    });

    server.get('/student/predict-score', (req, res) => {
        if (req.session.login && req.session.role === 'STUDENT') {
            db.query('SELECT * FROM Enrolment WHERE Enrolment.student_id = ? AND Enrolment.total IS NOT NULL', [req.session.user_id], (db_err, db_res, fields) => {
                let stdscore = [];
                let stdclass = [];
                for (let i = 0, row; row = db_res[i]; i += 1) {
                    stdscore.push([row.class_id,row.total,row.semester]);
                    stdclass.push(row.class_id);
                }

                db.query('SELECT faculty,courseclass.course_id, total, COUNT(*), 100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY course_id) AS percentage FROM Enrolment LEFT JOIN (Courseclass,Course) ON (Enrolment.class_id = Courseclass.class_id AND Enrolment.semester = Courseclass.semester AND Course.course_id =courseclass.course_id ) GROUP BY total, course_id ORDER BY course_id,total;', [], (db_err, db_res1, fields) => {
                    let a=[0,0,0,0,0,0,0,0,0,'CH2021'];
                    let allscore=[];
                    for (let j = 0, row1; row1 = db_res1[j]; j += 1) {
                        if (db_res1[j].course_id == a[9]){
                            var d=["F","D","D+","C","C+","B","B+","A","A+"];
                            for (let k = 0; k<9; k += 1){
                                if (db_res1[j].total == d[k]){
                                    for (let m = 0; m<k; m += 1){
                                        a[m]= a[m]+ db_res1[j].percentage;
                                        
                                    }
                                }
                            }
                        }else {
                            allscore.push(a);
                            a=[0,0,0,0,0,0,0,0,0,db_res1[j].course_id,db_res1[j].faculty];
                            j=j-1;
                        }
                    }
                    db.query('SELECT faculty,courseclass.course_id,Enrolment.class_id, Enrolment.semester, total, COUNT(*), 100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY class_id,semester) AS percentage FROM Enrolment LEFT JOIN (Courseclass,Course) ON (Enrolment.class_id = Courseclass.class_id AND Enrolment.semester = Courseclass.semester AND Course.course_id =courseclass.course_id) GROUP BY total, Enrolment.class_id, Enrolment.semester ORDER BY course_id,total;', [], (db_err, db_res2, fields) => {
                        let cuoi=[];
                        for (let i = 0; i <stdscore.length; i += 1) {
                            cuoi.push(['',0,'']);
                            for (let j = 0, row2; row2 = db_res2[j]; j += 1) {
                                if (stdscore[i][0]==db_res2[j].class_id && stdscore[i][2]==db_res2[j].semester){
                                    cuoi[i][0]=db_res2[j].course_id;
                                    cuoi[i][2]=db_res2[j].faculty;
                                    if (stdscore[i][1].includes('+')){
                                        if (stdscore[i][1]> db_res2[j].total){
                                            cuoi[i][1] = cuoi[i][1] + db_res2[j].percentage;
                                        }
                                        if (stdscore[i][1] == db_res2[j].total.concat('+')){
                                            cuoi[i][1] = cuoi[i][1] - db_res2[j].percentage;
                                        }
                                    }else{
                                        if (stdscore[i][1]> db_res2[j].total){
                                            cuoi[i][1] = cuoi[i][1] + db_res2[j].percentage;
                                        }
                                        if (stdscore[i][1].concat('+') == db_res2[j].total){
                                            cuoi[i][1] = cuoi[i][1] + db_res2[j].percentage;
                                        }
                                    }
                                }
                            }
                        }
                        let tb=0;
                        let nhom=[['TCNTT',0,0],['BGDTC',0,0],['KKTVQL',0,0],['KML',0,0],['KGDQP',0,0],['TCNTT',0,0],['KTTD',0,0],['VVLKT',0,0],['THKHSS',0,0],['KSPKT',0,0],['KKTVQL',0,0],['TDDT',0,0],['TCK',0,0],['KNN',0,0]];
                        let duoi50=[];
                        for (let h = 0; h <cuoi.length; h += 1) {
                            for (let l = 0; l <nhom.length; l += 1) {
                                if (nhom[l][0]== cuoi[h][2]){
                                    nhom[l][1]=nhom[l][1]*nhom[l][2] + cuoi[h][1];
                                    nhom[l][2]=nhom[l][2]+1;
                                    nhom[l][1]=nhom[l][1]/nhom[l][2];
                                }
                            }
                            tb= tb + cuoi[h][1]; 
                            if (cuoi[h][1]>50){
                                duoi50.push(cuoi[h][0]);
                            }
                        }
                        tb= tb/cuoi.length;
                        let presc=[];
                        let nhieucao=[];
                        for (let i = 0; i <allscore.length; i += 1) {
                            if (allscore[i][5]>40){
                                nhieucao.push(allscore[i][9]);
                            }
                            for (let n = 0; n <nhom.length; n += 1){
                                for (let k = 0; k<9; k += 1){
                                    if (allscore[i][10] == nhom[n][0] && nhom[n][1]!=0){
                                        if (allscore[i][k]< nhom[n][1]){
                                            presc.push([allscore[i][9],d[k]]);
                                            break;
                                        }
                                    }else if (allscore[i][10] == nhom[n][0] && nhom[n][1]==0){
                                        if (allscore[i][k]< tb){
                                            presc.push([allscore[i][9],d[k]]);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        console.log(cuoi);
                        console.log(nhom);
                        console.log(presc);
                        res.send([tb,nhieucao,duoi50,presc]);
                        res.end();  
                    });  
                });
                /*for (let k = 0; k < 1; k += 1) {
                    for (let i = 0; i < stdscore.length; i += 1) {
                        let per=0;
                        db.query('SELECT total, COUNT(*), 100.0 * COUNT(*) / SUM(COUNT(*)) OVER () AS percentage FROM Enrolment WHERE Enrolment.class_id = ? AND Enrolment.semester = ? GROUP BY total', [stdscore[i][0],stdscore[i][2]], (db_err1, db_res1, fields) => {
                            if (stdscore[i][1].includes('+')){
                                for (let j = 0, row1; row1 = db_res1[j]; j += 1) {
                                    if (stdscore[i][1]> db_res1[j].total){
                                        per = per + db_res1[j].percentage;
                                    }
                                    if (stdscore[i][1] == db_res1[j].total.concat('+')){
                                        per = per - db_res1[j].percentage;
                                    }
                                }
                            }else{
                                for (let j = 0, row1; row1 = db_res1[j]; j += 1) {
                                    if (stdscore[i][1]> db_res1[j].total){
                                        per = per + db_res1[j].percentage;
                                    }
                                    if (stdscore[i][1].concat('+') == db_res1[j].total){
                                        per = per + db_res1[j].percentage;
                                    }
                                }
                            }
                            stdscore[i].push(per);
                            console.log(stdscore[i]);
                        });
                    }
                    console.log(stdscore);
                }*/
            });
        }
    });

    server.get('/student/predict-score1', (req, res) => {
        if (req.session.login && req.session.role === 'STUDENT') {
            db.query('SELECT * FROM Enrolment WHERE Enrolment.student_id = ? AND Enrolment.total IS NOT NULL', [req.session.user_id], (db_err, db_res, fields) => {
                let stdscore = [];
                let stdclass = [];
                for (let i = 0, row; row = db_res[i]; i += 1) {
                    stdscore.push([row.class_id,row.total,row.semester]);
                    stdclass.push(row.class_id);
                }

                db.query('SELECT faculty,courseclass.course_id, total, COUNT(*), 100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY course_id) AS percentage FROM Enrolment LEFT JOIN (Courseclass,Course) ON (Enrolment.class_id = Courseclass.class_id AND Enrolment.semester = Courseclass.semester AND Course.course_id =courseclass.course_id ) GROUP BY total, course_id ORDER BY course_id,total;', [], (db_err, db_res1, fields) => {
                    let a=[0,0,0,0,0,0,0,0,0,'CH2021','',''];
                    let allscore=[];
                    for (let j = 0, row1; row1 = db_res1[j]; j += 1) {
                        if (db_res1[j].course_id == a[9]){
                            var d=["F","D","D+","C","C+","B","B+","A","A+"];
                            for (let k = 0; k<9; k += 1){
                                if (db_res1[j].total == d[k]){
                                    for (let m = 0; m<k; m += 1){
                                        a[m]= a[m]+ db_res1[j].percentage;
                                        
                                    }
                                }
                            }
                            let fl=100-a[0];
                            for (let h = 1; h<9; h += 1){
                                if (a[h-1]-a[h]>fl){
                                    fl=a[h-1]-a[h];
                                    a[11]=d[h];
                                }
                            } 
                        }else {
                            allscore.push(a);
                            a=[0,0,0,0,0,0,0,0,0,db_res1[j].course_id,db_res1[j].faculty];
                            j=j-1;
                        }
                    }
                    console.log(allscore);
                    console.log(allscore.length);
                    db.query('SELECT faculty,courseclass.course_id,Enrolment.class_id, Enrolment.semester, total, COUNT(*), 100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY class_id,semester) AS percentage FROM Enrolment LEFT JOIN (Courseclass,Course) ON (Enrolment.class_id = Courseclass.class_id AND Enrolment.semester = Courseclass.semester AND Course.course_id =courseclass.course_id) GROUP BY total, Enrolment.class_id, Enrolment.semester ORDER BY course_id,total;', [], (db_err, db_res2, fields) => {
                        let cuoi=[];
                        for (let i = 0; i <stdscore.length; i += 1) {
                            cuoi.push(['',0,'']);
                            for (let j = 0, row2; row2 = db_res2[j]; j += 1) {
                                if (stdscore[i][0]==db_res2[j].class_id && stdscore[i][2]==db_res2[j].semester){
                                    cuoi[i][0]=db_res2[j].course_id;
                                    cuoi[i][2]=db_res2[j].faculty;
                                    if (stdscore[i][1].includes('+')){
                                        if (stdscore[i][1]> db_res2[j].total){
                                            cuoi[i][1] = cuoi[i][1] + db_res2[j].percentage;
                                        }
                                        if (stdscore[i][1] == db_res2[j].total.concat('+')){
                                            cuoi[i][1] = cuoi[i][1] - db_res2[j].percentage;
                                        }
                                    }else{
                                        if (stdscore[i][1]> db_res2[j].total){
                                            cuoi[i][1] = cuoi[i][1] + db_res2[j].percentage;
                                        }
                                        if (stdscore[i][1].concat('+') == db_res2[j].total){
                                            cuoi[i][1] = cuoi[i][1] + db_res2[j].percentage;
                                        }
                                    }
                                }
                            }
                        }
                        let tb=0;
                        let nhom=[['TCNTT',0,0],['BGDTC',0,0],['KKTVQL',0,0],['KML',0,0],['KGDQP',0,0],['TCNTT',0,0],['KTTD',0,0],['VVLKT',0,0],['THKHSS',0,0],['KSPKT',0,0],['KKTVQL',0,0],['TDDT',0,0],['TCK',0,0],['KNN',0,0]];
                        let duoi50=[];
                        for (let h = 0; h <cuoi.length; h += 1) {
                            for (let l = 0; l <nhom.length; l += 1) {
                                if (nhom[l][0]== cuoi[h][2]){
                                    nhom[l][1]=nhom[l][1]*nhom[l][2] + cuoi[h][1];
                                    nhom[l][2]=nhom[l][2]+1;
                                    nhom[l][1]=nhom[l][1]/nhom[l][2];
                                }
                            }
                            tb= tb + cuoi[h][1]; 
                            if (cuoi[h][1]>50){
                                duoi50.push(cuoi[h][0]);
                            }
                        }
                        tb= tb/cuoi.length;
                        let presc=[];
                        let nhieucao=[];
                        for (let i = 0; i <allscore.length; i += 1) {
                            if (allscore[i][5]>40){
                                nhieucao.push(allscore[i][9]);
                            }
                            for (let n = 0; n <nhom.length; n += 1){
                                for (let k = 0; k<9; k += 1){
                                    if (allscore[i][10] == nhom[n][0] && nhom[n][1]!=0){
                                        if (allscore[i][k]< nhom[n][1]){
                                            presc.push([allscore[i][9],d[k]]);
                                            break;
                                        }
                                    }else if (allscore[i][10] == nhom[n][0] && nhom[n][1]==0){
                                        if (allscore[i][k]< tb){
                                            presc.push([allscore[i][9],d[k]]);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        // console.log(cuoi);
                        // console.log(nhom);
                        // console.log(presc);
                        res.send([tb,nhieucao,duoi50,presc,allscore]);
                        res.end();  
                    });  
                });
            });
        }
    });

    server.post('/student/predict-python', (req, res) => {
        if (req.session.login && req.session.role === 'STUDENT') {
            const fs1 = require('fs');
            fs1.closeSync(fs1.openSync('python/datapy', 'w'));
            for (let i = 0; i < req.body.length; i += 1) {
                let newData = ''+req.body[i][0]+' '+req.body[i][1]+' '+req.body[i][2]+' '+req.body[i][3]+' '+req.body[i][4]+' '+req.body[i][5]+' '+req.body[i][6]+'\n';
                fs1.appendFile('python/datapy', newData, (err) => {
                    if (err) throw err;
                })
                }
            const { spawn } = require("child_process");
            const childpython = spawn("python", ["python/python2"]);
            childpython.stdout.on("data", (data) => {
                let a= `stdout: ${data}`;
                console.log(data.toString());
            });
            res.send("a");
            res.end();
        }
    });

    server.get('/student/layketqua', (req, res) => {
        if (req.session.login && req.session.role === 'STUDENT') {
            const fs2 = require('fs');
            fs2.readFile('python/result', 'utf8', (err, data) => {
                if (err) {
                  console.error(err);
                  return;
                }
                console.log(data.split('\r\n'));
                res.send(data.split('\r\n'));
                res.end();
            });
        }
    });
};