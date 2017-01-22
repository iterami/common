'use strict';

// Required args: data, prefix
function storage_init(args){
    storage_prefix = args['prefix'];

    for(var key in args['data']){
        var data = args['data'][key];
        if(typeof args['data'][key] !== 'object'){
            data = {
              'default': data,
              'type': 'setting',
            };
        }

        storage_info[key] = {
          'default': data['default'],
          'type': data['type'] || 'setting',
        };
        storage_data[key] = window.localStorage.getItem(storage_prefix + key);

        if(storage_data[key] === null){
            storage_data[key] = storage_info[key]['default'];
        }

        storage_type_convert({
          'key': key,
        });

        if(storage_info[key]['type'] !== 'setting'){
            storage_info[key]['best'] = storage_data[key];
        }
    }
}

// Optional args: bests
function storage_reset(args){
    args = args || {};
    args['bests'] = args['bests'] || false;

    if(!window.confirm('Reset?')){
        return false;
    }

    for(var key in storage_data){
        if(args['bests']
          && storage_info[key]['type'] !== 'setting'){
            storage_data[key] = storage_info[key]['default'];
            storage_info[key]['best'] = storage_info[key]['default'];
            continue;
        }

        storage_data[key] = storage_info[key]['default'];
        window.localStorage.removeItem(storage_prefix + key);
    }

    if(args['bests']){
        storage_save();
    }
    storage_update();
    return true;
}

function storage_save(){
    for(var key in storage_data){
        var data = storage_data[key];

        if(storage_info[key]['type'] === 'setting'){
            storage_data[key] = document.getElementById(key)[
              typeof(storage_info[key]['default']) === 'boolean'
                ? 'checked'
                : 'value'
            ];

            data = storage_data[key];

        }else{
            if(storage_info[key]['type'] < 0){
                if(data < storage_info[key]['best']){
                    storage_info[key]['best'] = data;
                }

            }else if(storage_data[key] > storage_info[key]['best']){
                storage_info[key]['best'] = data;
            }

            data = storage_info[key]['best'];
        }

        storage_type_convert({
          'key': key,
        });

        if(data !== storage_info[key]['default']){
            window.localStorage.setItem(
              storage_prefix + key,
              data
            );

        }else{
            window.localStorage.removeItem(storage_prefix + key);
        }
    }
}

// Required args: key
function storage_type_convert(args){
    var storage_default = storage_info[args['key']]['default'];

    if(typeof storage_default === 'string'){
        return;
    }

    if(!isNaN(parseFloat(storage_default))){
        storage_data[args['key']] = parseFloat(storage_data[args['key']]);

    }else if(typeof(storage_default) === 'boolean'
      && typeof(storage_data[args['key']]) !== 'boolean'){
        storage_data[args['key']] = storage_data[args['key']] === 'true';
    }
}

function storage_update(){
    for(var key in storage_data){
        if(storage_info[key]['type'] !== 'setting'){
            continue;
        }

        document.getElementById(key)[
          typeof(storage_info[key]['default']) === 'boolean'
            ? 'checked'
            : 'value'
        ] = storage_data[key];
    }
}

var storage_data = {};
var storage_info = {};
var storage_prefix = '';
