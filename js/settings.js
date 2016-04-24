'use strict';

function reset(){
    if(!window.confirm('Reset settings?')){
        return;
    }

    save();
}

function save(){
}

var settings = {};
