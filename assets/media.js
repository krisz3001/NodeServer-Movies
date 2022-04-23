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
    saveProgress();
    clearInterval(autosaveTimer)
    clearTimeout(cursorTimer)
    afk()
}
function playing(){
    clearTimeout(overlayTimer)
    hideCursor()
    startAutosave()
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
    autosaveTimer = setInterval(saveProgress, 60000)
}
function getProgress(id, type, filename){
    let formData = new FormData()
    if(type == 'movie'){
        formData.append("id", id)
        formData.append("type", type)
        fetch('/getprogress', {method: "POST", body : formData})
          .then(response => response.json())
          .then(r => {
              vid.currentTime = r.current
            })
    } 
    else{
        formData.append("id", id)
        formData.append("type", type)
        formData.append("filename", filename)
        fetch('/getprogress', {method: "POST", body : formData})
          .then(response => response.json())
          .then(r => {
              vid.currentTime = r.current
            })
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