'use strict';

// Required args: bests, prefix
function bests_init(args){
    bests_prefix = args['prefix'];

    for(var best in args['bests']){
        bests_info[best] = {
          'default': args['bests'][best]['default'],
          'less': args['bests'][best]['less'] || false,
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
        bests_update({
          'key': best,
          'value': bests_bests[best]['default'],
        });
    }
}

// Required args: key, value
function bests_update(args){
    if(typeof bests_info[args['key']]['default'] === 'number'){
        if(bests_info[args['key']]['less'] || false){
            if(args['value'] < bests_bests[args['key']]){
                bests_bests[args['key']] = args['value'];
            }

        }else if(args['value'] > bests_bests[args['key']]){
            bests_bests[args['key']] = args['value'];
        }

        if(bests_bests[args['key']] !== bests_info[args['key']]['default']){
            window.localStorage.setItem(
              bests_prefix + args['key'],
              bests_bests[args['key']]
            );

        }else{
            window.localStorage.removeItem(bests_prefix + args['key']);
        }

    }else{
        window.localStorage.setItem(
          bests_prefix + args['key'],
          JSON.stringify(universe)
        );
    }
}

var bests_bests = {};
var bests_info = {};
var bests_prefix = '';
var bests_reset_confirm = 'Reset best?';
