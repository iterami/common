'use strict';

function init_settings(newsettings, newprefix){
    for(var setting in newsettings){
        defaults[setting] = newsettings[setting]['default'];
        settings[setting] = newsettings[setting]['value'];
    }

    prefix = newprefix;
}

function reset(){
    if(!window.confirm('Reset settings?')){
        return;
    }

    for(var setting in settings){
        settings[setting] = defaults[setting];
    }

    save();
}

function save(){
    for(var setting in settings){
        settings[setting] = document.getElementById(setting).value;

        if(settings[setting] !== defaults[setting]){
            window.localStorage.setItem(
              prefix + setting,
              settings[setting]
            );

        }else{
            window.localStorage.removeItem(prefix + setting);
        }
    }
}

var defaults = {};
var prefix = '';
var settings = {};
