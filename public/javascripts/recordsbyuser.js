window.onload = function() {
    let cal = document.getElementById('ruserdates');
    cal.flatpickr({
        dateFormat: "Y-m-d",
        mode: "range",
        inline: false,
        "locale": "es",
        //maxDate: new Date().fp_incr(-1)
    });
}

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

function ruserReport(event){
    event.preventDefault();
    let user = (event.target.ruseruser.value).split(' ')[0];
    let ruserdates = (event.target.ruserdates.value).split(' a ');
    !ruserdates[1] ? ruserdates.push(ruserdates[0]) : null;
    
    if(ruserdates.toString() !=',' && user) {
        fetch('recordsbyuser?start='+ruserdates[0]+'&end='+ruserdates[1]+'&user='+user)
        .then(res=> res.json())
        .then(json=>{
            let html = `
                <table class="table table-hover table-bordered bg-light text-left">
                <thead class="table-dark">
                    <tr>
                        <th class="col-1" scope="col">👀</th>
                        <th class="col-5" scope="col">Fecha</th>
                        <th class="col-3" scope="col">Tiempo trabajado</th>
                        <th class="col-3" scope="col">Tiempo de descaso</th>
                    </tr>
                </thead>
                <tbody id="">`;
            for(element in json){
                let diaEnTexto = new Date(json[element].diaString).toLocaleDateString("es-ES", {year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'});
                let id = 'id'+json[element].dia.split('-').join('');
                html+= `
                <tr>
                    <!-- <th scope="col">${json[element].dia}</th> -->
                    <td>
                        <span type="button" data-bs-toggle="collapse" data-bs-target="#${id}" aria-expanded="false" aria-controls="collapseExample">👀</span>
                    </td>
                    <td>${diaEnTexto}</td>
                    <td class="${json[element].tiempoTrabajadoClass}">${json[element].tiempoTrabajado}</td>
                    <td class="${json[element].tiempoDescansoClass}">${json[element].tiempoDescanso}</td>
                </tr>
                <tr class="collapse bg-primary" id="${id}">
                    <td colspan="4">
                        <table class="table table-hover table-bordered bg-light text-left">
                            <thead class="table-dark">
                                <tr>
                                    <th class="col-1" scope="col">Empresa</th>
                                    <th class="col-6" scope="col">Tarea</th>
                                    <th class="col-2" scope="col">Tiempo</th>
                                    <th class="col-2" scope="col">Horas</th>
                                    <th style="display:flex;" scope="col"><span>✏️</span><span>🗑️</span><span>💬</span></th>
                                </tr>
                            </thead>
                            <tbody>`;
                            for(i in json[element].registros){
                                html += `
                                <tr>
                                    <td>${json[element].registros[i].cliente}</td> 
                                    <td>${json[element].registros[i].descripcionServicio}</td>
                                    <td>${json[element].registros[i].horaInicio} - ${json[element].registros[i].horaFin}</td>
                                    <td>${json[element].registros[i].duracion}</td>
                                    <td style="display:flex;">
                                        <span type="button" data-bs-toggle="modal" data-bs-target="#editModal${json[element].registros[i].id}">✏️</span>
                                        <span type="button" data-bs-toggle="modal" data-bs-target="#delMoldal${json[element].registros[i].id}">🗑️</span>
                                        ${json[element].registros[i].observaciones ? '<span data-bs-toggle="tooltip" data-bs-placement="left" title="">💬</span>' : ''}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                <!-- Start Delete record modal -->
                                <div class="modal fade" id="delMoldal${json[element].registros[i].id}" tabindex="-1" aria-labelledby="delMoldal${json[element].registros[i].id}Label" aria-hidden="true">
                                    <div class="modal-dialog">
                                        <div class="modal-content">
                                        <div class="modal-header alert-danger">
                                            <h5 class="modal-title" id="delMoldal${json[element].registros[i].id}Label">Eliminar registro</h5>
                                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div class="modal-body">
                                            Esta acción no se puede deshacer. <br>
                                            Se va a borrar: ${json[element].registros[i].duracion} de ${json[element].registros[i].nombreUsuario} en ${json[element].registros[i].cliente}, ${json[element].registros[i].descripcionServicio}.<br>
                                            ¿Eliminar?
                                        </div>
                                        <div class="modal-footer">
                                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No</button>
                                            <button type="button" class="btn btn-success" onclick="delRecord(${json[element].registros[i].id})">Sí</button>
                                        </div>
                                        </div>
                                    </div>
                                </div>
                                <!-- End Delete record modal -->
                                <!-- Start Edit record Modal -->
                                <div class="modal fade" id="editModal${json[element].registros[i].id}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="editModal${json[element].registros[i].id}Label" aria-hidden="true">
                                    <div class="modal-dialog">
                                        <form action="/admin/updateRecord/${json[element].registros[i].id}" method="post">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="editModal${json[element].registros[i].id}Label">Editar registro ${json[element].registros[i].id}</h5>
                                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                </div>
                                                
                                                    <div class="modal-body">
                                                        <input type="text" hidden value="${json[element].registros[i].id}">
                                                        <div class="mb-1 row">
                                                            <label for="editRecordCliente" class="col-sm-2 col-form-label">Empleado</label>
                                                            <div class="col-sm-10">
                                                                <input type="text" class="form-control" value="${json[element].registros[i].nombreUsuario}" disabled readonly>
                                                            </div>
                                                        </div>
                                                        <div class="mb-1 row">
                                                            <label class="col-sm-2 col-form-label">Cliente</label>
                                                            <div class="col-sm-10">
                                                                <select class="form-select" aria-label="select cliente" name="cliente" id="editRecordCliente_${json[element].registros[i].id}" id2="${json[element].registros[i].id}" onchange="cargarServicios(event)">
                                                                    <option selected value="${json[element].registros[i].cliente}">${json[element].registros[i].cliente}</option> `;
                                                                    for(j in json[element].registros[i].empresas){
                                                                        html += `
                                                                        <option value="${json[element].registros[i].empresas[j].Empresa}">${json[element].registros[i].empresas[j].Empresa}</option>`
                                                                    };
                                                        
                                                                html += `</select>
                                                            </div>
                                                        </div>
                                                        <div class="mb-1 row">
                                                            <label class="col-sm-2 col-form-label">Servicio</label>
                                                            <div class="col-sm-10">
                                                                <select class="form-select" aria-label="select servicio" name="descripcionServicio" id="editDescripcionServicio_${json[element].registros[i].id}" onfocus="sinServiciosCargados(event, '${json[element].registros[i].cliente}')">
                                                                    <option selected value="${json[element].registros[i].codigoServicio}">${json[element].registros[i].descripcionServicio}</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div class="mb-1 row">
                                                            <label class="col-sm-2 col-form-label">Fecha</label>
                                                            <div class="col-sm-10">
                                                            <input  class="form-control" type="date" id="start" name="dia" value="${json[element].registros[i].dia}">
                                                            </div>
                                                        </div>
                                                        <div class="mb-1 row">
                                                            <label class="col-sm-2 col-form-label">Inicio</label>
                                                            <div class="col-sm-10">
                                                            <input  class="form-control" type="time" id="" name="horaInicio" value="${json[element].registros[i].horaInicio}">
                                                            </div>
                                                        </div>
                                                        <div class="mb-1 row">
                                                            <label class="col-sm-2 col-form-label">Fin</label>
                                                            <div class="col-sm-10">
                                                            <input  class="form-control" type="time" id="" name="horaFin" value="${json[element].registros[i].horaFin}">
                                                            </div>
                                                        </div> 
                                                        <div class="mb-1 row">
                                                            <label class="col-sm-2 col-form-label">Notas</label>
                                                            <div class="col-sm-10">
                                                            <textarea class="form-control" id="" name="observaciones">${json[element].registros[i].observaciones}</textarea>
                                                            </div>
                                                        </div>                                                                                                                     
                                                    </div>
                                                    <div class="modal-footer">
                                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Descartar</button>
                                                        <button type="submit" class="btn btn-primary">Guardar</button>
                                                    </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                                <!-- End Edit record Modal -->
                                    </td>
                                </tr>
                                `;
                            }
                            html+= 
                            `</tbody>
                        </table>`;
                html +=
                    `</td>
                </tr>                
                `
            };
            html+= `
                </tbody>
            </table>
            `;
            console.log(html)
            document.getElementById('ruserResult').innerHTML = html;
        }) 
    }
}


