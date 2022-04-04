window.onload = function() {
    let modals = document.querySelectorAll('.modal');
    modals.forEach(item => {
        item.addEventListener('shown.bs.modal', function(e) {
            (e.target).querySelectorAll('input')[1].focus();
        })
    });
  
}

function signinPost(usuario) {
    let inputs = usuario.querySelectorAll('input');
    let data = { user : inputs[0].value, pass : inputs[1].value};
    fetch('/signin', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow'
    })
    .then(res => {
        window.location.href = res.url;
    })
    .catch(error => console.error('Error:', error))

}

function searchUser() {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById('search');
    filter = input.value.toUpperCase();
    //console.log(filter);
    ul = document.getElementById("ulUsers");
    li = ul.getElementsByTagName('li');
    //console.log(li[0]);

    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("h1")[0];
        txtValue = a.innerText;
        //console.log(txtValue);
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].parentElement.style.display = "";
        } else {
            li[i].parentElement.style.display = "none";
        }
    }
}  