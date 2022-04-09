function expand(){
    document.getElementById('items').innerHTML += `<div class="col-sm-4 col-lg-3 col-6 p-0" id="item"><img src="assets/placeholder.jpg" class="img-fluid border" id="item-img"><div class="d-none bg-dark p-2 border w-100" id="item-info"><p class="h5" id="item-title">Title</p><input type="button" value="Play" class="btn btn-success w-100"><p class="text-justify m-0" id="item-desc">Description</p></div></div>`
}
function info(e){
    e.innerHTML += '<p class="text-white"></p>'
}
fetch('/db.json')
.then(response => response.json())
.then(r => {
    for (let i = 0; i < r.length; i++) {
        document.getElementById('items').innerHTML += `<div class="col-sm-4 col-lg-3 col-6 p-0" id="item"><img src="assets/${r[i].image}" class="img-fluid border"><div id="item-info" class="d-none bg-dark p-2 border w-100"><p class="h5">${r[i].title}</p><input type="button" value="Play" class="btn btn-success w-100"><p class="text-justify m-0">${r[i].description}</p></div></div>`
    }
})
function br(){
      fetch("/br", {method: 'POST', redirect: 'follow'})
        .then(response => response.json())
        .then(r => {
            let a = document.getElementById('br_count')
            a.innerHTML = `Count: ${r.count}`
            a.style = 'display: block!important'
        })
}