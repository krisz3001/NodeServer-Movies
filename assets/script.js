var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})
function expand(){
    //document.getElementById('items').innerHTML += newItem('placeholder.jpg','Title','Description')
    let formData = new FormData()
    formData.append("title", "Title")
    formData.append("description", "Description")
    formData.append("filename","test.mp4")
    fetch('/upload', {method: "POST", body : formData})
        .then(response => response.text)
        .then(r => refresh())
}
function newMovie(img, title, desc, n, w, current, duration){
    return `<div class="col-sm-4 col-lg-3 col-6 p-0 item"><img src="/assets/delete.png" class="d-none delete_img img-fluid btn btn-danger position-absolute" onclick="deleteShow(${n})" style="height: 30px; margin: 5px; right: 0;"><div style="background-image: url('/assets/${img}'); display: flex; align-items: end;" class="border border-secondary img_show bg-dark"><div class="bg-dark pbar" id="fullbar${n}"><div style="width: ${w}%; height: 5px; background: red;"></div></div></div><div class="item-info bg-dark p-2 border border-secondary w-100 rounded-bottom"><p class="h5">${title}</p><div class="row mb-2"><div class="col-sm-7"><div class="bg-secondary" style="height: 5px; width: 100%; margin-top: 0.6rem"><div style="height: 5px; background-color: red; width: ${w}%"></div></div></div><div class="col-sm-5 p-sm-0"><p class="m-0 text-left">${current}/${duration} perc</p></div></div><a class="btn btn-success w-100" href="/movie/${n}">Play</a><p class="mt-1 mb-0">${desc}</p></div></div>`
}
function newSeries(img, title, desc, n, w, s, e, dir, current, duration){
    let s_pretty = s < 10 ? `0${s}` : s
    let e_pretty = e < 10 ? `0${e}` : e
    return `<div class="col-sm-4 col-lg-3 col-6 p-0 item"><img src="/assets/delete.png" class="d-none delete_img img-fluid btn btn-danger position-absolute" onclick="deleteShow(${n})" style="height: 30px; margin: 5px; right: 0;"><div style="background-image: url('/assets/${img}'); display: flex; align-items: end;" class="border border-secondary img_show bg-dark"><div class="bg-dark pbar" id="fullbar${n}"><div style="width: ${w}%; height: 5px; background: red;"></div></div></div><div class="item-info bg-dark p-2 border border-secondary w-100 rounded-bottom"><p class="h5">${title}</p><div class="row mb-2"><div class="col-12"><div class="bg-secondary" style="height: 5px; width: 100%; margin-top: 0.6rem"><div style="height: 5px; background-color: red; width: ${w}%"></div></div></div><div class="col-12"><p class="m-0 my-1" style="float:left">S${s_pretty} E${e_pretty}</p><p style="float: right" class="my-1">${current}/${duration} perc</p></div></div><a class="btn btn-success w-100" href="/series/${n}/${dir}/${s}/${e}">Play</a><p class="mt-1 mb-0">${desc}</p></div></div>`
}
function newOption(value){
    return `<option value="${value}">${value}</option`
}
function refresh(){
    let items = document.getElementById('items')
    items.innerHTML = ''
    fetch('/db.json')
    .then(response => response.json())
    .then(r => {
        for (let i = 0; i < r[id].length; i++) {
            if(r[id][i].type === 'series'){
                let current = Math.round(r[id][i].episode_progress.find(x=>x.filename == r[id][i].progress).current/60)
                let duration = Math.round(r[id][i].episode_progress.find(x=>x.filename == r[id][i].progress).duration/60)
                let dir = `${r[id][i].episode_progress[0].filename.split('_')[0]}`
                let w = (r[id][i].episode_progress.find(x=>x.filename == r[id][i].progress).current/r[id][i].episode_progress.find(x=>x.filename == r[id][i].progress).duration)*100
                items.innerHTML += newSeries(r[id][i].image, r[id][i].title, r[id][i].description, i, w, r[id][i].progress.split('_')[1], r[id][i].progress.split('_')[2].split('.')[0], dir, current, duration)
                document.getElementById(`fullbar${i}`).style.width = !(w>0) ? '0%' : '100%'
            }
            else{
                let w = (r[id][i].current/r[id][i].duration)*100
                let current = Math.round(r[id][i].current/60)
                let duration = Math.round(r[id][i].duration/60)
                items.innerHTML += newMovie(r[id][i].image,r[id][i].title,r[id][i].description, i, w, current, duration)
                document.getElementById(`fullbar${i}`).style.width = !(w>0) ? '0%' : '100%'
            }
        }
})
}
function refreshList(){
    let filenameSelect = document.getElementById('filenameSelect')
    fetch('/list')
    .then(res => res.json())
    .then(r => {
        filenameSelect.innerHTML = `<option selected value="0">Choose file</option>`
        for (let i = 0; i < r.length; i++) {
            filenameSelect.innerHTML += newOption(r[i])
        }
    })
}
function br(){
      fetch("/br", {method: 'POST', redirect: 'follow'})
        .then(response => response.json())
        .then(r => {
            let a = document.getElementById('br_count')
            a.innerHTML = `Bait count: ${r.count}`
            a.style = 'display: block!important'
        })
}
function addShow(){
    let image = document.getElementById('image')
    let title = document.getElementById('title')
    let desc = document.getElementById('desc')
    let fn = document.getElementById('filenameSelect')
    if(title.value.length == 0 || desc.value.length == 0 || fn.value.length == 0 || fn.value == 0) return
    let formData = new FormData()
    formData.append("image", image.files[0])
    formData.append("title", title.value)
    formData.append("description", desc.value)
    formData.append("filename", fn.value)
    fetch('/upload', {method: "POST", body : formData})
        .then(response => response.text)
        .then(r => refresh())
    image.value = ''
    title.value = ''
    desc.value = ''
    fn.value = ''
}
function deleteShow(n){
    if(!window.confirm("Are you sure?")) return
    let formData = new FormData()
    formData.append("n", n)
    fetch('/delete', {method: "POST", body: formData})
        .then(res => res.text)
        .then(r => refresh())
}
function logout(){
    fetch('/logout', {method: 'POST', redirect: 'follow'})
        .then(res => res.text())
        .then(r => {
            location.reload()
            window.open('/','_self')
        })
}
let id, file, type
function getID(n, fn, t){
    id = n
    file = fn
    type = t
}
function saveProgress(){
    let vid = document.getElementById('vid')
    let formData = new FormData()
    if(type == 'movie'){
        formData.append("current", vid.currentTime)
        formData.append("duration", vid.duration)
        formData.append("id", id)
        formData.append("type", type)
        fetch('/progress', {method: "POST", body: formData})
            .then(res => res.text)
            .then(r => {})
    }
    else{
        formData.append("current", vid.currentTime)
        formData.append("duration", vid.duration)
        formData.append("id", id)
        formData.append("type", type)
        formData.append("filename", file)
        fetch('/progress', {method: "POST", body: formData})
            .then(res => res.text)
            .then(r => {})
    }
}
function progressBar(){
    let vid = document.getElementById('vid')
    document.getElementById('p').style.width = `${(vid.currentTime/vid.duration)*100}%`
}
function setProfile(profileID){
    let formData = new FormData()
    formData.append('profileID', profileID)
    fetch('/setprofile', {method: "POST", body: formData})
        .then(res => res.text)
        .then(r => {
            location.reload()
            window.open('/','_self')
        })
}
function toggleEdit(){
    let edit = document.getElementsByClassName('edit-div')
    let profile = document.getElementsByClassName('profile')
    let b = document.getElementById('edit')
    for (let i = 0; i < edit.length; i++) {
        edit[i].classList.toggle('d-none')
        if(!profile[i].getAttribute('onclick').includes('show')) profile[i].setAttribute('onclick', `showEdit(${i})`)
        else profile[i].setAttribute('onclick', `setProfile(${i})`)
    }
    if(b.innerHTML.includes('Edit')) b.innerHTML = 'Done'
    else b.innerHTML = 'Edit profiles'
}
function showEdit(n){
    let modal = new bootstrap.Modal(document.getElementById('editModal'))
    document.getElementById('id').innerHTML = n
    document.getElementById('name').value = document.getElementsByClassName('p-name')[n].innerHTML
    modal.show()
}
function editProfile(){
    let image = document.getElementById('image')
    let name = document.getElementById('name')
    if(name.value.length == 0) return
    let formData = new FormData()
    formData.append("id", document.getElementById('id').innerHTML)
    formData.append("image", image.files[0])
    formData.append("name", name.value)
    fetch('/editprofile', {method: "POST", body : formData})
        .then(response => response.text)
        .then(r => {
            location.reload()
            window.open('/profile','_self')
        })
}
function undo(){
    fetch('/undo')
        .then(res => res.text)
        .then(r => refresh())
}
function redo(){
    fetch('/redo')
        .then(res => res.text)
        .then(r => refresh())
}
let autohide = document.querySelector('.autohide');
let navbar_height = document.querySelector('.navbar').offsetHeight;
if(autohide){
    var last_scroll_top = window.scrollY;
    window.addEventListener('scroll', function() {
        let scroll_top = window.scrollY;
        if(scroll_top < last_scroll_top) {
            autohide.classList.remove('scrolled-down');
            autohide.classList.add('scrolled-up');
            console.log(scroll_top + ' ' + last_scroll_top);
        }
        else{
            autohide.classList.remove('scrolled-up');
            autohide.classList.add('scrolled-down');
        }
        last_scroll_top = scroll_top;
    }); 
}