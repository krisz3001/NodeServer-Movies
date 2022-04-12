function expand(){
    //document.getElementById('items').innerHTML += newItem('placeholder.jpg','Title','Description')
    let formData = new FormData()
    formData.append("title", "Title")
    formData.append("description", "Description")
    fetch('/upload', {method: "POST", body : formData})
        .then(response => response.text)
        .then(r => refresh())
}
function newItem(img, title, desc, n){
    return `<div class="col-sm-4 col-lg-3 col-6 p-0 item"><img src="/assets/delete.png" class="d-none delete_img img-fluid btn btn-danger position-absolute" onclick="deleteShow(${n})" style="height: 30px; margin: 5px;"><img src="/assets/${img}" class="img-fluid border border-secondary"><div class="item-info d-none bg-dark p-2 border border-secondary w-100 rounded-bottom"><p class="h5">${title}</p><a class="btn btn-success w-100" target="_blank" href="https://www.youtube.com/watch?v=RWSnR2oKR5o">Play</a><p class="text-justify m-0">${desc}</p></div></div>`
}
function refresh(){
    let items = document.getElementById('items')
    items.innerHTML = ''
    fetch('/db.json')
    .then(response => response.json())
    .then(r => {
        for (let i = 0; i < r.length; i++) {
         items.innerHTML += newItem(r[i].image,r[i].title,r[i].description, i)
        }
})
}
function br(){
      fetch("/br", {method: 'POST', redirect: 'follow'})
        .then(response => response.json())
        .then(r => {
            let a = document.getElementById('br_count')
            a.innerHTML = `Count: ${r.count}`
            a.style = 'display: block!important'
        })
}
function addShow(){
    let image = document.getElementById('image')
    let title = document.getElementById('title')
    let desc = document.getElementById('desc')
    if(title.value.length == 0 || desc.value.length == 0) return
    let formData = new FormData()
    formData.append("image", image.files[0])
    formData.append("title", title.value)
    formData.append("description", desc.value)
    fetch('/upload', {method: "POST", body : formData})
        .then(response => response.text)
        .then(r => refresh())
    image.value = ''
    title.value = ''
    desc.value = ''
}
function deleteShow(n){
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