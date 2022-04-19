async function delRecord(id){
    await fetch('/admin/delRecord?id='+id)
    .then(location.reload(true))
    .catch(error=>console.log(error));
}

function sinServiciosCargados(e, empresa){
    if(e.target.length == 1) {
        fetch('/admin/getServicios/'+empresa)
        .then(res=>res.json())
        .then(json=>{
            for(item in json){
                let option = document.createElement("option");
                option.text = json[item].Descripcion;
                option.value = json[item].Codigo;
                e.target.appendChild(option);
            }
        })
    }
}

function cargarServicios(e){
    let empresa = e.target.options[e.target.selectedIndex].text;
    console.log(empresa)
    let id = e.target.getAttribute('id2');
    let selectServicios = document.getElementById('editDescripcionServicio_'+id);
    fetch('/admin/getServicios/'+empresa)
        .then(res=>res.json())
        .then(json=>{
            selectServicios.length = 0;
            for(item in json){
                console.log(item)
                let option = document.createElement("option");
                option.text = json[item].Descripcion;
                option.value = json[item].Codigo;
                selectServicios.appendChild(option);
            }
        })
}

