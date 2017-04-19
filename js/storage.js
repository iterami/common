'use strict';

// Required args: data, prefix
function storage_init(args){
    storage_prefix = args['prefix'];

    for(var key in args['data']){
        var data = args['data'][key];
        if(!core_type({
          'type': 'object',
          'var': args['data'][key],
        })){
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

        storage_data[key] = storage_type_convert({
          'key': key,
          'value': storage_data[key],
        });

        if(storage_info[key]['type'] !== 'setting'){
            storage_info[key]['best'] = storage_data[key];
        }
    }
}

// Optional args: bests
function storage_reset(args){
    args = core_args({
      'args': args,
      'defaults': {
        'bests': false,
      },
    });

    if(!window.confirm('Reset?')){
        return false;
    }

    for(var key in storage_data){
        if(args['bests']
          && storage_info[key]['type'] !== 'setting'){
            storage_info[key]['best'] = storage_info[key]['default'];
        }


        storage_data[key] = storage_info[key]['default'];
        window.localStorage.removeItem(storage_prefix + key);
    }

    if(args['bests']){
        storage_save({
          'bests': true,
        });
    }
    storage_update();
    return true;
}

// Optional args: bests
function storage_save(args){
    args = core_args({
      'args': args,
      'defaults': {
        'bests': false,
      },
    });

    for(var key in storage_data){
        var data = '';

        if(storage_info[key]['type'] === 'setting'){
            if(args['bests']){
                continue;
            }

            storage_data[key] = document.getElementById(key)[
              core_type({
                'type': 'boolean',
                'var': storage_info[key]['default'],
              })
                ? 'checked'
                : 'value'
            ];

            data = storage_type_convert({
              'key': key,
              'value': storage_data[key],
            });
            storage_data[key] = data;

        }else{
            data = storage_type_convert({
              'key': key,
              'value': storage_data[key],
            });

            if(storage_info[key]['type'] < 0){
                if(data < storage_info[key]['best']){
                    storage_info[key]['best'] = data;
                }

            }else if(storage_data[key] > storage_info[key]['best']){
                storage_info[key]['best'] = data;
            }
        }

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

// Required args: key, value
function storage_type_convert(args){
    var storage_default = storage_info[args['key']]['default'];

    if(core_type({
      'type': 'string',
      'var': storage_default,
    })){
        return args['value'];

    }else if(!isNaN(parseFloat(storage_default))){
        return parseFloat(args['value']);

    }else if(core_type({
      'type': 'boolean',
      'var': storage_default,
    }) && !core_type({
      'type': 'boolean',
      'var': args['value'],
    })){
        return args['value'] === 'true';
    }

    return args['value'];
}

function storage_update(){
    for(var key in storage_data){
        var type = core_type({
            'type': 'boolean',
            'var': storage_info[key]['default'],
          })
          ? 'checked'
          : 'value';

        if(storage_info[key]['type'] !== 'setting'){
            type = 'innerHTML';
        }

        document.getElementById(key)[type] = storage_data[key];
    }
}

var storage_data = {};
var storage_info = {};
var storage_prefix = '';
