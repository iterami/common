'use strict';

function bests_init(newprefix, bests){
    bests_prefix = newprefix;

    for(var best in bests){
        bests_info[best] = {
          'default': bests[best]['default'],
          'more': bests[best]['more'] || true,
        };
        bests_bests[best] = parseFloat(window.localStorage.getItem(bests_prefix + best))
          || bests_info[best]['default'];
    }
}

function bests_reset(){
    if(!window.confirm(bests_reset_confirm)){
        return;
    }

    for(var best in bests_bests){
        bests_bests[best] = bests_info[best]['default'];
        bests_update(best);
    }
}

function bests_update(key, value){
    if(!bests_info[key]['more'] || false){
        if(value < bests_bests[key]){
            bests_bests[key] = value;
        }

    }else if(value > bests_bests[key]){
        bests_bests[key] = value;
    }

    if(bests_bests[key] !== bests_info[key]['default']){
        window.localStorage.setItem(
          bests_prefix + key,
          bests_bests[key]
        );

    }else{
        window.localStorage.removeItem(bests_prefix + key);
    }
}

var bests_bests = {};
var bests_info = {};
var bests_prefix = '';
var bests_reset_confirm = 'Reset best?';
