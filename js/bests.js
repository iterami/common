'use strict';

function init_bests(newprefix){
    prefix = newprefix;

    best = parseInt(
      window.localStorage.getItem(prefix + '-best'),
      10
    ) || 0;
}

function reset_best(){
    if(!window.confirm('Reset best?')){
        return;
    }

    best = 0;

    update_best();
}

function update_best(value){
    if(value > best){
        best = value;
    }

    if(best > 0){
        window.localStorage.setItem(
          prefix + '-best',
          best
        );

    }else{
        window.localStorage.removeItem(prefix + '-best');
    }
}

var prefix = '';
