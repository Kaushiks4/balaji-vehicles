var express = require('express');
var admin = require("firebase-admin");
const Excel = require('exceljs');
const excelToJson = require('convert-excel-to-json');
var router = express.Router();

var admin = require('firebase-admin');
var db = admin.database().ref();

router.get('/', function(req, res, next) {
    res.render('login');
});

router.post('/', function(req, res, next) {
    var name = req.body.username;
    var pwd = req.body.pass;

    if (name.toLowerCase() == "balaji") {
        if (pwd == "balajitransports") {
            req.session.master = "success";
            res.redirect('/secured/home/')
        } else {
            res.send("Invalid Password");
        }
    } else {
        res.send("Invalid Username");
    }
});

router.get('/secured/home/', function(req, res, next) {
    if (req.session.master) {
        var d = new Date();
        var dd = d.getDate();
        var m = d.getMonth() + 1;
        var y = d.getFullYear();
        if (dd < 10) {
            dd = '0' + dd;
        }
        if (m < 10) {
            m = '0' + m;
        }
        var date = dd + '-' + m + '-' + y;
        var map = {}
        var info = db.child("Daily");
        info.once("value", function(snapshot) {
            if (snapshot.val() != null) {
                map = snapshot.val();
                map = map[date];
                if (map == null) {
                    res.render('index', { title: 'Details', date: date, info: null, empty: true, details: false });
                } else {
                    res.render('index', { title: 'Details', date: date, info: map, empty: false, details: true });
                }
            } else {
                res.render('index', { title: 'Details', date: date, info: null, empty: true, details: false });
            }
        });
    } else {
        res.redirect('/');
    }

});

router.post('/secured/home/', function(req, res, next) {
    if (req.session.master) {
        var search = req.body.search.toLowerCase()
        var d = new Date();
        var dd = d.getDate();
        var m = d.getMonth() + 1;
        var y = d.getFullYear();
        if (dd < 10) {
            dd = '0' + dd;
        }
        if (m < 10) {
            m = '0' + m;
        }
        var date = dd + '-' + m + '-' + y;
        var map = {}
        var details = {}
        var flag = 0;
        var info = db.child("Daily");
        info.once("value", function(snapshot) {
            if (snapshot.val() != null) {
                map = snapshot.val();
                map = map[date];
                if (map == null) {
                    res.render('index', { title: 'Details', date: date, info: null, empty: true, details: false });
                } else {
                    for (var key in map) {
                        if (key.toLowerCase().includes(search)) {
                            details[key] = map[key]
                        } else {
                            for (var k in map[key]) {
                                if (map[key][k].mechanicName.toLowerCase().includes(search) || map[key][k].description.toLowerCase().includes(search)) {
                                    details[key] = map[key]
                                }
                            }
                        }
                    }
                    res.render('index', { title: 'Details', date: date, info: details, empty: false, details: true });
                }
            } else {
                res.render('index', { title: 'Details', date: date, info: null, empty: true, details: false });
            }
        });
    } else {
        res.redirect('/')
    }
});


router.get('/secured/home/:date/:vehicle', function(req, res, next) {
    var date = req.params.date
    var Num = req.params.vehicle
    var map = {}
    var info = db.child("Daily");
    info.once("value", function(snapshot) {
        map = snapshot.val();
        map = map[date][Num];
        res.render('view', { title: 'Details', num: Num, info: map });
    });
});


router.get('/logged/details/', function(req, res, next) {
    res.render('filter', { title: "Details", details: false, empty: false, sdate: null, edate: null, dates: false, vehicle: false, date: false });
});

router.get('/logged/dates/', function(req, res, next) {
    res.render('filter', { title: "Details", details: false, empty: false, sdate: null, edate: null, dates: true, vehicle: false, date: false });
});

router.get('/logged/vehicle/', function(req, res, next) {
    req.session.vehicles = {}
    var info = db.child("Vehicles")
    info.once("value", function(snap){
        if(snap.val() != null){
            req.session.vehicles = snap.val();
        }
        res.render('filter', { title: "Details", details: false, empty: false, sdate: null, edate: null, dates: false, vehicle: true, date: false , vehicles:req.session.vehicles});
    });
});


router.post('/logged/dates/', function(req, res) {
    if (req.body.stDate != null) {
        req.session.stDate = req.body.stDate
        req.session.endate = req.body.endDate
    } else {
        search = req.body.search.toLowerCase()
    }
    var sdate = req.session.stDate.split("-");
    var edate = req.session.endate.split("-")
    var sd = new Date()
    sd.setDate(sdate[2])
    sd.setMonth((sdate[1]) - 1)
    sd.setFullYear(sdate[0])
    var sDate = sdate[2] + '/' + sdate[1] + '/' + sdate[0]
    var ed = new Date()
    ed.setDate(edate[2])
    ed.setMonth((edate[1]) - 1)
    ed.setFullYear(edate[0])
    var eDate = edate[2] + '/' + edate[1] + '/' + edate[0]
    var map = {}
    var details = {}
    info = {}
    var info = db.child("Daily");
    info.once("value", function(snapshot) {
        if (snapshot.val() != null) {
            map = snapshot.val();
            if (map == null) {
                res.render('filter', { title: "Details", details: false, empty: true, sdate: null, edate: null, dates: true, vehicle: false, date: false });
            } else {
                for (var key in map) {
                    details[key] = {}
                    var j = key.split("-")
                    var k = new Date()
                    k.setDate(j[0])
                    k.setMonth((j[1]) - 1)
                    k.setFullYear(j[2])
                    if (k.getTime() >= sd.getTime() && k.getTime() <= ed.getTime()) {
                        if (req.body.search != null) {
                            for (var vnum in map[key]) {
                                if (vnum.toLowerCase().includes(search)) {
                                    details[key][vnum] = map[key][vnum]
                                } else {
                                    for (var m in map[key][vnum]) {
                                        if (map[key][vnum][m].mechanicName.toLowerCase() == search) {
                                            details[key][vnum] = map[key][vnum]
                                        }
                                        if(map[key][vnum][m].description.toLowerCase().includes(search)){
                                            details[key][vnum] = map[key][vnum]
                                        }
                                    }
                                }
                            }
                        } else {
                            details[key] = map[key]
                        }
                    }
                }
                if (Object.keys(details).length != 0) {
                    req.session.data = details;
                    res.render('filter', { title: "Details", details: true, empty: false, sdate: sDate, edate: eDate, dates: false, vehicle: false, date: true, info: details });
                } else {
                    res.render('filter', { title: "Details", details: false, empty: true, sdate: null, edate: null, dates: true, vehicle: false, date: false });
                }
            }
        } else {
            res.render('filter', { title: "Details", info: null, details: false, empty: true, sdate: null, edate: null });
        }
    });
});


router.post('/logged/vehicle/', function(req, res, next) {
    var map = {}
    var details = {}
    if (req.body.search == null) {
        req.session.vNum = req.body.cars.toLowerCase();
    } else {
        var mname = req.body.search.toLowerCase()
    }
    var vinfo = db.child("Daily");
    vinfo.once("value", function(snapshot) {
        if (snapshot.val() != null) {
            map = snapshot.val();
            for (var key in map) {
                details[key] = {}
                for (var k in map[key]) {
                    if (k.toLowerCase().includes(req.session.vNum)) {
                        if (req.body.search != null) {
                            for (var m in map[key][k]){
                                if (mname == map[key][k][m].mechanicName.toLowerCase())
                                    details[key][k] = map[key][k]
                                if(map[key][k][m].description.toLowerCase().includes(mname)){
                                    details[key][k] = map[key][k]
                                }
                            }
                        } else {
                            details[key][k] = map[key][k]
                        }
                    }
                }
            }
            if (Object.keys(details).length != 0) {
                req.session.data = details;
                res.render('filter', { title: "Details", details: true, empty: false, sdate: null, edate: null, dates: false, vehicle: true, date: false, info: details,vehicles:req.session.vehicles });
            } else {
                res.render('filter', { title: "Details", details: false, empty: true, sdate: null, edate: null, dates: true, vehicle: false, date: false,vehicles:req.session.vehicles });
            }
        } else {
            res.render('filter', { title: "Details", details: false, empty: true, sdate: null, edate: null, dates: true, vehicle: false, date: false,vehicles:req.session.vehicles });
        }
    });
});

router.get('/logged/details/vehicle', function(req, res, next) {
    res.render('view', { title: "Vehicles", dates: false, mechanic: false, vehicle: true, info: null, empty: false, vname: null, mname: null, sdate: null, edate: null });
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
                        req.session.data = details;
                        res.render('view', { title: "Details", dates: false, mechanic: false, vehicle: true, info: details, empty: false, vname: vname, mname: null, sdate: null, edate: null });
                    } else {
                        res.render('view', { title: "Details", dates: false, mechanic: false, vehicle: true, info: null, empty: true, vname: vname, mname: null, sdate: null, edate: null });
                    }
                });
            } else {
                res.send('<h1> Vehicle not found </h1>');
            }

        } else {
            res.render('view', { title: "Vehicle/Machine Details", dates: false, mechanic: false, vehicle: true, info: null, empty: true, vname: vname, mname: null, sdate: null, edate: null });
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
                req.session.data = details;
                res.render('view', { title: "Details", dates: true, mechanic: false, vehicle: false, info: details, empty: false, vname: null, mname: null, sdate: sdate, edate: edate });
            }
        } else {
            res.render('view', { title: "Details", dates: true, mechanic: false, vehicle: false, info: null, empty: true, vname: null, mname: null, sdate: sdate, edate: edate });
        }
    });
});

router.get('/logged/workers/', function(req, res, next) {
    var map = {}
    var users = db.child("Mechanics");
    users.once("value", function(snapshot) {
        if (snapshot != null) {
            map = snapshot.val();
            res.render('workers', { title: "Workers", info: map, empty: false, add: false, show: true });
        } else {
            res.render('workers', { title: "Workers", info: null, empty: true, add: false, show: false });
        }
    });
});

router.get('/logged/users/', function(req, res, next) {
    var map = {}
    var users = db.child("Users");
    users.once("value", function(snapshot) {
        if (snapshot != null) {
            map = snapshot.val();
            res.render('users', { title: "Users", info: map, empty: false, add: false, show: true });
        } else {
            res.render('users', { title: "Users", info: null, empty: true, add: false, show: false });
        }
    });
});

router.post('/logged/users/', function(req, res, next) {
    var map = {}
    var details = {}
    var s = req.body.search;
    s = s.toLowerCase();
    var users = db.child("Users");
    users.once("value", function(snapshot) {
        if (snapshot != null) {
            map = snapshot.val();
            for (var key in map) {
                if (key.toLowerCase() == s) {
                    details[key] = map[key]
                }
            }
            res.render('users', { title: "Users", info: details, empty: false, add: false, show: true });
        } else {
            res.render('users', { title: "Users", info: null, empty: true, add: false, show: false });
        }
    });
});

router.post('/logged/workers/', function(req, res, next) {
    var map = {}
    var details = {}
    var s = req.body.search;
    s = s.toLowerCase();
    var users = db.child("Mechanics");
    users.once("value", function(snapshot) {
        if (snapshot != null) {
            map = snapshot.val();
            for (var key in map) {
                for(var k in map[key])
                if (map[key][k]['name'].toLowerCase().includes(s)) {
                    details[key] = map[key];
                } else if(map[key][k]['contact'].toString().toLowerCase().includes(s)){
                    details[key] = map[key];
                } else if(map[key][k]['department'].toLowerCase().includes(s)){
                    details[key] = map[key];
                }
            }
            res.render('workers', { title: "Workers", info: details, empty: false, add: false, show: true });
        } else {
            res.render('workers', { title: "Workers", info: null, empty: true, add: false, show: false });
        }
    });
});



router.get('/secured/addworkers/', function(req, res, next) {
    res.render('workers', { title: "Workers", info: null, empty: false, add: true, show: false });
});



router.get('/logged/adduser/', function(req, res, next) {
    res.render('users', { title: "Users", info: null, empty: false, add: true, show: false });
});

router.post('/secured/addworkers/', async function(req, res, next) {
        let promise = new Promise((resolve) => {
            var file = req.files.excel;
            setTimeout(() => resolve(file), 1000)
        });
        var file = await promise;
        var filename = file.name;
        var data = {}
        var bgs = db.child("Mechanics");
        file.mv('./uploads/' + filename, async function(err) {
            if (err) {
                res.send("<h1> Error while uploading, Check your internet and try again </h1>");
            } else {
                var result = excelToJson({
                    sourceFile: "./uploads/" + filename,
                    sheets: ['Sheet1'],
                    header: {
                        rows: 1
                    },
                    columnToKey: {
                        '*': '{{columnHeader}}'
                    }
                });
                for (var key in result['Sheet1']) {
                    data["name"] = result['Sheet1'][key]["Employee Name"];
                    data["contact"] = result['Sheet1'][key]["Contact No"];
                    data["department"] = result['Sheet1'][key].Department
                    bgs.child(data["department"]).child(data["name"]).set(data);
                }
                res.redirect('/logged/workers/');
            }
        });
});

router.post('/logged/adduser/', function(req, res, next) {
    var users = db.child("Users");
    var name = req.body.username;
    var password = req.body.pwd;
    data = {
        username: name,
        password: password,
    }
    users.child(name).set(data);
    res.redirect('/logged/users/')
});


router.get('/logged/deletew/:dept/:name', function(req, res, next) {
    var dept = req.params.dept;
    var name = req.params.name;
    users = db.child('Mechanics');
    users.child(dept).child(name).remove();
    res.redirect('/logged/workers/');
});

router.get('/logged/deleteu/:name', function(req, res, next) {
    var name = req.params.name;
    users = db.child('Users');
    users.child(name).remove();
    res.redirect('/logged/users/');
});

router.get('/secured/reports/' ,function(req,res){ 
        let workbook = new Excel.Workbook()
        let worksheet = workbook.addWorksheet('Sheet1')
        headerss = ["Date","Vehicle","Description","Mechanic Name"];
        worksheet.addRow(headerss);
        for(var key in req.session.data){
            data = []
            if(Object.keys(req.session.data[key]).length > 0){
                for(var k in req.session.data[key]){
                    j = 0
                    data[j++] = key
                    data[j++] = k;
                    if(req.session.data[key][k].Morning != null) {
                        data[j++] = req.session.data[key][k].Morning.description;
                        } else if(req.session.data[key][k].Afternoon != null) {
                            data[j++] = req.session.data[key][k].Afternoon.description;
                            } else if(req.session.data[key][k].Evening != null) { 
                                        data[j++] = req.session.data[key][k].Evening.description; 
                                            }
                    if(req.session.data[key][k].Morning != null) { 
                    data[j++] = info[key][k].Morning.mechanicName;
                        } else if(req.session.data[key][k].Afternoon != null) { 
                            data[j++] = req.session.data[key][k].Afternoon.mechanicName;
                                } else if(req.session.data[key][k].Evening != null) {
                                    data[j++] = req.session.data[key][k].Evening.mechanicName;
                                    }
                    worksheet.addRow(data);
                }
            }
        }
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
          res.setHeader(
            "Content-Disposition",
            "attachment; filename=" + "Report.xlsx"
          );
          return workbook.xlsx.write(res).then(function () {
            res.status(200).end();
          });
});

module.exports = router;