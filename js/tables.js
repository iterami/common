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
    let used_rows = [];

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

            let parent = rows[row].children;

            if(parent[column].innerText === column_content[sorted]
              && !used_rows.includes(parent[0].innerText)){
                sorted_html += rows[row].outerHTML;
                used_rows.push(parent[0].innerText);

                break;
            }
        }
    }

    table.firstElementChild.innerHTML = header_html + sorted_html;
}

tables_init();
