'use strict';

function convert_type(setting){
    if(!isNaN(parseFloat(defaults[setting]))){
        settings[setting] = parseFloat(settings[setting]);

    }else if(typeof(defaults[setting]) === 'boolean'
      && typeof(settings[setting]) !== 'boolean'){
        settings[setting] = settings[setting] === 'true';
    }
}

function init_settings(newprefix, newsettings, trackbest){
    prefix = newprefix;

    for(var setting in newsettings){
        defaults[setting] = newsettings[setting];
        settings[setting] = window.localStorage.getItem(prefix + setting);

        if(settings[setting] === null){
            settings[setting] = defaults[setting];
            continue;
        }

        convert_type(setting);
    }

    if(trackbest){
        best = parseInt(
          window.localStorage.getItem(prefix + '-best'),
          10
        ) || 0;
    }
}

function reset(){
    if(!window.confirm('Reset settings?')){
        return;
    }

    for(var setting in settings){
        settings[setting] = defaults[setting];
        window.localStorage.removeItem(prefix + setting);
    }

    update_settings();
}

function reset_best(){
    if(!window.confirm('Reset best?')){
        return;
    }

    best = 0;

    update_best();
    setmode(0);
}

function save(){
    for(var setting in settings){
        settings[setting] = document.getElementById(setting)[
          typeof(defaults[setting]) === 'boolean'
            ? 'checked'
            : 'value'
        ];

        convert_type(setting);

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

function update_settings(){
    for(var setting in settings){
        document.getElementById(setting)[
          typeof(defaults[setting]) === 'boolean'
            ? 'checked'
            : 'value'
        ] = settings[setting];
    }
}

var best = 0;
var defaults = {};
var prefix = '';
var settings = {};
