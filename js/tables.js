'use strict';

function tables_add(table){
    if(table.classList.contains('tables-added')
      || !table.firstElementChild){
        return;
    }

    const headers = Array.from(table.firstElementChild.firstElementChild.children);
    let main_column = 0;

    for(const header in headers){
        const classList = headers[header].classList;

        if(classList.contains('tables-nosort')){
            continue;

        }else if(classList.contains('tables-main')){
            main_column = header;
        }

        let type = 0;
        if(classList.contains('tables-numbers')){
            type = 1;
        }

        headers[header].innerHTML += '<div><button onclick="tables_sort(this,' + header + ',1,' + type + ')" type=button>▲</button>'
          + '<button onclick="tables_sort(this,' + header + ',0,' + type + ')" type=button>▼</button></div>';
    }

    table.classList.add(
      'tables-added',
      'tables-main-' + main_column
    );
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
    if(!tbody){
        return;
    }

    const rows = Array.from(tbody.children);
    const header = rows[0].classList.contains('header');
    const header_row = header ? rows.shift() : '';
    if(rows.length === 0){
        return;
    }

    const column_content = [];
    let main_column = 0;
    for(const cssClass of table.classList){
        if(cssClass.startsWith('tables-main-')){
            main_column = Number(cssClass.substring(12));
            break;
        }
    }
    let sorted_html = '';
    const used_rows = [];

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
              && !used_rows.includes(parent[main_column].innerText)){
                sorted_html += rows[row].outerHTML;
                used_rows.push(parent[main_column].innerText);

                break;
            }
        }
    }

    tbody.innerHTML = (header ? header_row.outerHTML : '') + sorted_html;
}

tables_init();
