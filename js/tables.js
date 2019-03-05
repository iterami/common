'use strict';

function tables_init(){
    let tables = document.getElementsByTagName('table');

    for(let i = 0; i < tables.length; i++){
        let headers = Array.from(tables[i].firstElementChild.firstElementChild.children);

        for(let header in headers){
        }
    }
}

function tables_sort(button){
    let column_content = [];
}

tables_init();
