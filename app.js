var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var fileupload = require('express-fileupload')
let ip

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
var urlencodedParser = bodyParser.urlencoded({ extended: false })

//adatbázis olvasás
let br = __dirname + '/br.json'
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

//IP
function getIP(ip){
  if(ip==='') return '192.168.1.2'
  return ip 
}

//Battle Royale
app.post('/br', urlencodedParser, function(req, res) {
  let txt
  try {
    txt = {"count":JSON.parse(fs.readFileSync('br.json')).count+1}
  } catch (error) {
    txt = {"count":1}
    fs.writeFileSync(br, JSON.stringify(txt, null, '\t'))
  }
  fs.writeFileSync(br, JSON.stringify(txt, null, '\t'))
  res.send(txt)
  ip = ip(req.ip.substring(7))
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
  ip = getIP(req.ip.substring(7))
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
  ip = getIP(req.ip.substring(7))
  let pass = req.body.pass
  if(pass == 'kecske'){
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

//Logout
app.post('/logout', function(req, res){
  ip = getIP(req.ip.substring(7))
  let newDB = readUsers()
  newDB.splice(newDB.indexOf(ip), 1)
  fs.writeFile('users.json', JSON.stringify(newDB, null, '\t'), 'utf8', function(){})
  saveLog(`${ip} removed.`)
  res.sendStatus(200)
})

//Queries
app.get('*', function(req, res){
  let users = readUsers()
  let service
  ip = getIP(req.ip.substring(7))
  if(users.some(x => x === ip)){
    if(req.url === '/db.json'){
      service = '/db.json'
      res.send(readDB())
    }
    else if(req.url === '/'){
      service = '/home'
      res.render('home')
    }
    else if(req.url.substring(0, 8) === '/assets/' && fs.existsSync(__dirname + req.url)){
      res.sendFile(__dirname + req.url)
      service = req.url
    }
    else if(req.url === '/favicon.ico'){
      service = '/favicon.ico'
      res.sendFile(__dirname + '/assets/favicon.png')
    }
    else{
      service = `/404 (${req.url})`
      res.render('404')
    }
    saveLog(`${ip} served. ${service}`)
  }
  else{
    if(req.url === '/favicon.ico'){
      service = req.url
      res.sendFile(__dirname + '/assets/login.png')
    }
    else{
      service = req.url
      res.render('login')
    }
    saveLog(`${ip} on login page. ${service}`)
  }
})
app.listen(3001);
saveLog('Listening to port 3001...')
