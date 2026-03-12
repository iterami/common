'use strict';

function tables_add(table){
    if(table.classList.contains('tables-added')
      || !table.firstElementChild){
        return;
    }

    let main_column = 0;
    const headers = Array.from(table.firstElementChild.firstElementChild.children);
    for(const header in headers){
        const classList = headers[header].classList;

        if(classList.contains('tables-nosort')){
            continue;

        }else if(classList.contains('tables-main')){
            main_column = header;
        }

        headers[header].innerHTML += '<div><button onclick="tables_sort(this,' + header + ',1)" type=button>▲</button>'
          + '<button onclick="tables_sort(this,' + header + ',0)" type=button>▼</button></div>';
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

    for(const table of tables){
        if(!table.classList.contains('tables-nosort')){
            tables_add(table);
        }
    }
}

function tables_sort(element, column, direction){
    const table = element.closest('table');
    const tbodys = table.getElementsByTagName('tbody');
    const tbody = tbodys[tbodys.length - 1];
    if(!tbody){
        return;
    }

    const rows = Array.from(tbody.children);
    if(rows.length === 0){
        return;
    }
    const header = rows[0].classList.contains('header');
    const header_row = header ? rows.shift() : '';

    const numeric = [];
    const text = [];
    for(const row of rows){
        const row_text = row.children[column].innerText;

        if(globalThis.isNaN(row_text)){
            text.push(row_text);

        }else{
            numeric.push(row_text);
        }
    }

    const collator = new Intl.Collator();
    const column_content = [];
    if(direction === 0){
        numeric.sort(function(a, b){
            return tables_format_number(b) - tables_format_number(a);
        });
        text.sort(function(a, b){
            return collator.compare(b, a);
        });
        column_content.push(
          ...text,
          ...numeric
        );

    }else{
        numeric.sort(function(a, b){
            return tables_format_number(a) - tables_format_number(b);
        });
        text.sort(collator.compare);
        column_content.push(
          ...numeric,
          ...text
        );
    }

    let main_column = 0;
    for(const cssClass of table.classList){
        if(cssClass.startsWith('tables-main-')){
            main_column = Number(cssClass.substring(12));
            break;
        }
    }

    let sorted_html = '';
    const used_rows = [];
    for(const sorted of column_content){
        for(const row of rows){
            const parent = row.children;

            if(parent[column].innerText === sorted
              && !used_rows.includes(parent[main_column].innerText)){
                sorted_html += row.outerHTML;
                used_rows.push(parent[main_column].innerText);

                break;
            }
        }
    }

    tbody.innerHTML = (header ? header_row.outerHTML : '') + sorted_html;
}

tables_init();
