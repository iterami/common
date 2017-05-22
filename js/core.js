'use strict';

// Required args: args, defaults
function core_args(args){
    if(args['args'] === void 0){
        args['args'] = {};
    }

    for(var arg in args['defaults']){
        if(args['args'][arg] === void 0){
            args['args'][arg] = args['defaults'][arg];
        }
    }

    return args['args'];
}

// Required args: todo
// Optional args: args
function core_call(args){
    args = core_args({
      'args': args,
      'defaults': {
        'args': void 0,
      },
    });

    if(core_type({
      'var': args['todo'],
    })){
        window[args['todo']](args['args']);
    }
}

// Optional args: default, var
function core_handle_defaults(args){
    args = core_args({
      'args': args,
      'defaults': {
        'default': {},
        'var': {},
      },
    });

    if(!core_type({
      'type': 'object',
      'var': args['var'],
    })){
        return args['var'];
    }

    var object = args['default'];

    for(var property in args['var']){
        object[property] = core_handle_defaults({
          'var': args['var'][property],
        });
    }

    return object;
}

// Required args: id, src
// Optional args: todo
function core_image(args){
    args = core_args({
      'args': args,
      'defaults': {
        'todo': function(){},
      },
    });

    var image = new Image();
    image.onload = args['todo'];
    image.src = args['src'];
    core_images[args['id']] = image;
    return image;
}

/*
// Optional args: content
function core_menu_create(args){
    args = core_args({
      'args': args,
      'defaults': {
        'content': {},
      },
    });

    var menu = document.createElement('div');
    menu.id = 'core-menu';
    menu.style.display = 'none';
    menu.style.margin = 'auto';
    menu.style.position = 'absolute';
    menu.style.top = '0';

    var innerHTML = '';
    for(var contentid in content){
    }
    menu.innerHTML = innerHTML;

    document.body.appendChild(menu);
}
*/

function core_menu_toggle(){
    core_menu_open = !core_menu_open;

    /*
    document.getElementById('core-menu').style.display = core_menu_open
      ? 'inline-block'
      : 'none';
    */
}

// Optional args: chance
function core_random_boolean(args){
    args = core_args({
      'args': args,
      'defaults': {
        'chance': core_random_boolean_chance,
      },
    });

    return Math.random() < args['chance'];
}

function core_random_hex(){
    var color = core_random_rgb();

    var blue = '0' + color['blue'].toString(16);
    var green = '0' + color['green'].toString(16);
    var red = '0' + color['red'].toString(16);

    return red.slice(-2) + green.slice(-2) + blue.slice(-2);
}

// Optional args: max, todo
function core_random_integer(args){
    args = core_args({
      'args': args,
      'defaults': {
        'max': core_random_integer_max,
        'todo': 'floor',
      },
    });

    return Math[args['todo']](Math.random() * args['max']);
}

function core_random_rgb(){
  return {
    'blue': core_random_integer({
      'max': 256,
    }),
    'green': core_random_integer({
      'max': 256,
    }),
    'red': core_random_integer({
      'max': 256,
    }),
  };
}

// Optional args: characters, length
function core_random_string(args){
    args = core_args({
      'args': args,
      'defaults': {
        'characters': core_random_string_characters,
        'length': core_random_string_length,
      },
    });

    var string = '';
    for(var loopCounter = 0; loopCounter < args['length']; loopCounter++){
        string += args['characters'][core_random_integer({
          'max': args['characters'].length,
        })];
    }
    return string;
}

// Required args: data, prefix
function core_storage_init(args){
    core_storage_prefix = args['prefix'];

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

        core_storage_info[key] = {
          'default': data['default'],
          'type': data['type'] || 'setting',
        };
        core_storage_data[key] = window.localStorage.getItem(core_storage_prefix + key);

        if(core_storage_data[key] === null){
            core_storage_data[key] = core_storage_info[key]['default'];
        }

        core_storage_data[key] = core_storage_type_convert({
          'key': key,
          'value': core_storage_data[key],
        });

        if(core_storage_info[key]['type'] !== 'setting'){
            core_storage_info[key]['best'] = core_storage_data[key];
        }
    }
}

// Optional args: bests
function core_storage_reset(args){
    args = core_args({
      'args': args,
      'defaults': {
        'bests': false,
      },
    });

    if(!window.confirm('Reset?')){
        return false;
    }

    for(var key in core_storage_data){
        if(args['bests']
          && core_storage_info[key]['type'] !== 'setting'){
            core_storage_info[key]['best'] = core_storage_info[key]['default'];
        }

        core_storage_data[key] = core_storage_info[key]['default'];
        window.localStorage.removeItem(core_storage_prefix + key);
    }

    if(args['bests']){
        core_storage_save({
          'bests': true,
        });
    }
    core_storage_update();
    return true;
}

// Optional args: bests
function core_storage_save(args){
    args = core_args({
      'args': args,
      'defaults': {
        'bests': false,
      },
    });

    for(var key in core_storage_data){
        var data = '';

        if(core_storage_info[key]['type'] === 'setting'){
            if(args['bests']){
                continue;
            }

            core_storage_data[key] = document.getElementById(key)[
              core_type({
                'type': 'boolean',
                'var': core_storage_info[key]['default'],
              })
                ? 'checked'
                : 'value'
            ];

            data = core_storage_type_convert({
              'key': key,
              'value': core_storage_data[key],
            });
            core_storage_data[key] = data;

        }else{
            data = core_storage_type_convert({
              'key': key,
              'value': core_storage_data[key],
            });

            if(core_storage_info[key]['type'] < 0){
                if(data < core_storage_info[key]['best']){
                    core_storage_info[key]['best'] = data;
                }

            }else if(core_storage_data[key] > core_storage_info[key]['best']){
                core_storage_info[key]['best'] = data;
            }
        }

        if(data !== core_storage_info[key]['default']){
            window.localStorage.setItem(
              core_storage_prefix + key,
              data
            );

        }else{
            window.localStorage.removeItem(core_storage_prefix + key);
        }
    }
}

// Required args: key, value
function core_storage_type_convert(args){
    var core_storage_default = core_storage_info[args['key']]['default'];

    if(core_type({
      'type': 'string',
      'var': core_storage_default,
    })){
        return args['value'];

    }else if(!isNaN(parseFloat(core_storage_default))){
        return parseFloat(args['value']);

    }else if(core_type({
      'type': 'boolean',
      'var': core_storage_default,
    }) && !core_type({
      'type': 'boolean',
      'var': args['value'],
    })){
        return args['value'] === 'true';
    }

    return args['value'];
}

function core_storage_update(){
    for(var key in core_storage_data){
        var type = core_type({
            'type': 'boolean',
            'var': core_storage_info[key]['default'],
          })
          ? 'checked'
          : 'value';

        if(core_storage_info[key]['type'] !== 'setting'){
            type = 'innerHTML';
        }

        document.getElementById(key)[type] = core_storage_data[key];
    }
}

// Required args: var
// Optional args: type
function core_type(args){
    args = core_args({
      'args': args,
      'defaults': {
        'type': 'function',
      },
    });

    if(args['type'] === 'function'){
        return typeof args['var'] === 'function'
          || typeof window[args['var']] === 'function';
    }

    if(args['type'] === 'array'){
        return args['var'] instanceof Array;
    }

    if(args['type'] === 'object'){
        return args['var'] instanceof Object
          && !(args['var'] instanceof Array);
    }

    return typeof args['var'] === args['type'];
}

function core_uid(){
    var uid = core_uid_create();

    while(core_uids[uid] !== void 0){
        uid = core_uid_create();
    }

    core_uids[uid] = true;

    return uid;
}

function core_uid_create(){
    var uid = '';

    for(var i = 0; i < 3; i++){
        uid += parseInt(
          core_random_integer({
            'max': 1e17,
          }),
          10
        ).toString(34);
    }

    return uid;
}

var core_images = {};
var core_menu_open = false;
var core_menu_quit = 'Q = Main Menu';
var core_menu_resume = 'ESC = Resume';
var core_random_boolean_chance = .5;
var core_random_integer_max = 100;
var core_random_string_characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
var core_random_string_length = 100;
var core_storage_data = {};
var core_storage_info = {};
var core_storage_prefix = '';
var core_uids = {};
