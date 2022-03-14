window.onload = function(){
    cargarCalendario("/admin/calendar");
}

async function cargarCalendario(url){
    let defaultDates = [];
    let allHolidays = await getDataFromCalendar(url);
    allHolidays.forEach(element => { defaultDates.push(element.dia); });
    //set days on calendar
    let cal = document.getElementById('addDays');
    cal.flatpickr({
        dateFormat: "Y-m-d",
        minDate: new Date().fp_incr(1),
        mode: "multiple",
        inline: true, //para que se muestre siempre sin clickar
        "locale": "es",
        defaultDate: defaultDates,
        //disable: ["2022-03-22", "2022-03-24"],
        //enable: datesEnabled,
        //disable: ["2025-01-30", "2025-02-21", "2025-03-08", new Date(2025, 4, 9) ],
        /* 
        onChange: function(dObj, dStr, fp, dayElem){
            console.log('dStr', dStr);
        } 
        */
    });

    //set days on list
    let ul = document.getElementById('list');
    for(let i = 0; i< allHolidays.length;i++){
        let day = allHolidays[i].dia;
        let dia = day.slice(8,10)+'/'+day.slice(5,7)+'/'+day.slice(0,4);
        if(allHolidays[i].notas !== null){
            ul.innerHTML += '<li>'+dia + ' ' + allHolidays[i].notas+'</li>';
        } else {
            ul.innerHTML += '<li>'+dia +'</li>';
        }
    }
}

async function getDataFromCalendar(url){
    try {
        const response = await fetch(url, {
            method: 'GET',
        });
        const dates = await response.json();
        return dates;
    } catch (error) {
        console.error(error);
    }
}