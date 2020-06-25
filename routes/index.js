var express = require('express');
var admin = require("firebase-admin");
var router = express.Router();

var admin = require('firebase-admin');
var db = admin.database().ref();

/* GET home page. */
router.get('/', function(req, res, next) {
    var morning = false;
    var a = false;
    var e = false;
    var d = new Date();
    var dd = d.getDate();
    var m = d.getMonth() + 1;
    var y = d.getFullYear();
    var date = dd + '-' + m + '-' + y;
    var map = {}
    var details = {}
    var today = new Date();
    var day = today.getDate();
    var month = today.getMonth() + 1;
    var year = today.getFullYear();
    var flag = 0;
    var info = db.child("Daily");
    info.once("value", function(snapshot) {
        if (snapshot.val() != null) {
            map = snapshot.val();
            for (var key in map) {
                var d = key.split("-");
                if (d[0] == day && d[1] == month && d[2] == year) {
                    details[key] = map[key];
                    flag = 1;
                    break;
                }
            }
            if (flag = 0) {
                res.render('index', { title: 'Details', date: date, info: null, morning: false, afternoon: false, evening: false, empty: true });
            } else {
                for (var key in details) {
                    for (var k in details[key]) {
                        if (details[key][k]["Morning"] != null) {
                            morning = true;
                        }
                        if (details[key][k]["Afternoon"] != null) {
                            a = true;
                        }
                        if (details[key][k]["Evening"] != null) {
                            e = true;
                        }
                    }
                    break;
                }
                res.render('index', { title: 'Balaji Transports', date: date, info: details, morning: morning, afternoon: a, evening: e, empty: false });
            }
        } else {
            res.render('index', { title: 'Balaji Transports', date: date, info: null, morning: false, afternoon: false, evening: false, empty: true });
        }
    });
});

router.get('/logged/details/', function(req, res, next) {
    res.render('view', { title: "Details", dates: false, mechanic: false, vehicle: false, info: null, empty: false, vname: null, mname: null, sdate: null, edate: null });
});

router.get('/logged/details/date', function(req, res, next) {
    res.render('view', { title: "Details", dates: true, mechanic: false, vehicle: false, info: null, empty: false, vname: null, mname: null, sdate: null, edate: null });
});

router.get('/logged/details/mechanic', function(req, res, next) {
    res.render('view', { title: "Details", dates: false, mechanic: true, vehicle: false, info: null, empty: false, vname: null, mname: null, sdate: null, edate: null });
});

router.post('/logged/details/mechanic', function(req, res, next) {
    var map = {}
    var info = {}
    var details = {}
    var flag = 0;
    var mname = req.body.mname
    mname = mname.toLowerCase();
    var minfo = db.child("Mechanic");
    var vinfo = db.child("Daily");
    minfo.once("value", function(snapshot) {
        if (snapshot.val() != null) {
            map = snapshot.val();
            for (var key in map) {
                if (key.toLowerCase() == mname) {
                    for (var k in map[key]) {
                        details[k] = map[key][k];
                    }
                    flag = 1;
                    break;
                }
            }
            if (flag == 0) {
                res.send("Mechanic not found");
            } else {
                res.render('view', { title: "Details", dates: false, mechanic: true, vehicle: false, info: details, empty: false, vname: null, mname: mname, sdate: null, edate: null });
            }
        } else {
            res.render('view', { title: "Details", dates: false, mechanic: true, vehicle: false, info: null, empty: true, vname: null, mname: mname, sdate: null, edate: null });
        }
    });
});

router.get('/logged/details/vehicle', function(req, res, next) {
    res.render('view', { title: "Details", dates: false, mechanic: false, vehicle: true, info: null, empty: false, vname: null, mname: null, sdate: null, edate: null });
});

router.post('/logged/details/vehicle', function(req, res, next) {
    var map = {}
    var details = {}
    var info = db.child('Vehicles');
    var vinfo = db.child('Daily');
    var vname = req.body.vname
    vname = vname.toLowerCase();
    var flag = 0;
    info.once("value", function(snapshot) {
        if (snapshot.val() != null) {
            map = snapshot.val();
            for (var key in map) {
                if (key.toLowerCase() == vname) {
                    flag = 1;
                    break;
                }
            }
            if (flag == 1) {
                vinfo.once("value", function(snap) {
                    map = snap.val();
                    for (var k in map) {
                        for (vnum in map[k]) {
                            if (vnum == vname) {
                                details[k] = map[k][vnum];
                                flag = 0;
                            }
                        }
                    }
                    if (flag == 0) {
                        res.render('view', { title: "Details", dates: false, mechanic: false, vehicle: true, info: details, empty: false, vname: vname, mname: null, sdate: null, edate: null });
                    } else {
                        res.render('view', { title: "Details", dates: false, mechanic: false, vehicle: true, info: null, empty: true, vname: vname, mname: null, sdate: null, edate: null });
                    }
                });
            } else {
                res.send('<h1> Vehicle not found </h1>');
            }

        } else {
            res.render('view', { title: "Details", dates: false, mechanic: false, vehicle: true, info: null, empty: true, vname: vname, mname: null, sdate: null, edate: null });
        }
    });
});

router.post('/logged/details/date', function(req, res, next) {
    var map = {}
    var details = {}
    var sdate = req.body.sdate;
    var s = sdate.split("-");
    var edate = req.body.edate;
    var e = edate.split("-");
    var info = db.child("Daily");
    info.once("value", function(snapshot) {
        if (snapshot.val() != null) {
            map = snapshot.val();
            var flag = 0;
            for (var key in map) {
                var d = key.split("-");
                if (d[0] >= s[2] && d[1] >= s[1] && d[2] >= s[0]) {
                    if (d[0] <= e[2] && d[1] <= s[1] && d[2] <= e[0]) {
                        details[key] = map[key];
                        flag = 1;
                    }
                }
            }
            if (flag == 0) {
                res.render('view', { title: "Details", dates: true, mechanic: false, vehicle: false, info: null, empty: true, vname: null, mname: null, sdate: sdate, edate: edate });
            } else {
                res.render('view', { title: "Details", dates: true, mechanic: false, vehicle: false, info: details, empty: false, vname: null, mname: null, sdate: sdate, edate: edate });
            }
        } else {
            res.render('view', { title: "Details", dates: true, mechanic: false, vehicle: false, info: null, empty: true, vname: null, mname: null, sdate: sdate, edate: edate });
        }
    });
});

router.get('/logged/users/', function(req, res, next) {
    var map = {}
    var users = db.child("Mechanics");
    users.once("value", function(snapshot) {
        if (snapshot != null) {
            map = snapshot.val();
            res.render('user', { title: "Users", info: map, empty: false, add: false, show: true });
        } else {
            res.render('user', { title: "Users", info: null, empty: true, add: false, show: false });
        }
    });
});

router.get('/logged/adduser/', function(req, res, next) {
    res.render('user', { title: "Users", info: null, empty: false, add: true, show: false });
});

router.post('/logged/adduser/', function(req, res, next) {
    var map = {}
    var users = db.child("Mechanics");
    var name = req.body.username;
    data = {
        Mechanic_name: name,
    }
    users.child(name).set(data);
    res.redirect('/logged/users/')
});

router.get('/logged/delete/:name', function(req, res, next) {
    var name = req.params.name;
    users = db.child('Users');
    users.child(name).remove();
    res.redirect('/logged/users/');
});

module.exports = router;