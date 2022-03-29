window.onload = function() {
    let hora = ((document.getElementById('horaFin')).value).split(':');
    let dia = ((document.getElementById('fechaFin')).value).split('/');
    let horaI = ((document.getElementById('horaInicio')).value).split(':');
    let diaI = ((document.getElementById('fechaInicio')).value).split('/');
    let duracion = document.getElementById('duracion');
    
    let date = new Date();
    date.setFullYear(parseInt(dia[2]),parseInt(dia[1])-1,parseInt(dia[0]));
    date.setHours(parseInt(hora[0]),parseInt(hora[1]),parseInt(hora[2]));
    
    let inicio = new Date();
    inicio.setFullYear(parseInt(diaI[2]),parseInt(diaI[1])-1,parseInt(diaI[0]));
    inicio.setHours(parseInt(horaI[0]),parseInt(horaI[1]),parseInt(horaI[2]));
    
    let dif = (date - inicio);
    let hhmmss = secondsToHHMM(dif);
    let diff = new Date();
    diff.setHours(hhmmss[0], hhmmss[1], hhmmss[2], hhmmss[3]);
            
    setInterval(() => {
         date.setMilliseconds(date.getMilliseconds()+1000);
         document.getElementById('horaFin').value = date.toLocaleTimeString();
         diff.setMilliseconds(diff.getMilliseconds()+1000);
         duracion.innerHTML = diff.toLocaleTimeString();
    }, 1000);
    
    setInterval(()=>{
        location.reload();
    }, 60000);

    function secondsToHHMM(sec){
        let ms = sec%1000;
        sec = (sec-ms)/1000;
        let ss = sec%60;
        sec = (sec-ss)/60;
        let mm = sec%60;
        sec = (sec-mm)/60;
        let hh = sec%24;
        return [hh,mm,ss,ms];
    }
}
