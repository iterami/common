'use strict';

// Required args: prefix, settings
function settings_init(args){
    settings_prefix = args['prefix'];

    for(var setting in args['settings']){
        settings_defaults[setting] = args['settings'][setting];
        settings_settings[setting] = window.localStorage.getItem(settings_prefix + setting);

        if(settings_settings[setting] === null){
            settings_settings[setting] = settings_defaults[setting];
            continue;
        }

        settings_type_convert({
          'setting': setting,
        });
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

        settings_type_convert({
          'setting': setting,
        });

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

// Required args: setting
function settings_type_convert(args){
    if(typeof settings_defaults[args['setting']] === 'string'){
        return;
    }

    if(!isNaN(parseFloat(settings_defaults[args['setting']]))){
        settings_settings[args['setting']] = parseFloat(settings_settings[args['setting']]);

    }else if(typeof(settings_defaults[args['setting']]) === 'boolean'
      && typeof(settings_settings[args['setting']]) !== 'boolean'){
        settings_settings[args['setting']] = settings_settings[args['setting']] === 'true';
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
