var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var fileupload = require('express-fileupload')

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
app.use(fileupload())
app.use('/media', express.static('media'));
app.use('/assets', express.static('assets'));
var urlencodedParser = bodyParser.urlencoded({ extended: false })

//adatbázis olvasás
let br = __dirname + '/br.txt'
let dbname = __dirname + '/db.json';
function readDB(){
  let db = []
  try {
    db = JSON.parse(fs.readFileSync('db.json'))
  } catch (error) {
    fs.writeFileSync(dbname, JSON.stringify([]))
    saveLog('db.json file created.')
  }
  return db
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

//Upload
app.post('/upload', function(req,res){
  let img = 'placeholder.jpg'
  if(req.files){
    img = req.files.image.name
    fs.writeFile(__dirname + '/assets/' + img, req.files.image.data, function(err){
      if(err) throw err
      saveLog(`${img} downloaded.`)
    })
  }
  let item = {"image": img, "title": req.body.title, "description": req.body.description}
  let newDB = readDB()
  newDB.push(item)
  fs.writeFile('db.json', JSON.stringify(newDB, null, '\t'), 'utf8', function(){})
  res.sendStatus(200)
  var ip = req.ip.substr(7);
  if(ip === '') ip = 'Server'
  else if(ip === '100.70.64.221') ip = 'Bulazs'
  saveLog(`${req.body.title} added by ${ip}.`)
})

//Get allowed users
let users_path = __dirname + '/users.json'
function readUsers(){
  let users = []
  try {
    users = JSON.parse(fs.readFileSync('users.json'))
  } catch (error) {
    fs.writeFileSync(users_path, JSON.stringify([]))
    saveLog('users.json file created.')
  }
  return users
}

//Password
app.use(bodyParser.json())
app.post('/pass', function(req, res){
  let ip = req.ip.substring(7)
  let pass = req.body.pass
  if(ip === '') ip = '192.168.1.2'
  if(pass == 'lófasz'){
    let newDB = readUsers()
    if(!newDB.some(x => x === ip)){
      newDB.push(ip)
      fs.writeFile('users.json', JSON.stringify(newDB, null, '\t'), 'utf8', function(){})
      saveLog(`${ip} registered.`)
    }
  }
  else{
    saveLog(`${ip} is trying to get in with "${pass}".`)
  }
  res.sendStatus(200)
})

//Queries
app.get('*', function(req, res){
  let users = readUsers()
  let ip = req.ip.substring(7)
  if(ip === '') ip = '192.168.1.2'
  if(users.some(x => x === ip)){
    let service
    if(req.url === '/db.json'){
      service = '/db.json'
      res.send(readDB())
    }
    else if(req.url === '/'){
      service = '/home'
      res.render('home')
    }
    else{
      service = `/404 (${req.url})`
      res.render('404')
    }
    let ip = req.ip.substring(7);
    if(ip === '') ip = 'Server'
    else if(ip === '100.70.64.221') ip = 'Bulazs'
    saveLog(`${ip} served. ${service}`)
  }
  else{
    res.render('login')
    saveLog(`${ip} on login page.`)
  }
})
app.listen(3001);
saveLog('Listening to port 3001...')
