'use strict';

function tables_init(){
    let tables = document.getElementsByTagName('table');

    for(let i = 0; i < tables.length; i++){
        let headers = Array.from(tables[i].firstElementChild.firstElementChild.children);

        for(let header in headers){
            headers[header].innerHTML += '<input onclick="tables_sort(this,' + header + ',1)" type=button value=↑>'
              + '<input onclick="tables_sort(this,' + header + ',0)" type=button value=↓>';
        }
    }
}

function tables_sort(element, column, direction){
    let table = element.closest('table');

    let column_content = [];
    let rows = Array.from(table.firstElementChild.children);

    for(let row in rows){
        column_content.push(rows[row].children[column].innerText);
    }

    column_content.sort(function(a, b){
      return a.localeCompare(b);
    });
    if(direction === 0){
        column_content.reverse();
    }

    for(let row in rows){
    }
}

tables_init();
