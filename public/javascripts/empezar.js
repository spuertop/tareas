window.onload = function () {
    let hora = ((document.getElementById('hora')).value).split(':');
    let dia = ((document.getElementById('fecha')).value).split('/');
    let date = new Date();
    
    date.setFullYear(dia[2], dia[1] + 1, dia[0]);
    
    date.setHours(hora[0], hora[1], hora[2]);
    

    setInterval(() => {
        date.setMilliseconds(date.getMilliseconds() + 1000);
        document.getElementById('hora').value = date.toLocaleTimeString();
    }, 1000);

    setInterval(()=>{
        location.reload();
    }, 60000);
}
