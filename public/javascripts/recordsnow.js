function nowUserSearch(){
    let input, filter, ul, li, a, i, txtValue;
    input = document.getElementById('nowUserSearch');
    filter = input.value.toUpperCase();
    ul = document.getElementById("nowTable");
    li = ul.getElementsByTagName("tr");

    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("th")[0];
        txtValue = a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}
