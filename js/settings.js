'use strict';

function settings_init(newprefix, newsettings){
    settings_prefix = newprefix;

    for(var setting in newsettings){
        settings_defaults[setting] = newsettings[setting];
        settings_settings[setting] = window.localStorage.getItem(settings_prefix + setting);

        if(settings_settings[setting] === null){
            settings_settings[setting] = settings_defaults[setting];
            continue;
        }

        settings_type_convert(setting);
    }
}

function settings_reset(){
    if(!window.confirm(settings_reset_confirm)){
        return false;
    }

    for(var setting in settings_settings){
        settings_settings[setting] = settings_defaults[setting];
        window.localStorage.removeItem(settings_prefix + setting);
    }

    settings_update();
}

function settings_save(){
    for(var setting in settings_settings){
        settings_settings[setting] = document.getElementById(setting)[
          typeof(settings_defaults[setting]) === 'boolean'
            ? 'checked'
            : 'value'
        ];

        settings_type_convert(setting);

        if(settings_settings[setting] !== settings_defaults[setting]){
            window.localStorage.setItem(
              settings_prefix + setting,
              settings_settings[setting]
            );

        }else{
            window.localStorage.removeItem(settings_prefix + setting);
        }
    }
}

function settings_type_convert(setting){
    if(typeof settings_defaults[setting] === 'string'){
        return;
    }

    if(!isNaN(parseFloat(settings_defaults[setting]))){
        settings_settings[setting] = parseFloat(settings_settings[setting]);

    }else if(typeof(settings_defaults[setting]) === 'boolean'
      && typeof(settings_settings[setting]) !== 'boolean'){
        settings_settings[setting] = settings_settings[setting] === 'true';
    }
}

function settings_update(){
    for(var setting in settings_settings){
        document.getElementById(setting)[
          typeof(settings_defaults[setting]) === 'boolean'
            ? 'checked'
            : 'value'
        ] = settings_settings[setting];
    }
}

var settings_defaults = {};
var settings_prefix = '';
var settings_reset_confirm = 'Reset settings?';
var settings_settings = {};
