'use strict';

function tables_add(table){
    const headers = Array.from(table.firstElementChild.firstElementChild.children);

    for(const header in headers){
        if(headers[header].classList.contains('tables-nosort')){
            continue;

        }else if(headers[header].classList.contains('tables-main')){
            tables_column_main = header;
        }

        let type = 0;
        if(headers[header].classList.contains('tables-numbers')){
            type = 1;
        }

        headers[header].innerHTML += '<div><input onclick="tables_sort(this,' + header + ',1,' + type + ')" type=button value=▲>'
          + '<input onclick="tables_sort(this,' + header + ',0,' + type + ')" type=button value=▼></div>';
    }
}

function tables_format_number(value){
    return Number(value.replace(
      /,/g,
      ''
    ));
}

function tables_init(){
    const tables = document.getElementsByTagName('table');

    for(let i = 0; i < tables.length; i++){
        if(!tables[i].classList.contains('tables-nosort')){
            tables_add(tables[i]);
        }
    }
}

function tables_sort(element, column, direction, type){
    const table = element.closest('table');
    const tbody = table.getElementsByTagName('tbody')[0];
    const rows = Array.from(tbody.children);

    const column_content = [];
    let sorted_html = '';
    const used_rows = [];

    const header = rows[0].classList.contains('header');
    const header_row = header ? rows.shift() : '';

    for(const row in rows){
        column_content.push(rows[row].children[column].innerText);
    }

    let sort_function = 0;
    if(type === 1){
        if(direction === 0){
            sort_function = function(a, b){
                return tables_format_number(b) - tables_format_number(a);
            };

        }else{
            sort_function = function(a, b){
                return tables_format_number(a) - tables_format_number(b);
            };
        }

    }else{
        const collator = new Intl.Collator();

        if(direction === 0){
            sort_function = function(a, b){
                return collator.compare(b, a);
            };

        }else{
            sort_function = collator.compare;
        }
    }
    column_content.sort(sort_function);

    for(const sorted in column_content){
        for(const row in rows){
            const parent = rows[row].children;

            if(parent[column].innerText === column_content[sorted]
              && !used_rows.includes(parent[tables_column_main].innerText)){
                sorted_html += rows[row].outerHTML;
                used_rows.push(parent[tables_column_main].innerText);

                break;
            }
        }
    }

    tbody.innerHTML = (header ? header_row.outerHTML : '') + sorted_html;
}

globalThis.tables_column_main = 0;

tables_init();
