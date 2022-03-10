var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');

function time(){
  let date = new Date();
  return '[' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + '] ';
}
//launch time
let getLaunchTime = new Date();
var month = getLaunchTime.getMonth()+1;
var launchTime = getLaunchTime.getFullYear() + '-' + month + '-' + getLaunchTime.getDate() + '-' + getLaunchTime.getHours() + '-' + getLaunchTime.getMinutes() + '-' + getLaunchTime.getSeconds();
var sessionStart = 'This session was started on ' + getLaunchTime.getFullYear() + '.' + month + '.' + getLaunchTime.getDate() + '. ' + getLaunchTime.getHours() + ':' + getLaunchTime.getMinutes() + ':' + getLaunchTime.getSeconds();
const logName = 'logs/' + launchTime + '_log.txt'

//save log
function saveLog(log){
  if(!fs.existsSync(__dirname + '/logs')){
    fs.mkdirSync(__dirname + '/logs');
    console.log(time() + 'Log directory created.');
    fs.appendFileSync(logName, sessionStart, function(err){
      if(err) throw err;
    });
    fs.appendFileSync(logName, '\n' + time() + 'Log directory created.', function(err){
      if(err) throw err;
    });
    fs.appendFileSync(logName, '\n' + log, function(err){
      if(err) throw err;
    });
  } else{
    if(!fs.existsSync(__dirname + '/' + logName)){
      fs.appendFile(logName, sessionStart, function(err){
        if(err) throw err;
        else{
          fs.appendFile(logName, '\n' + log, function(err){
            if(err) throw err;
          });
        }
      });
    } else{
      fs.appendFile(logName, '\n' + log, function(err){
        if(err) throw err;
      });
    }
  }
  return log;
}
//media mappa létrehozása
if(!fs.existsSync(__dirname + '/media')){
  fs.mkdirSync(__dirname + '/media');
  console.log(saveLog(time() + 'Media folder created.'));
}

app.set('view engine', 'ejs');
app.use('/media', express.static('media'));
app.use('/assets', express.static('assets'));
var urlencodedParser = bodyParser.urlencoded({ extended: false })

//adatbázis olvasás
if(fs.existsSync(__dirname + '/db.json')){
  var raw = fs.readFileSync('db.json');
  var db = JSON.parse(raw);
} else{
  var dbname = __dirname + '/db.json';
  var init_array = {"series":[],"movies":[]};
  var init_json = JSON.stringify(init_array, null, '\t');
  fs.appendFileSync(dbname, init_json, function(err){
    if(err) throw err;
  });
  console.log(saveLog(time() + 'db.json file created.'));
  var raw = fs.readFileSync('db.json');
  var db = JSON.parse(raw);
}

app.post('/', urlencodedParser, function(req, res) {
  var fullname = req.body.fullname;
  var name = req.body.name;
  if(req.body.type === 'movies'){
    var pattern_movies = {"name":name,"fullname":fullname};
    var movie_exists = false;
    var ip = req.ip.substr(7);
	if(ip === '') ip = 'Server'
    for(var i in db.movies){
      if(db.movies[i].name === name){
        movie_exists = true;
        break;
      }
    }
    if(movie_exists === false){
      save_movies(pattern_movies);
      console.log(saveLog(time() + 'Movie (' + fullname + '; ' + name + ') was added by ' + ip));
    }
  } else if (req.body.type === 'series'){
    var s = req.body.s;
    var e = req.body.e;
    var pattern_series = {"name":name,"fullname":fullname,"s":s,"e":e};
    var series_exists = false;
    for(var i in db.series){
      if(db.series[i].name === name){
        series_exists = true;
        break;
      }
    }
    if(series_exists === false){
      save_series(pattern_series);
      var ip = req.ip.substr(7);
      console.log(saveLog(time() + 'Series (' + fullname + '; ' + name + '; ' + 'S:' + s + '; E:' + e + ') was added by ' + ip));
    }
  }
  res.render('home', db);
});

//sorozat mentése
function save_series(obj){
  db.series.push(obj);
  var savefile = JSON.stringify(db, null, "\t");
  fs.writeFile('db.json', savefile, 'utf8', function(err, data){
    if(err){
      console.log(err);
    }
  });
}

//film mentése
function save_movies(obj){
  db.movies.push(obj);
  var savefile = JSON.stringify(db, null, "\t");
  fs.writeFile('db.json', savefile, 'utf8', function(err, data){
    if(err){
      console.log(err);
    }
  });
}

//sorozat törlése
function delete_series(name, ip){
  var fullname = '';
  var s = '';
  var e = '';
  for(var i in db.series){
    if(name === db.series[i].name){
      fullname = db.series[i].fullname;
      s = db.series[i].s;
      e = db.series[i].e;
      delete db.series[i];
    }
  }
  var clean_db = db.series.filter(function (elem){
    return elem != null;
  });
  db.series = clean_db;
  var savefile = JSON.stringify(db, null, '\t');
  fs.writeFile('db.json', savefile, 'utf8', function(err, data){
    if(err){
      console.log(err);
    }
  });
  console.log(saveLog(time() + 'Series (' + fullname + '; ' + name + '; ' + 'S:' + s + '; E:' + e + ') was deleted by ' + ip));
}
//returns fullname
function full(name){
  var movie = false;
  for(var i in db.movies){
    if(db.movies[i].name === name){
      return db.movies[i].fullname;
      movie = true;
      break;
    }
  }
  if(movie === false){
    for(var i in db.series){
      if(db.series[i].name === name){
        return db.series[i].fullname;
        break;
      }
    }
  }
}
//film törlése
function delete_movies(name, ip){
  var fullname = '';
  for(var i in db.movies){
    if(name === db.movies[i].name){
      fullname = db.movies[i].fullname;
      delete db.movies[i];
    }
  }
  var clean_db = db.movies.filter(function (elem){
    return elem != null;
  });
  db.movies = clean_db;
  var savefile = JSON.stringify(db, null, '\t');
  fs.writeFile('db.json', savefile, 'utf8', function(err, data){
    if(err){
      console.log(err);
    }
  });
  console.log(saveLog(time() + 'Movie (' + fullname + '; ' + name + ') was deleted by ' + ip));
}

app.get('/', function(req, res) {
  res.render('home', db);
});
app.get('*', function(req, res){
  var ip = req.ip.substr(7);
  if(ip === '') ip = 'Server'
  if(req.url[1] === '&'){
    var fullname = full(req.url.substr(2));
    res.render('series', {name: req.url.substr(2), db, fullname});
  } else if(req.url[1] === '-'){
    if(req.url[2] === 'm'){
      delete_movies(req.url.substr(4), ip);
    } else if (req.url[2] === 's') {
      delete_series(req.url.substr(4), ip);
    }
    res.render('delete', db);
  } else if(req.url[1] === '!'){
    if(fs.existsSync(__dirname + '/media/' + req.url.substr(2) + '.mp4')){
      if(req.url.includes('_')){
      var fullname = full(req.url.substr(req.url.indexOf('!') + 1, req.url.indexOf('_')-2));
      var temp_s = req.url.substr(req.url.lastIndexOf('s'));
      if(temp_s[2] === '_'){
        var s = req.url.substr(req.url.lastIndexOf('s')+1, 1);
      } else{
        var s = req.url.substr(req.url.lastIndexOf('s')+1, 2);
      }
      var temp_e = req.url.substr(req.url.lastIndexOf('e'));
      if(temp_e[2] === '_'){
        var e = req.url.substr(req.url.lastIndexOf('e')+1, 1);
      } else{
        var e = req.url.substr(req.url.lastIndexOf('e')+1, 2);
      }
    }
      else{
        var fullname = full(req.url.substr(2));
      }
      var media_name = req.url.substr(2) + '.mp4';
      res.render('media', {name: req.url.substr(2), dir: '/media/' + req.url.substr(2) + '.mp4', fullname, s, e});
      console.log(saveLog(time() + ip + ' asked for ' + media_name));
      if(s === undefined || e === undefined)
      console.log(saveLog(time() + ip + ' is watching ' + fullname));
      else
      console.log(saveLog(time() + ip + ' is watching ' + fullname + ' S' + s + ' E' + e));
    }else
      res.render('404');
  }
});
app.listen(3001);
console.log(saveLog(time() + 'Listening to port 3001...'));
