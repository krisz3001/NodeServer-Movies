var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var fileupload = require('express-fileupload');
const { getVideoDurationInSeconds } = require('get-video-duration');
const { use } = require('express/lib/application');
let ip

//Launch time
let d = new Date()
let launchTime = d.toLocaleString().replace(/[ ]/g, '').replace(/[^0-9]/g, '-')
let sessionStart = `This session was started on ${d.toLocaleString()}`

//Database paths
const db_path = `${__dirname}/db.json`
const profiles_path = `${__dirname}/profiles.json`
const users_path = `${__dirname}/users.json`
const backup_path = `${__dirname}/backup.json`
const backup_redo_path = `${__dirname}/backup_redo.json`
const logDir_path = `${__dirname}/logs/`
const log_path = `${__dirname}/logs/${launchTime}_log.txt`
const br_path = `${__dirname}/br.json`
const mediaDir_path = `/media/`
const assetsDir_path = `${__dirname}/assets/`
const todo_path = `${__dirname}/todo.json`
const accounts_path = `${__dirname}/accounts.json`
const durations_path = `${__dirname}/durations.json`
const accountsDir_path = `${__dirname}/accounts/`
const secret = 'kecske'
saveLog(sessionStart)

//Get time
function time(){
  let date = new Date()
  let h = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
  let m = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
  let s = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds()
  return `[${h}:${m}:${s}] `
}
//Save log
function saveLog(log){
  try {
    fs.appendFileSync(log_path, `${time()}${log}\n`, function(){})
  } catch (err) {
    fs.mkdirSync(logDir_path)
    fs.appendFileSync(log_path, `${time()}${log}\n`, function(){})
    saveLog('Log directory created.')
  }
  console.log(time() + log);
}
//Create media directory
!fs.existsSync(mediaDir_path) ? fs.mkdirSync(mediaDir_path) + saveLog('Media folder created.') : ''

//Create accounts directory
!fs.existsSync(accountsDir_path) ? fs.mkdirSync(accountsDir_path) + saveLog('Accounts folder created.') : ''

//Get logged in users
function readUsers(){
  let users = []
  try {
    users = JSON.parse(fs.readFileSync(users_path))
  } catch (error) {
    fs.writeFileSync(users_path, JSON.stringify([]))
    saveLog('users.json file created.')
  }
  return users
}

app.set('view engine', 'ejs');
app.use(fileupload())
var urlencodedParser = bodyParser.urlencoded({ extended: false })

//Reading todo.json
function readTodo(){
  let db = []
  try {
    db = JSON.parse(fs.readFileSync(todo_path))
  } catch (error) {
    fs.writeFileSync(todo_path, JSON.stringify(db, null, '\t'))
    saveLog('todo.json file created.')
  }
  return db
}

//Reading db.json
function readDB(){
  let db = []
  try {
    db = JSON.parse(fs.readFileSync(db_path))
  } catch (error) {
    fs.writeFileSync(db_path, JSON.stringify(db, null, '\t'))
    saveLog('db.json file created.')
  }
  return db
}

//Reading durations.json
function readDurations(){
  let durations = []
  try {
    durations = JSON.parse(fs.readFileSync(durations_path))
  } catch (error) {
    fs.writeFileSync(durations_path, JSON.stringify(durations, null, '\t'))
    saveLog('durations.json file created.')
  }
  return durations
}

//Reading accounts.json
function readAccounts(){
  let acc = []
  try {
    acc = JSON.parse(fs.readFileSync(accounts_path))
  } catch (error) {
    fs.writeFileSync(accounts_path, JSON.stringify(acc, null, '\t'))
    saveLog('accounts.json file created.')
  }
  return acc
}

//Reading backup
function readBackup(){
  let db = {"0":[],"1":[],"2":[],"3":[]}
  try {
    db = JSON.parse(fs.readFileSync(backup_path))
  } catch (error) {
    fs.writeFileSync(backup_path, JSON.stringify(db, null, '\t'))
    saveLog('backup.json file created.')
  }
  return db
}

//Reading backup_redo
function readBackupRedo(){
  let db = {"0":[],"1":[],"2":[],"3":[]}
  try {
    db = JSON.parse(fs.readFileSync(backup_redo_path))
  } catch (error) {
    fs.writeFileSync(backup_redo_path, JSON.stringify(db, null, '\t'))
    saveLog('backup_redo.json file created.')
  }
  return db
}

//Reading profiles
function readProfiles(){
  let profiles = [{"id":0,"name": "Profile 1", "image": "blue.png"},{"id":1,"name": "Profile 2", "image": "yellow.png"},{"id":2,"name": "Profile 3", "image": "red.png"},{"id":3,"name": "Profile 4", "image": "favicon.png"}]
  let users = readUsers()
  let acc = readAccounts()
  let username = acc[users.find(x=>x.ip == ip).account].username
  try {
    profiles = JSON.parse(fs.readFileSync(accountsDir_path + username + '_profiles.json'))
  } catch (error) {
    fs.writeFileSync(accountsDir_path + username + '_profiles.json', JSON.stringify(profiles, null, '\t'))
    saveLog(username + '_profiles.json file created.')
  }
  return profiles
}

//Write profiles
function writeProfiles(n, db){
  let users = readUsers()
  let acc = readAccounts()
  let username = acc[users.find(x=>x.ip == ip).account].username
  fs.writeFileSync(accountsDir_path + username + '_profiles.json', JSON.stringify(db, null, '\t'))
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
      txt = {"count":JSON.parse(fs.readFileSync(br_path)).count+1}
    } catch (error) {
      txt = {"count":1}
      fs.writeFileSync(br_path, JSON.stringify(txt, null, '\t'))
    }
    fs.writeFileSync(br_path, JSON.stringify(txt, null, '\t'))
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

//Read account's json
function readAccountDB(n){
  let users = readUsers()
  let acc = readAccounts()
  let username = acc[users.find(x=>x.ip == n).account].username
  let durations = readDurations()
  try {
    durations = JSON.parse(fs.readFileSync(accountsDir_path + username + '.json'))
  } catch (error) {
    fs.writeFileSync(accountsDir_path + username + '.json', JSON.stringify([[],[],[],[]], null, '\t'))
    saveLog(username + '.json file created.')
  }
  return durations
}

//Write account's json
function writeAccountDB(n, db){
  let users = readUsers()
  let acc = readAccounts()
  let username = acc[users.find(x=>x.ip == n).account].username
  fs.writeFileSync(accountsDir_path + username + '.json', JSON.stringify(db, null, '\t'))
}

//Upload
app.post('/upload', function(req,res){
  if(isRegistered(req)){
    let img = 'placeholder.jpg'
    if(req.files){
      img = req.files.image.name
      fs.writeFileSync(assetsDir_path + img, req.files.image.data, function(err){
        if(err) throw err
      })
      saveLog(`${img} downloaded.`)
    }
    let db = readDB()
    let durations = readDurations()
    fs.writeFileSync(backup_path, JSON.stringify(db, null, '\t'), 'utf8', function(){})
    if(fs.lstatSync(mediaDir_path + req.body.filename).isDirectory()){
      let list = []
      let seasons = 0
      let episodes = []
      let episode_progress = []
      files = fs.readdirSync(mediaDir_path + req.body.filename)
      files.forEach(x => list.push(x))
      let counter = 0
      list.forEach(x => {
        let season = x.split('.')[0].split('_')[1]
        if(season > seasons) episodes.push(0)
        seasons = season > seasons ? season : seasons
        episodes[season-1]++
        getVideoDurationInSeconds(mediaDir_path + `/${x.split('_')[0]}/` + x).then(y => {
          episode_progress.push({"filename": x, "current": "0", "duration": `${y}`})
        }).then(z => {
          counter++
          if(counter === list.length){
            episode_progress.sort((a, b) => {
              return a.filename.localeCompare(b.filename, 'en', {numeric: true})
            })
            db.push({"id": db.length, "type": "series", "image": img, "title": req.body.title, "description": req.body.description, "seasons": seasons, "episodes": episodes})
            fs.writeFileSync(db_path, JSON.stringify(db, null, '\t'), 'utf8', function(){})
            durations.push({"id": durations.length, "progress": episode_progress[0].filename, "episode_progress": episode_progress})
            fs.writeFileSync(durations_path, JSON.stringify(durations, null, '\t'), 'utf8', function(){})
            res.sendStatus(200)
            saveLog(`"${req.body.title}" added by ${ip}. (${episodes.reduce((a,b)=>a+b,0)} episodes)`)
          }
        })
      })
    }
    else{
      db.push({"id": db.length, "type": "movie", "image": img, "title": req.body.title, "description": req.body.description, "filename": req.body.filename})
      fs.writeFileSync(db_path, JSON.stringify(db, null, '\t'), 'utf8', function(){})
      getVideoDurationInSeconds(mediaDir_path + req.body.filename).then(x => {
        durations.push({"id": durations.length, "current": "0", "duration": `${x}`})
        fs.writeFileSync(durations_path, JSON.stringify(durations, null, '\t'), 'utf8', function(){})
        res.sendStatus(200)
        ip = getIP(req.ip.substring(7))
        saveLog(`"${req.body.title}" added by ${ip}.`)
      })
    }
  }
  else{
    ip = getIP(req.ip.substring(7))
    res.render('login')
    saveLog(`Illegal POST request from ${ip}. ${req.url}`)
  }
})

//Edit profile
app.post('/editprofile', function(req, res){
  if(isRegistered(req) && req.body != undefined){
    ip = getIP(req.ip.substring(7))
    let profiles = readProfiles()
    let img = profiles[req.body.id].image
    if(req.files){
      img = req.files.image.name
      fs.writeFileSync(assetsDir_path + img, req.files.image.data, function(err){
        if(err) throw err
      })
      saveLog(`${img} downloaded.`)
    }
    profiles[req.body.id].name = req.body.name
    profiles[req.body.id].image = img
    writeProfiles(ip, profiles)
    res.sendStatus(200)
    saveLog(`Profile ${req.body.id} edited by ${ip}. Name: ${req.body.name}, Image: ${img}`)
  }
  else{
    ip = getIP(req.ip.substring(7))
    res.render('login')
    saveLog(`Illegal POST request from ${ip}. ${req.url}`)
  }
})

//Add new To-Do
app.post('/todo', function(req, res){
  if(isRegistered(req) && req.body != undefined){
    let todo = readTodo()
    todo.push({"todo": req.body.todo, "completed": false})
    fs.writeFileSync(todo_path, JSON.stringify(todo, null, '\t'))
    res.send(todo)
  }
  else{
    ip = getIP(req.ip.substring(7))
    res.render('login')
    saveLog(`Illegal POST request from ${ip}. ${req.url}`)
  }
})

//Line out todo
app.post('/completed', function(req, res){
  if(isRegistered(req) && req.body != undefined){
    let todo = readTodo()
    if(todo[req.body.id].completed) todo[req.body.id].completed = false
    else todo[req.body.id].completed = true
    fs.writeFileSync(todo_path, JSON.stringify(todo, null, '\t'))
    res.sendStatus(200)
  }
  else{
    ip = getIP(req.ip.substring(7))
    res.render('login')
    saveLog(`Illegal POST request from ${ip}. ${req.url}`)
  }
})

//Saving progress
app.post('/setprogress', function(req, res){
  if(isRegistered(req)){
    let db = readAccountDB(ip)
    let n = getProfile(req)
    if(req.body.type == 'movie'){
      db[n][req.body.id].current = req.body.current
      db[n][req.body.id].duration = req.body.duration
      writeAccountDB(ip, db)
      res.sendStatus(200)
    }
    else if(req.body.type == 'series'){
      db[n][req.body.id].episode_progress.find(x=>x.filename == req.body.filename.split('/')[1]).current = req.body.current
      db[n][req.body.id].episode_progress.find(x=>x.filename == req.body.filename.split('/')[1]).duration = req.body.duration
      db[n][req.body.id].progress = `${req.body.filename.split('/')[1]}`
      writeAccountDB(ip, db)
      res.sendStatus(200)
    }
    else{
      res.status(404)
      saveLog(`Incorrect POST request from ${ip}. ${req.url}`)
    }
  }
  else{
    ip = getIP(req.ip.substring(7))
    res.render('login')
    saveLog(`Illegal POST request from ${ip}. ${req.url}`)
  }
})

//Get progress
app.post('/getprogress', function(req, res){
  if(isRegistered(req)){
    let db = readAccountDB(ip)
    let n = getProfile(req)
    if(req.body.type == 'movie'){
      res.send({"current": db[n][req.body.id].current})
    } 
    else if(req.body.type == 'series'){
      res.send({"current": db[n][req.body.id].episode_progress.find(x=>x.filename == req.body.filename.split('/')[1]).current})
    }
    else{
      res.status(404)
      saveLog(`Incorrect POST request from ${ip}. ${req.url}`)
    }
  }
  else{
    ip = getIP(req.ip.substring(7))
    res.render('login')
    saveLog(`Illegal POST request from ${ip}. ${req.url}`)
  }
})

//Register new account
app.post('/register', function(req, res){
  ip = getIP(req.ip.substring(7))
  let acc = readAccounts()
  let users = readUsers()
  if(req.body.secret == secret && !req.body.username.includes(' ') && !req.body.pass.includes(' ') && !acc.some(x=>x.username == req.body.username)){
    acc.push({"username": req.body.username, "password": req.body.pass, "time" : new Date().toLocaleString(), "ip" : ip})
    fs.writeFileSync(accounts_path, JSON.stringify(acc, null, '\t'), 'utf8', function(){})
    users.push({"ip": ip, "account": acc.length-1, "profile": "-1"})
    fs.writeFileSync(users_path, JSON.stringify(users, null, '\t'), 'utf8', function(){})
    let p = readDurations()
    fs.writeFileSync(`${accountsDir_path}/${req.body.username}.json`, JSON.stringify([p,p,p,p], null, '\t'), 'utf8', function(){})
    fs.writeFileSync(`${accountsDir_path}/${req.body.username}_profiles.json`, JSON.stringify([{"id":0,"name": "Profile 1", "image": "blue.png"},{"id":1,"name": "Profile 2", "image": "yellow.png"},{"id":2,"name": "Profile 3", "image": "red.png"},{"id":3,"name": "Profile 4", "image": "favicon.png"}], null, '\t'), 'utf8', function(){})
    res.sendStatus(200)
    saveLog(`New account registered by ${ip}. (${req.body.username})`)
  }
  else{
    saveLog(`${ip} is trying to register with username: "${req.body.username}", password: "${req.body.pass}", secret: "${req.body.secret}"`)
    res.sendStatus(200)
  }
})

//Login
app.post('/login', function(req, res){
  ip = getIP(req.ip.substring(7))
  let username = req.body.username
  let pass = req.body.password
  let acc = readAccounts()
  let account = acc.find(x=>x.username == username)
  if(account != undefined && account.password == pass){
    let users = readUsers()
    users.push({"ip": ip, "account": acc.findIndex(x=>x.username == username), "profile": -1})
    fs.writeFileSync(users_path, JSON.stringify(users, null, '\t'), 'utf8', function(){})
    saveLog(`${ip} logged in. (${username})`)
    res.sendStatus(200)
  }
  else if(pass == 'adjlog'){
    let log = fs.readFileSync(log_path, 'utf8').toString()
    res.send(log)
    saveLog(`${ip} asked for the log.`)
  }
  else if(pass == 'mazsika1'){
    saveLog(`${ip} invokes emergency shutdown.`)
    res.sendStatus(200)
    process.exit()
  }
  else if(pass == 'abandonship'){
    res.send('lololol')
    saveLog(`${ip} wanted to abandon ship.`)
  }
  else{
    saveLog(`${ip} is trying to log in with username: "${username}", password: "${pass}".`)
    res.sendStatus(200)
  }
})

//Set profile
app.post('/setprofile', function(req, res){
  if(isRegistered(req) && req.body != undefined && "profileID" in req.body){
    ip = getIP(req.ip.substring(7))
    let users = readUsers()
    users[users.indexOf(users.find(x => x.ip === ip))].profile = req.body.profileID
    fs.writeFileSync(users_path, JSON.stringify(users, null, '\t'), 'utf8', function(){})
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
    fs.writeFileSync(users_path, JSON.stringify(users, null, '\t'), 'utf8', function(){})
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
    let db = readDB()
    let title = db[getProfile(req)][req.body.n].title
    fs.writeFileSync(backup_path, JSON.stringify(db, null, '\t'), 'utf8', function(){})
    for (let i = 0; i < Object.keys(db).length; i++) {
      db[i].splice(req.body.n, 1)
      for (let j = 0; j < db[i].length; j++) {
        db[i][j].id = j
      }
    }
    fs.writeFileSync(db_path, JSON.stringify(db, null, '\t'), 'utf8', function(){})
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
let undone = false
app.get('*', function(req, res){
  let service
  ip = getIP(req.ip.substring(7))
  if(isRegistered(req) && profileAssigned(req)){
    if(req.url === '/db.json'){
      service = ''
      let db = readDB()
      let durations = readDurations()
      let accDB = readAccountDB(ip)
      let merged = [[],[],[],[]]
      for (let i = 0; i < Object.keys(accDB).length; i++) {
        for (let j = 0; j < db.length; j++) {
          if(accDB[i][j] != undefined){
            merged[i].push({...db[j], ...accDB[i][j]})
          }
          else merged[i].push({...db[j], ...durations[j]})
        }
      }
      writeAccountDB(ip, merged)
      res.send(merged)
    }
    else if(req.url === '/'){
      service = '/home'
      let profiles = readProfiles()[getProfile(req)]
      res.render('home', {"id": getProfile(req), "name": profiles.name, "image": profiles.image})
    }
    else if(req.url === '/profile'){
      service = req.url
      res.render('profiles', {"profiles": readProfiles()})
    }
    else if(req.url.substring(0, 8) === '/assets/' && req.url != '/assets/' && fs.existsSync(__dirname + req.url)){
      res.sendFile(__dirname + req.url)
      service = ''
    }
    else if(req.url.substring(0,7) === '/media/' && req.url != '/media/' && fs.existsSync(req.url)){
      res.sendFile(req.url)
      service = req.url
    }
    else if(req.url.substring(0,7) === '/movie/' && req.url != '/movie/' && req.url.substring(7) <= readDB().length && req.url.substring(7) > -1){
      if(fs.existsSync(mediaDir_path + readDB()[req.url.substring(7)].filename)){
        service = req.url
        let profiles = readProfiles()[getProfile(req)]
        let item = readDB()[req.url.substring(7)]
        let db = {"name": profiles.name, "profile_image": profiles.image, "id": item.id, "type": item.type, "title": item.title, "filename": item.filename, "image": item.image, "description": item.description}
        res.render('media', db)
      }
      else{
        service = req.url
        res.render('404')
      }
    }
    else if(req.url.substring(0,8) === '/series/' && req.url != '/series/' && req.url.split('/').length === 6){
      try {
        fs.lstatSync(mediaDir_path + req.url.substring(8).split('/')[1]).isDirectory()
        service = req.url
        let split = req.url.split('/')
        let name = split[3]
        let s = split[4]
        let e = split[5]
        let mp4 = fs.existsSync(mediaDir_path + `${name}/${name}_${s}_${e}.mp4`)
        let mkv = fs.existsSync(mediaDir_path + `${name}/${name}_${s}_${e}.mkv`)
        if(mp4 || mkv){
          let profiles = readProfiles()[getProfile(req)]
          let item = readAccountDB(ip)[getProfile(req)][split[2]]
          let db = {"name": profiles.name, "profile_image": profiles.image, "id": item.id, "type": item.type, "title": item.title, "filename": `${name}/${name}_${s}_${e}.${mkv ? 'mkv' : 'mp4'}`, "image": item.image, "description": item.description, "progress": item.progress, "seasons": item.seasons, "episodes": item.episodes}
          res.render('media', db)
        }
        else{
          service = `/404 (${req.url})`
          res.render('404')
        }
      } catch (error) {
        service = `/404 (${req.url})`
        res.render('404')
      }
    }
    else if(req.url === '/undo'){
      service = req.url
      if(JSON.stringify(readBackup()) != JSON.stringify(readDB())) fs.writeFileSync(backup_redo_path, JSON.stringify(readDB(), null, '\t'), 'utf8', function(){})
      fs.writeFileSync(db_path, JSON.stringify(readBackup(), null, '\t'), 'utf8', function(){})
      undone = true
      res.sendStatus(200)
    }
    else if(req.url === '/redo'){
      service = req.url
      if(undone){
        fs.writeFileSync(db_path, JSON.stringify(readBackupRedo(), null, '\t'), 'utf8', function(){})
        undone = false
      }
      else saveLog(`Incorrect redo from ${ip}`)
      res.sendStatus(200)
    }
    else if(req.url === '/todo'){
      service = ''
      res.send(readTodo())
    }
    else if(req.url === '/list'){
      service = req.url
      let list = []
      fs.readdir(mediaDir_path, (err, files) => {
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
    res.render('profiles', {"profiles": readProfiles()})
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