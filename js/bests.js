'use strict';

function bests_init(newprefix, bests){
    bests_prefix = newprefix;

    for(var best in bests){
        bests_info[best] = {
          'default': bests[best]['default'],
          'more': bests[best]['more'] || true,
        };
        var best_localstorage = window.localStorage.getItem(bests_prefix + best);
        if(typeof bests_info[best]['default'] === 'number'){
            bests_bests[best] = parseFloat(best_localstorage)
              || bests_info[best]['default'];

        }else{
            bests_bests[best] = best_localstorage !== void 0
              ? JSON.parse(best_localstorage)
              : bests_info[best]['default'];
        }
    }
}

function bests_reset(){
    if(!window.confirm(bests_reset_confirm)){
        return false;
    }

    for(var best in bests_bests){
        bests_bests[best] = bests_info[best]['default'];
        bests_update(best);
    }
}

function bests_update(key, value){
    if(typeof bests_info[key]['default'] === 'number'){
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

    }else{
        window.localStorage.setItem(
          bests_prefix + key,
          JSON.stringify(universe)
        );
    }
}

var bests_bests = {};
var bests_info = {};
var bests_prefix = '';
var bests_reset_confirm = 'Reset best?';
