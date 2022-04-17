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
function newItem(img, title, desc, n, w, current, duration){
    return `<div class="col-sm-4 col-lg-3 col-6 p-0 item"><img src="/assets/delete.png" class="d-none delete_img img-fluid btn btn-danger position-absolute" onclick="deleteShow(${n})" style="height: 30px; margin: 5px; right: 0;"><div style="background-image: url('/assets/${img}'); display: flex; align-items: end;" class="border border-secondary img_show bg-dark"><div class="bg-dark pbar" id="fullbar${n}"><div style="width: ${w}%; height: 5px; background: red;"></div></div></div><div class="item-info d-none bg-dark p-2 border border-secondary w-100 rounded-bottom"><p class="h5">${title}</p><div class="row mb-2"><div class="col-sm-7"><div class="bg-secondary" style="height: 5px; width: 100%; margin-top: 0.6rem"><div style="height: 5px; background-color: red; width: ${w}%"></div></div></div><div class="col-sm-5 p-sm-0"><p class="m-0 text-left">${current}/${duration} perc</p></div></div><a class="btn btn-success w-100" href="/movie/${n}">Play</a><p class="m-0">${desc}</p></div></div>`
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
            let w = (r[id][i].current/r[id][i].duration)*100
            let current = Math.round(r[id][i].current/60)
            let duration = Math.round(r[id][i].duration/60)
            items.innerHTML += newItem(r[id][i].image,r[id][i].title,r[id][i].description, i, w, current, duration)
            document.getElementById(`fullbar${i}`).style.width = !(w>0) ? '0%' : '100%'
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
let id
function getID(n){
    id = n
}
function saveProgress(){
    let vid = document.getElementById('vid')
    let formData = new FormData()
    formData.append("current", vid.currentTime)
    formData.append("duration", vid.duration)
    formData.append("id", id)
    fetch('/progress', {method: "POST", body: formData})
        .then(res => res.text)
        .then(r => {})
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