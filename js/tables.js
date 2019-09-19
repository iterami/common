'use strict';

function tables_init(){
    let tables = document.getElementsByTagName('table');

    for(let i = 0; i < tables.length; i++){
        if(tables[i].classList.contains('tables-nosort')){
            continue;
        }

        let headers = Array.from(tables[i].firstElementChild.firstElementChild.children);

        for(let header in headers){
            if(headers[header].classList.contains('tables-nosort')){
                continue;

            }else if(headers[header].classList.contains('tables-main')){
                tables_column_main = header;
            }

            let type = 0;
            if(headers[header].classList.contains('tables-numbers')){
                type = 1;
            }

            headers[header].innerHTML += '<input onclick="tables_sort(this,' + header + ',1,' + type + ')" type=button value=↑>'
              + '<input onclick="tables_sort(this,' + header + ',0,' + type + ')" type=button value=↓>';
        }
    }
}

function tables_sort(element, column, direction, type){
    let table = element.closest('table');
    let rows = Array.from(table.firstElementChild.children);

    let column_content = [];
    let sorted_html = '';
    let used_rows = [];

    for(let row in rows){
        if(row == 0){
            continue;
        }

        column_content.push(rows[row].children[column].innerText);
    }

    if(type === 1){
        column_content.sort(function(a, b){
            return a - b;
        });

    }else{
        column_content.sort(function(a, b){
            return a.localeCompare(b);
        });
    }
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
              && !used_rows.includes(parent[tables_column_main].innerText)){
                sorted_html += rows[row].outerHTML;
                used_rows.push(parent[tables_column_main].innerText);

                break;
            }
        }
    }

    table.firstElementChild.innerHTML = rows[0].outerHTML + sorted_html;
}

let tables_column_main = 0;

tables_init();
