var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
const { json } = require('express/lib/response');

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
    saveLog('Log directory created.')
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
  console.log(time() + log)
}
//media mappa létrehozása
if(!fs.existsSync(__dirname + '/media')){
  fs.mkdirSync(__dirname + '/media')
  saveLog('Media folder created.')
}

app.set('view engine', 'ejs');
app.use('/media', express.static('media'));
app.use('/assets', express.static('assets'));
var urlencodedParser = bodyParser.urlencoded({ extended: false })

//adatbázis olvasás
let br = __dirname + '/br.txt'
if(fs.existsSync(__dirname + '/db.json')){
  var raw = fs.readFileSync('db.json');
  var db = JSON.parse(raw);
} else{
  var dbname = __dirname + '/db.json';
  var init_array = [];
  var init_json = JSON.stringify(init_array, null, '\t');
  fs.appendFileSync(dbname, init_json, function(err){
    if(err) throw err;
  });
  saveLog('db.json file created.')
  var raw = fs.readFileSync('db.json');
  var db = JSON.parse(raw);
}
//Battle Royale
app.post('/br', urlencodedParser, function(req, res) {
  let txt
  try {
    txt = {"count":JSON.parse(fs.readFileSync('br.txt')).count+1}
  } catch (error) {
    txt = {"count":1}
    fs.writeFileSync(br, JSON.stringify(txt, null, '\t'))
  }
  fs.writeFileSync(br, JSON.stringify(txt, null, '\t'))
  res.send(txt)
  var ip = req.ip.substr(7);
  if(ip === '') ip = 'Server'
  else if(ip === '100.70.64.221') ip = 'Bulazs'
  saveLog(ip + " baited.")
});
app.get('/', function(req, res) {
  res.render('home', db);
  var ip = req.ip.substr(7);
  if(ip === '') ip = 'Server'
  else if(ip === '100.70.64.221') ip = 'Bulazs'
});
app.get('/db.json', function(req, res){
  res.send(db)
})
app.listen(3001);
saveLog('Listening to port 3001...')
