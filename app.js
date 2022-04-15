var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var fileupload = require('express-fileupload');
const { use } = require('express/lib/application');
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
    fs.appendFileSync(logName, '\n' + time() + log, function(err){
      if(err) throw err;
    });
  } else{
    if(!fs.existsSync(__dirname + '/' + logName)){
      fs.appendFileSync(logName, sessionStart, function(err){
        if(err) throw err;
        else{
          fs.appendFileSync(logName, '\n' + time() + log, function(err){
            if(err) throw err;
          });
        }
      });
    } else{
      fs.appendFileSync(logName, '\n' + time() + log, function(err){
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

//Get allowed users
let users_path = __dirname + '/users.json'
function readUsers(){
  let users = []
  try {
    users = JSON.parse(fs.readFileSync('users.json'))
  } catch (error) {
    console.log(error);
    fs.writeFileSync(users_path, JSON.stringify([]))
    saveLog('users.json file created.')
  }
  return users
}

app.set('view engine', 'ejs');
app.use(fileupload())
var urlencodedParser = bodyParser.urlencoded({ extended: false })

//Reading db.json
let br = __dirname + '/br.json'
function readDB(){
  let db = []
  try {
    db = JSON.parse(fs.readFileSync('db.json'))
  } catch (error) {
    fs.writeFileSync(__dirname + '/db.json', JSON.stringify(db))
    saveLog('db.json file created.')
  }
  return db
}

//Reading profiles.json
function readProfiles(){
  let db = {"0":[],"1":[],"2":[],"3":[]}
  try {
    db = JSON.parse(fs.readFileSync('profiles.json'))
  } catch (error) {
    fs.writeFileSync(__dirname + 'profiles.json', JSON.stringify(db))
    saveLog('profiles.json file created.')
  }
  return db
}

//IP
function getIP(ip){
  if(ip==='') return '192.168.1.2'
  return ip 
}

//Users check
function isRegistered(req){
  let users = readUsers()
  ip = getIP(req.ip.substring(7))
  if(users.some(x => x.ip === ip)) return true
  else return false
}

//Has assigned profile
function profileAssigned(req){
  let users = readUsers()
  if(users.some(x => x.ip === ip)){
    ip = getIP(req.ip.substring(7))
    if(users[users.indexOf(users.find(x => x.ip === ip))].profile != -1) return true
  }
  else return false
}

//Battle Royale
app.post('/br', urlencodedParser, function(req, res) {
  if(isRegistered(req)){
    let txt
    try {
      txt = {"count":JSON.parse(fs.readFileSync('br.json')).count+1}
    } catch (error) {
      txt = {"count":1}
      fs.writeFileSync(br, JSON.stringify(txt, null, '\t'))
    }
    fs.writeFileSync(br, JSON.stringify(txt, null, '\t'))
    res.send(txt)
    ip = getIP(req.ip.substring(7))
    saveLog(ip + " baited.")
  } 
  else{
    ip = getIP(req.ip.substring(7))
    res.render('login')
    saveLog(`Illegal POST request from ${ip}. ${req.url}`)
  }
});

//Get assigned profile
function getProfile(req){
  let users = readUsers()
  return users[users.indexOf(users.find(x => x.ip === getIP(req.ip.substring(7))))].profile
}

//Upload
app.post('/upload', function(req,res){
  if(isRegistered(req)){
    let img = 'placeholder.jpg'
    if(req.files){
      img = req.files.image.name
      fs.writeFileSync(__dirname + '/assets/' + img, req.files.image.data, function(err){
        if(err) throw err
        saveLog(`${img} downloaded.`)
      })
    }
    let newDB = readDB()
    let profiles = readProfiles()
    let item = {"id":newDB.length ,"image": img, "title": req.body.title, "description": req.body.description, "filename": req.body.filename}
    for (let i = 0; i < Object.keys(profiles).length; i++) {
      profiles[i].push({"id":newDB.length ,"image": img, "title": req.body.title, "description": req.body.description, "filename": req.body.filename, "current": "0", "duration": "0"})
    }
    newDB.push(item)
    fs.writeFileSync('db.json', JSON.stringify(newDB, null, '\t'), 'utf8', function(){})
    fs.writeFileSync('profiles.json', JSON.stringify(profiles, null, '\t'), 'utf8', function(){})
    res.sendStatus(200)
    ip = getIP(req.ip.substring(7))
    saveLog(`"${req.body.title}" added by ${ip}.`)
  }
  else{
    ip = getIP(req.ip.substring(7))
    res.render('login')
    saveLog(`Illegal POST request from ${ip}. ${req.url}`)
  }
})

//Saving progress
app.post('/progress', function(req, res){
  if(isRegistered(req)){
    let profiles = readProfiles()
    let n = getProfile(req)
    profiles[n][profiles[n].indexOf(profiles[n].find(x => x.id == req.body.id))].current = req.body.current
    profiles[n][profiles[n].indexOf(profiles[n].find(x => x.id == req.body.id))].duration = req.body.duration
    fs.writeFileSync('profiles.json', JSON.stringify(profiles, null, '\t'), 'utf8', function(){})
    res.sendStatus(200)
  }
  else{
    ip = getIP(req.ip.substring(7))
    res.render('login')
    saveLog(`Illegal POST request from ${ip}. ${req.url}`)
  }
})

//Password
app.post('/pass', function(req, res){
  ip = getIP(req.ip.substring(7))
  let pass = req.body.pass
  if(pass == 'kecske'){
    let newDB = readUsers()
    if(!newDB.some(x => x === ip)){
      newDB.push({"ip": ip, "profile": "-1"})
      fs.writeFileSync('users.json', JSON.stringify(newDB, null, '\t'), 'utf8', function(){})
      saveLog(`${ip} registered.`)
    }
  }
  else{
    saveLog(`${ip} is trying to get in with "${pass}".`)
  }
  res.sendStatus(200)
})

//Set profile
app.post('/setprofile', function(req, res){
  if(isRegistered(req) && req.body != undefined && "profileID" in req.body){
    ip = getIP(req.ip.substring(7))
    let users = readUsers()
    users[users.indexOf(users.find(x => x.ip === ip))].profile = req.body.profileID
    fs.writeFileSync('users.json', JSON.stringify(users, null, '\t'), 'utf8', function(){})
    saveLog(`Profile ${req.body.profileID} set for ${ip}`)
    res.sendStatus(200)
  }
  else{
    ip = getIP(req.ip.substring(7))
    res.render('login')
    saveLog(`Illegal POST request from ${ip}. ${req.url}`)
  }
})

//Logout
app.post('/logout', function(req, res){
  if(isRegistered(req)){
    ip = getIP(req.ip.substring(7))
    let users = readUsers()
    users.splice(users.indexOf(users.find(x => x.ip === ip)), 1)
    fs.writeFileSync('users.json', JSON.stringify(users, null, '\t'), 'utf8', function(){})
    saveLog(`${ip} removed.`)
    res.sendStatus(200)
  }
  else{
    ip = getIP(req.ip.substring(7))
    res.render('login')
    saveLog(`Illegal POST request from ${ip}. ${req.url}`)
  }
})

//Delete Show
app.post('/delete', function(req, res){
  if(isRegistered(req)){
    ip = getIP(req.ip.substring(7))
    let newDB = readDB()
    let profiles = readProfiles()
    let title = newDB[req.body.n].title
    for (let i = 0; i < Object.keys(profiles).length; i++) {
      profiles[i].splice(req.body.n, 1)
      for (let j = 0; j < profiles[i].length; j++) {
        profiles[i][j].id = j
      }
    }
    newDB.splice(req.body.n, 1)
    for (let i = 0; i < newDB.length; i++) {
      newDB[i].id = i
    }
    fs.writeFileSync('db.json', JSON.stringify(newDB, null, '\t'), 'utf8', function(){})
    fs.writeFileSync('profiles.json', JSON.stringify(profiles, null, '\t'), 'utf8', function(){})
    res.sendStatus(200)
    saveLog(`"${title}" deleted by ${ip}.`)
  }
  else{
    ip = getIP(req.ip.substring(7))
    res.render('login')
    saveLog(`Illegal POST request from ${ip}. ${req.url}`)
  }
})

//Queries
app.get('*', function(req, res){
  let service
  ip = getIP(req.ip.substring(7))
  if(isRegistered(req) && profileAssigned(req)){
    if(req.url === '/db.json'){
      service = '/db.json'
      res.send(readProfiles())
    }
    else if(req.url === '/'){
      service = '/home'
      res.render('home', {"id": getProfile(req)})
    }
    else if(req.url === '/profile'){
      service = req.url
      res.render('profiles')
    }
    else if(req.url.substring(0, 8) === '/assets/' && req.url != '/assets/' && fs.existsSync(__dirname + req.url)){
      res.sendFile(__dirname + req.url)
      service = ''
    }
    else if(req.url.substring(0,7) === '/media/' && req.url != '/media/' && fs.existsSync(__dirname + req.url)){
      res.sendFile(__dirname + req.url)
      service = req.url
    }
    else if(req.url.substring(0,7) === '/movie/' && req.url != '/movie/' && req.url.substring(7) <= readDB().length && req.url.substring(7) > -1){
      if(fs.existsSync(__dirname + '/media/' + readDB()[req.url.substring(7)].filename)){
        service = req.url
        res.render('media', readProfiles()[getProfile(req)][req.url.substring(7)])
      }
      else{
        service = req.url
        res.render('404')
      }
    }
    else if(req.url === '/list'){
      service = req.url
      let list = []
      fs.readdir(__dirname + '/media', (err, files) => {
        files.forEach(x=>{
          list.push(x)
        })
        res.send(list)
      })
    }
    else if(req.url === '/favicon.ico'){
      service = ''
      res.sendFile(__dirname + '/assets/favicon.png')
    }
    else{
      service = `/404 (${req.url})`
      res.render('404')
    }
    if(service.substring(0,7) === '/media/'){
      saveLog(`${ip} is watching ${service}`)
    }
    else if(service != '') saveLog(`${ip} served. ${service}`)
  }
  else if(isRegistered(req) && !profileAssigned(req) && req.url.substring(0, 8) === '/assets/' && req.url != '/assets/' && fs.existsSync(__dirname + req.url)){
    res.sendFile(__dirname + req.url)
  }
  else if(isRegistered(req) && !profileAssigned(req)){
    res.render('profiles')
  }
  else if(isRegistered(req) && !profileAssigned(req) && req.url === '/favicon.ico'){
    res.sendFile(__dirname + '/assets/favicon.png')
  }
  else{
    if(req.url === '/favicon.ico'){
      service = ''
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
app.listen(80);
saveLog('Listening to port 80...')