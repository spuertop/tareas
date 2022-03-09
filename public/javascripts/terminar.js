window.onload = function() {
    let hora = ((document.getElementById('horaFin')).value).split(':');
    let dia = ((document.getElementById('fechaFin')).value).split('/');
    let date = new Date();
    date.setFullYear(dia[2],dia[1]+1,dia[0]);
    date.setHours(hora[0],hora[1],hora[2]);
    
    setInterval(() => {
         date.setMilliseconds(date.getMilliseconds()+1000);
         document.getElementById('horaFin').value = date.toLocaleTimeString();
    }, 1000);
    
    setInterval(()=>{
        location.reload();
    }, 60000)
}
