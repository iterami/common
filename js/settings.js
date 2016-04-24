'use strict';

function init_settings(newsettings, newprefix){
    for(var setting in newsettings){
        settings[setting] = newsettings[setting];
    }

    prefix = newprefix;
}

function reset(){
    if(!window.confirm('Reset settings?')){
        return;
    }

    for(var setting in settings){
        settings[setting]['value'] = settings[setting]['default'];
    }

    save();
}

function save(){
    for(var setting in settings){
        var value = document.getElementById(setting).value;
        if(typeof settings[setting]['todo'] == 'function'){
            value = settings[setting]['todo'](value);
        }
        settings[setting]['value'] = value;

        if(settings[setting]['value'] !== settings[setting]['default']){
            window.localStorage.setItem(
              prefix + setting,
              settings[setting]['value']
            );

        }else{
            window.localStorage.removeItem(prefix + setting);
        }
    }
}

var prefix = '';
var settings = {};
