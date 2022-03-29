window.onload = function() {
    let addmodal = document.getElementById('addRecord');
    addmodal.addEventListener('shown.bs.modal', function(e) {
        document.getElementById('search').focus();
        getAppiaUsers();
    });
}

//Esta debe coger todos los usuarios, no solo los filtrados que no tengan admin panel
async function getAppiaUsers(){
    const response = await fetch('/admin/appiausers');
    const names = await response.json();
    let usersDiv = document.getElementById('appiaUsers');
    let text = '';
    for(let i = 0; i< names.length; i++){
        text += `
        <button type="button" onclick="addThisUser('${names[i].Nombre}','${names[i].Usuario}')" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
            <div>${names[i].Nombre} (${names[i].Usuario})</div>
            <div><span>➕</span></div>
        </button>
        `
    }
    document.getElementById('spinner')?.remove();
    usersDiv.innerHTML = text;
}

async function delRecord(id){
    await fetch('/admin/delRecord?id='+id)
    .then(location.reload(true))
    .catch(error=>console.log(error));
}

function addThisUser(nombre, usuario) {
    let data = {nombre, usuario};
    fetch('/admin/addnewuser', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'}
    }).then(location.reload(true))
      .catch(error=>console.log(error));
}

async function deleteuser(id){
    await fetch('/admin/deleteuser?id='+id)
    .then(location.reload(true))
    .catch(error=>console.log(error));
}

function searchUser() {
    let input, filter, ul, li, a, i, txtValue;
    input = document.getElementById('search');
    filter = input.value.toUpperCase();
    //console.log(filter);
    ul = document.getElementById("appiaUsers");
    li = ul.getElementsByTagName("button");

    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("div")[0];
        txtValue = a.innerText;
        //console.log(txtValue);
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].classList.add("d-flex");
            li[i].style.display = "";
        } else {
            li[i].classList.remove("d-flex");
            li[i].style.display = "none";
            
        }
    }
}  