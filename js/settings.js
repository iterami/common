'use strict';

function convert_type(setting){
    if(!isNaN(parseFloat(defaults[setting]))){
        settings[setting] = parseFloat(settings[setting]);

    }else if(typeof(defaults[setting]) === 'boolean'){
        settings[setting] = settings[setting] === 'true';
    }
}

function init_settings(newprefix, newsettings){
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
}

function reset(){
    if(!window.confirm('Reset settings?')){
        return;
    }

    for(var setting in settings){
        document.getElementById(setting)[
          typeof(defaults[setting]) === 'boolean'
            ? 'checked'
            : 'value'
        ] = defaults[setting];
        settings[setting] = defaults[setting];
    }

    save();
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

var defaults = {};
var prefix = '';
var settings = {};
