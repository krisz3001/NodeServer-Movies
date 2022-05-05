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
//<a class="btn btn-success w-100" href="/movie/${n}">Play</a>
function newMovie(img, title, desc, n, w, current, duration){
    return `<div class="col-sm-6 col-md-4 col-lg-3 col-12 p-0 item movie"><img src="/assets/delete.png" class="d-none delete-show img-fluid btn btn-danger position-absolute" onclick="deleteShow(${n})" style="height: 30px; margin: 5px; right: 0;"><div style="background-image: url('/assets/${img}'); display: flex; align-items: end;" class="border border-secondary img_show bg-dark"><div class="bg-dark pbar" id="fullbar${n}"><div style="width: ${w}%; height: 5px; background: red;"></div></div></div><div class="item-info bg-dark p-2 border border-secondary w-100 rounded-bottom"><div class="row m-0 mb-1"><a class="col-2 play rounded-circle" href="/movie/${n}"></a><div class="col-8"></div><a class="col-2 details rounded-circle" onclick="details(${n}, 'movie', '${img}', '${w}', '${current}', '${duration}', '/movie/${n}')"></a></div><p class="h5" id="cardTitle${n}">${title}</p><div class="d-flex align-items-center"><div class="bg-secondary w-100" style="height: 5px;"><div style="height: 5px; background-color: red; width: ${w}%"></div></div><div><p class="my-1 text-nowrap p-1" style="font-size: small;">${current}/${duration} ${duration > 1 ? 'minutes' : 'minute'}</p></div></div><p class="mt-1 mb-0 desc" id="cardDescription${n}">${desc}</p></div></div>`
}
function newSeries(img, title, desc, n, w, s, e, dir, current, duration, seasons, episodes){
    let s_pretty = s < 10 ? `0${s}` : s
    let e_pretty = e < 10 ? `0${e}` : e
    return `<div class="col-sm-6 col-md-4 col-lg-3 col-12 p-0 item series"><img src="/assets/delete.png" class="d-none delete-show img-fluid btn btn-danger position-absolute" onclick="deleteShow(${n})" style="height: 30px; margin: 5px; right: 0;"><div style="background-image: url('/assets/${img}'); display: flex; align-items: end;" class="border border-secondary img_show bg-dark"><div class="bg-dark pbar" id="fullbar${n}"><div style="width: ${w}%; height: 5px; background: red;"></div></div></div><div class="item-info bg-dark p-2 border border-secondary w-100 rounded-bottom"><div class="row m-0 mb-1"><a class="col-2 play rounded-circle" href="/series/${n}/${dir}/${s}/${e}"></a><div class="col-8"></div><a class="col-2 details rounded-circle" onclick="details(${n}, 'series', '${img}', '${w}', '${current}', '${duration}', '/series/${n}/${dir}/${s}/${e}', '${s_pretty}', '${e_pretty}', '${seasons}', [${episodes}])"></a></div><p class="h5" id="cardTitle${n}">${title}</p><div class="row mb-2"><div class="col-12"><div class="bg-secondary" style="height: 5px; width: 100%; margin-top: 0.6rem"><div style="height: 5px; background-color: red; width: ${w}%"></div></div></div><div class="col-12"><p class="m-0 my-1" style="float:left">S${s_pretty} E${e_pretty}</p><p style="float: right" class="my-1">${current}/${duration} ${duration > 1 ? 'minutes' : 'minute'}</p></div></div><p class="mt-1 mb-0 desc" id="cardDescription${n}">${desc}</p></div></div>`
}
function newOption(value){
    return `<option value="${value}">${value}</option`
}
function refresh(){
    let items = document.getElementById('items')
    items.innerHTML = ''
    let categories = []
    fetch('/categories')
    .then(res => res.json())
    .then(r => {
        categories = r
    })
    .then(x => {
        fetch('/db.json')
        .then(res => res.json())
        .then(r => {
            for (let j = 0; j < categories.length; j++) {
                items.innerHTML += `<h1 class="mb-2 mt-5 p-0">${categories[j]}</h1>`
                for (let i = 0; i < r[id].length; i++) {
                    if(r[id][i].type === 'series' && r[id][i].category === categories[j]){
                        let current = Math.round(r[id][i].episode_progress.find(x=>x.filename == r[id][i].progress).current/60)
                        let duration = Math.round(r[id][i].episode_progress.find(x=>x.filename == r[id][i].progress).duration/60)
                        let dir = `${r[id][i].episode_progress[0].filename.split('_')[0]}`
                        let w = (r[id][i].episode_progress.find(x=>x.filename == r[id][i].progress).current/r[id][i].episode_progress.find(x=>x.filename == r[id][i].progress).duration)*100
                        items.innerHTML += newSeries(r[id][i].image, r[id][i].title, r[id][i].description, i, w, r[id][i].progress.split('_')[1], r[id][i].progress.split('_')[2].split('.')[0], dir, current, duration, r[id][i].seasons, r[id][i].episodes)
                        document.getElementById(`fullbar${i}`).style.width = !(w>0) ? '0%' : '100%'
                    }
                    else if(r[id][i].category === categories[j]){
                        let w = (r[id][i].current/r[id][i].duration)*100
                        let current = Math.round(r[id][i].current/60)
                        let duration = Math.round(r[id][i].duration/60)
                        items.innerHTML += newMovie(r[id][i].image,r[id][i].title,r[id][i].description, i, w, current, duration)
                        document.getElementById(`fullbar${i}`).style.width = !(w>0) ? '0%' : '100%'
                    }
                }
            }
        })
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
function refreshCategoryList(){
    let categorySelect = document.getElementById('categorySelect')
    fetch('/categories')
    .then(res => res.json())
    .then(r => {
        categorySelect.innerHTML = `<option selected value="0">Choose category</option>`
        for (let i = 0; i < r.length; i++) {
            categorySelect.innerHTML += newOption(r[i])
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
    let category = document.getElementById('categorySelect')
    if(title.value.length == 0 || desc.value.length == 0 || fn.value.length == 0 || fn.value == 0 || category.value == 0) return
    let formData = new FormData()
    formData.append("image", image.files[0])
    formData.append("title", title.value)
    formData.append("description", desc.value)
    formData.append("filename", fn.value)
    formData.append("category", category.value)
    fetch('/upload', {method: "POST", body : formData})
        .then(response => response.text)
        .then(r => refresh())
    image.value = ''
    title.value = ''
    desc.value = ''
    fn.value = ''
    category.value = ''
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
        fetch('/setprogress', {method: "POST", body: formData})
            .then(res => res.text)
            .then(r => {})
    }
    else{
        formData.append("current", vid.currentTime)
        formData.append("duration", vid.duration)
        formData.append("id", id)
        formData.append("type", type)
        formData.append("filename", file)
        fetch('/setprogress', {method: "POST", body: formData})
            .then(res => res.text)
            .then(r => {})
    }
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
if(autohide){
    var last_scroll_top = window.scrollY;
    window.addEventListener('scroll', function() {
        let scroll_top = window.scrollY;
        if(scroll_top < last_scroll_top) {
            autohide.classList.remove('scrolled-down');
            autohide.classList.add('scrolled-up');
        }
        else{
            autohide.classList.remove('scrolled-up');
            autohide.classList.add('scrolled-down');
        }
        last_scroll_top = scroll_top;
    }); 
}
function newEpisode(n, image, duration, w, link){
    return `<a class="row border-top border-bottom border-secondary p-2 episode text-decoration-none text-white" href="${link}"><div class="col-2 d-flex align-items-center justify-content-center fs-3">${n}</div><div class="col-4 rounded p-0" style="background-image: url('/assets/${image}'); aspect-ratio: 16/9; background-size: contain; background-repeat: no-repeat;"><div class="d-flex align-items-center justify-content-center h-100"><div class="episodePlayBtn rounded-circle opacity-0" style="width: calc(100% / 4); aspect-ratio: 1/1; background-image: url(/assets/play.png); background-size: contain;"></div></div><div class="bg-secondary w-100 rounded-bottom overflow-hidden"><div style="width: ${w}%; height: 5px; background: red;"></div></div></div><div class="col-6"><div class="d-flex flex-column justify-content-sm-between flex-sm-row fw-bold"><p class="m-0">Episode ${n}</p><p>${duration} ${duration > 1 ? 'minutes' : 'minute'}</p></div></div></a>`
}
function refreshEpisodes(n){
    let season = document.getElementById('seasonSelect').value
    let episodes = document.getElementById('episodeList')
    episodes.innerHTML = ''
    fetch('/db.json')
    .then(res => res.json())
    .then(r => {
        let start = 0
        for (let i = 0; i < season-1; i++) {
            start += r[id][n].episodes[i]
        }
        for (let i = 0; i < r[id][n].episodes[season-1]; i++) {
            let current = r[id][n].episode_progress[i+start].current
            let duration = r[id][n].episode_progress[i+start].duration
            let w = current/duration*100
            duration = Math.round(duration/60)
            let fn = r[id][n].episode_progress[i+start].filename
            let link = `/series/${n}/${fn.split('_')[0]}/${fn.split('_')[1]}/${fn.split('_')[2].split('.')[0]}`
            episodes.innerHTML += newEpisode(i+1, r[id][n].image, duration, w, link)
        }
    })      
}
function details(n, show_type, img, w, current, duration, link, s, e, seasons, episodes){
    let m = new bootstrap.Modal(document.getElementById('sModal'))
    document.getElementById('detailsImage').style.backgroundImage = `url('/assets/${img}')`
    document.getElementById('detailsDescription').innerText = document.getElementById('cardDescription' + n).innerText
    document.getElementById('detailsProgress').style.width = `${w}%`
    document.getElementById('sModalLabel').innerHTML = document.getElementById('cardTitle' + n).innerText
    document.getElementById('detailsMinutes').innerText = `${current}/${duration} ${duration > 1 ? 'minutes' : 'minute'}. ${duration-current} ${duration-current > 1 ? 'minutes' : 'minute'} remaining.`
    document.getElementById('detailsEpisodes').classList.add('d-none')
    document.getElementById('detailsEpisodes').classList.remove('d-block')
    document.getElementById('detailsPlay').setAttribute('href', link)
    document.getElementById('detailsCurrentEpisode').innerText = ``
    if(show_type == 'series'){
        document.getElementById('detailsCurrentEpisode').innerText = `S${s} E${e}`
        document.getElementById('detailsEpisodes').classList.add('d-block')
        document.getElementById('detailsEpisodes').classList.remove('d-none')
        let select = document.getElementById('seasonSelect')
        select.innerHTML = ''
        document.getElementById('seasonSelect').setAttribute("onchange", `refreshEpisodes(${n})`)
        for (let i = 0; i < seasons; i++) {
            let option = document.createElement('option')
            option.text = `Season ${i+1} (${episodes[i]} episodes)`
            option.value = `${i+1}`
            if(i+1 == s) option.selected = true
            select.add(option)
        }
        refreshEpisodes(n)
    }
    m.show()
}
function deleteMode(){
    let del = document.getElementsByClassName('delete-show');
    for (let i = 0; i < del.length; i++) {
        del[i].classList.toggle('delete_img')
    }
}
let toggleCompleted = 0
function refreshTodo(c){
    fetch('/todo')
    .then(res => res.json())
    .then(r => {
        let todo = document.getElementById('todo')
        todo.innerHTML = ''
        for (let i = 0; i < r.length; i++) {
            if(toggleCompleted == 0 && !r[i].completed) todo.innerHTML += `<li onclick="lineOut(${i})">${r[i].todo}</li>`
            else if(toggleCompleted == 1) todo.innerHTML += `<li onclick="lineOut(${i})">${r[i].completed ? '<del>' : ''}${r[i].todo}${r[i].completed ? '</del>' : ''}</li>`
        }
    })
}
function showCompleted(){
    document.getElementById('completedBtn').innerHTML = toggleCompleted == 0 ? 'Hide completed' : 'Show completed' 
    toggleCompleted = toggleCompleted == 0 ? 1 : 0
    refreshTodo(toggleCompleted)
}
function addTodo(){
    let formData = new FormData()
    formData.append("todo", document.getElementById('new-todo').value)
    document.getElementById('new-todo').value = ''
    fetch('/todo', {method: "POST", body : formData})
        .then(response => response.json())
        .then(r => refreshTodo(toggleCompleted))
}
function lineOut(n){
    let formData = new FormData()
    formData.append("id", n)
    fetch('/completed', {method: "POST", body: formData})
    .then(res => res.text)
    .then(r => refreshTodo(toggleCompleted))
}
document.getElementById('new-todo').addEventListener("keydown", function(e){
    if(e.keyCode === 13) document.getElementById('add-todo-btn').click()
})
function randomMovie(){
    fetch('/random', {method: 'POST'})
    .then(res => res.text())
    .then(r => {
        if(r == 'nomoviefound') window.open(`/`,'_self')
        else window.open(`/movie/${r}`,'_self')
    })
}