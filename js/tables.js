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
    let rows = Array.from(table.firstElementChild.children);

    let column_content = [];
    let header_html = rows[0].outerHTML;
    let sorted_html = '';

    for(let row in rows){
        if(row == 0){
            continue;
        }

        column_content.push(rows[row].children[column].innerText);
    }

    column_content.sort(function(a, b){
      return a.localeCompare(b);
    });
    if(direction === 0){
        column_content.reverse();
    }

    for(let sorted in column_content){
        for(let row in rows){
            if(row == 0){
                continue;
            }

            if(rows[row].children[column].innerText === column_content[sorted]){
                sorted_html += rows[row].outerHTML;

                break;
            }
        }
    }

    table.firstElementChild.innerHTML = header_html + sorted_html;
}

tables_init();
