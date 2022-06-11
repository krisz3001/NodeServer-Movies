let vid = document.getElementById('vid')
let topLine = document.getElementById('topLine')
let bottom = document.getElementById('bottomLine')
let everStarted = false
let autosaveTimer
let overlayTimer
let cursorTimer
function start(){
    everStarted = true
    document.getElementById('init').classList.add('d-none')
    vid.play()
}
function videoPaused(){
    saveProgress(false);
    clearInterval(autosaveTimer)
    clearTimeout(cursorTimer)
    afk()
}
function playing(){
    clearTimeout(overlayTimer)
    hideCursor()
    startAutosave()
    document.getElementsByTagName('body')[0].style.cursor = 'default'
    document.getElementById('overlay').classList.remove('d-flex')
    document.getElementById('overlay').classList.add('d-none')
}
function afk(){
    if(vid.paused && everStarted){
    clearTimeout(overlayTimer)
    overlayTimer = setTimeout(showOverlay,10000)
    }
}
/* document.addEventListener('keydown', function(e){
    if(e.keyCode == 32 && everStarted){
        if(vid.paused){
        vid.play()
        }
        else vid.pause()
    }
}) */
function startAutosave(){
    autosaveTimer = setInterval(()=>{saveProgress(true)}, 60000)
}
function getProgress(type, filename){
    let formData = new FormData()
    if(type == 'movie'){
        formData.append("type", type)
        formData.append("filename", filename)
        fetch('/getprogress', {method: "POST", body : formData})
          .then(response => response.json())
          .then(r => {
              vid.currentTime = r.current
            })
    } 
    else{
        formData.append("type", type)
        formData.append("directory", filename.split('/')[0])
        formData.append("filename", filename.split('/')[1])
        fetch('/getprogress', {method: "POST", body : formData})
          .then(response => response.json())
          .then(r => {
              vid.currentTime = r.current
            })
    }
}
function saveProgress(auto){
    let vid = document.getElementById('vid')
    if(vid.duration > 0){
        let formData = new FormData()
        if(type == 'movie'){
            formData.append("current", vid.currentTime)
            formData.append("duration", vid.duration)
            formData.append("filename", file)
            formData.append("type", type)
            formData.append("auto", auto)
            fetch('/setprogress', {method: "POST", body: formData})
                .then(res => res.text)
                .then(r => {})
        }
        else{
            formData.append("current", vid.currentTime)
            formData.append("duration", vid.duration)
            formData.append("type", type)
            formData.append("directory", file.split('/')[0])
            formData.append("filename", file.split('/')[1])
            formData.append("auto", auto)
            console.log(formData);
            fetch('/setprogress', {method: "POST", body: formData})
                .then(res => res.text)
                .then(r => {})
        }
    }
}
function showOverlay(){
    document.getElementsByTagName('body')[0].style.cursor = 'none'
    document.getElementById('overlay').classList.add('d-flex')
    document.getElementById('overlay').classList.remove('d-none')
}
function hideOverlay(){
    overlayTimer = setTimeout(showOverlay,10000)
    document.getElementsByTagName('body')[0].style.cursor = 'default'
    document.getElementById('overlay').classList.remove('d-flex')
    document.getElementById('overlay').classList.add('d-none')
}
function goFullscreen(){
    if(!document.fullscreenElement) document.documentElement.requestFullscreen()
    else document.exitFullscreen()
}
function hideCursor(){
    document.getElementById('topLine')
    clearTimeout(cursorTimer)
    cursorTimer = setTimeout(() => {
    if(!vid.paused){
        topLine.classList.remove('scrolled-up');
        topLine.classList.add('scrolled-down');
        /* bottomLine.classList.remove('scrolled-up-bottom');
        bottomLine.classList.add('scrolled-down-bottom'); */
        document.getElementsByTagName('body')[0].style.cursor = 'none'
        setTimeout(() => {
            document.getElementById('randommovie').classList.add('d-none')
        }, (1000/3));
    }
    else clearTimeout(cursorTimer)
    }, 2500);
}
function showCursor(){
    document.getElementsByTagName('body')[0].style.cursor = 'default'
    /* bottomLine.classList.remove('scrolled-down-bottom');
    bottomLine.classList.add('scrolled-up-bottom'); */
    topLine.classList.remove('scrolled-down');
    topLine.classList.add('scrolled-up');
    document.getElementById('randommovie').classList.remove('d-none')
    if(!vid.paused) hideCursor()
}
function videoClick(){
    if(vid.paused){
    vid.play()
    }
    else vid.pause()
}
/* function progressBar(){
    let vid = document.getElementById('vid')
    document.getElementById('p').style.width = `${(vid.currentTime/vid.duration)*100}%`
} */