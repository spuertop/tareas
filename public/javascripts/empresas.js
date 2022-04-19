function setCentroCliente(e){
    let centro = document.getElementById('centro').value;
    let empresa = e.target.value;
    let href = `/users/empresa?name=${empresa}&centro=${centro}`
    window.location.href = href;
}


