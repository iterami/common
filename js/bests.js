'use strict';

function init_bests(newprefix){
    prefix = newprefix;

    best = parseFloat(window.localStorage.getItem(prefix + '-best'))
      || 0;
}

function reset_best(){
    if(!window.confirm('Reset best?')){
        return;
    }

    best = 0;
    update_best(best);
}

function update_best(value){
    if(value > best){
        best = value;
    }

    if(best !== 0){
        window.localStorage.setItem(
          prefix + '-best',
          best
        );

    }else{
        window.localStorage.removeItem(prefix + '-best');
    }
}

var best = 0;
var prefix = '';
