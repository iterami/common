'use strict';

function bests_init(newprefix, bests){
    prefix = newprefix;

    for(var best in bests){
        bests_bests[best] = parseFloat(window.localStorage.getItem(prefix + best))
          || bests[best];
    }
}

function bests_reset(){
    if(!window.confirm('Reset best?')){
        return;
    }

    for(var best in bests_bests){
        bests_bests[best] = 0;
        bests_update(bests_bests[best]);
    }
}

function bests_update(key, value){
    if(value > bests_bests[key]){
        bests_bests[key] = value;
    }

    if(bests_bests[key] !== 0){
        window.localStorage.setItem(
          prefix + key,
          bests_bests[key]
        );

    }else{
        window.localStorage.removeItem(prefix + key);
    }
}

var bests_bests = {};
var prefix = '';
