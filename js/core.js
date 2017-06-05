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

function core_escape(){
    core_menu_open = !core_menu_open;

    core_call({
      'todo': 'repo_escape',
    });
}

// Optional args: beforeunload, clearkeys, clearmouse, keybinds, mousebinds
function core_events_bind(args){
    args = core_args({
      'args': args,
      'defaults': {
        'beforeunload': false,
        'clearkeys': false,
        'clearmouse': false,
        'keybinds': false,
        'mousebinds': false,
      },
    });

    if(args['beforeunload'] !== false){
        core_events['beforeunload'] = core_handle_defaults({
          'default': {
            'loop': false,
            'preventDefault': false,
            'solo': false,
            'state': false,
            'todo': function(){},
          },
          'var': args['beforeunload'],
        });
    }

    if(args['keybinds'] !== false){
        core_keys_updatebinds({
          'clear': args['clearkeys'],
          'keybinds': args['keybinds'],
        });
    }

    if(args['mousebinds'] !== false){
        core_mouse_updatebinds({
          'clear': args['clearmouse'],
          'mousebinds': args['mousebinds'],
        });
    }
}

function core_events_keyinfo(event){
    var code = event.keyCode || event.which;
    return {
      'code': code,
      'key': String.fromCharCode(code),
    };
}

// Optional args: beforeunload, keybinds, mousebinds
function core_events_rebind(args){
    args = core_args({
      'args': args,
      'defaults': {
        'beforeunload': false,
        'keybinds': {},
        'mousebinds': {},
      },
    });

    if(args['beforeunload'] !== false){
        core_events['beforeunload'] = core_handle_defaults({
          'default': {
            'loop': false,
            'preventDefault': false,
            'solo': false,
            'state': false,
            'todo': function(){},
          },
          'var': args['beforeunload'],
        });
    }

    var binds = {};
    var rebind = false;
    for(var bind in args['keybinds']){
        binds[bind] = keybinds[bind];
        rebind = true;
    }
    if(rebind){
        core_keys_updatebinds({
          'clear': true,
          'keybinds': binds,
        });
    }

    binds = {};
    rebind = false;
    for(bind in args['mousebinds']){
        binds[bind] = mousebinds[bind];
        rebind = true;
    }
    if(rebind){
        core_mouse_updatebinds({
          'clear': true,
          'mousebinds': binds,
        });
    }
}

function core_events_todoloop(){
    for(var key in core_keys){
        if(core_keys[key]['loop']
          && core_keys[key]['state']){
            core_keys[key]['todo']();
        }
    }
    for(var mousebind in core_mouse['todo']){
        if(core_mouse['todo'][mousebind]['loop']){
            core_mouse['todo'][mousebind]['todo']();
        }
    }
}

function core_handle_beforeunload(event){
    var result = core_handle_event({
      'event': event,
      'key': 'beforeunload',
      'object': core_events,
      'todo': true,
    });
    if(core_type({
      'type': 'string',
      'var': result,
    })){
        return result;
    }
}

function core_handle_contextmenu(event){
    var result = core_handle_event({
      'event': event,
      'key': 'contextmenu',
      'object': core_mouse['todo'],
      'todo': true,
    });
    if(result === void 0){
        return false;
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

// Required args: event, key, object
// Optional args: state, todo
function core_handle_event(args){
    if(args['object'].hasOwnProperty(args['key'])){
        if(args['object'][args['key']]['preventDefault']){
            args['event'].preventDefault();
        }

        var returned = void 0;
        if(args['todo'] !== void 0
          && !args['object'][args['key']]['loop']){
            returned = args['object'][args['key']]['todo'](args['event']);
        }

        if(args['state'] !== void 0){
            args['object'][args['key']]['state'] = args['state'];
        }

        if(returned !== void 0){
            return returned;
        }

        return args['object'][args['key']]['solo'];
    }

    return false;
}

function core_handle_gamepadconnected(event){
    var gamepad = event.gamepad;
    core_gamepads[gamepad.index] = gamepad;
}

function core_handle_gamepaddisconnected(event){
    delete core_gamepads[event.gamepad.index];
}

function core_handle_keydown(event){
    var key = core_events_keyinfo(event);

    if(core_handle_event({
      'event': event,
      'key': key['code'],
      'object': core_keys,
      'state': true,
      'todo': true,
    })){
        return;
    }

    core_handle_event({
      'event': event,
      'key': 'all',
      'object': core_keys,
      'state': true,
      'todo': true,
    });
}

function core_handle_keyup(event){
    var key = core_events_keyinfo(event);

    if(core_handle_event({
      'event': event,
      'key': key['code'],
      'object': core_keys,
      'state': false,
    })){
        return;
    }

    if(core_keys.hasOwnProperty('all')){
        var all = false;
        for(var key in core_keys){
            if(key !== 'all'
              && core_keys[key]['state']){
                all = true;
                break;
            }
        }
        core_keys['all']['state'] = all;
    }
}

function core_handle_mousedown(event){
    core_mouse['button'] = event.button;
    core_mouse['down'] = true;
    core_mouse['down-x'] = core_mouse['x'];
    core_mouse['down-y'] = core_mouse['y'];
    core_handle_event({
      'event': event,
      'key': 'mousedown',
      'object': core_mouse['todo'],
      'todo': true,
    });
}

function core_handle_mousemove(event){
    core_mouse['movement-x'] = event.movementX;
    core_mouse['movement-y'] = event.movementY;
    core_mouse['x'] = event.pageX;
    core_mouse['y'] = event.pageY;
    core_handle_event({
      'event': event,
      'key': 'mousemove',
      'object': core_mouse['todo'],
      'todo': true,
    });
}

function core_handle_mouseup(event){
    core_mouse['button'] = -1;
    core_mouse['down'] = false;
    core_handle_event({
      'event': event,
      'key': 'mouseup',
      'object': core_mouse['todo'],
      'todo': true,
    });
}

function core_handle_mousewheel(event){
    var delta = Number(
      event.wheelDelta
        || -event.detail
    );
    core_handle_event({
      'event': event,
      'key': 'mousewheel',
      'object': core_mouse['todo'],
      'todo': true,
    });
}

function core_handle_pointerlockchange(event){
    var element = document.getElementById(core_mouse['pointerlock-id']);
    if(!element){
        return;
    }

    core_mouse['pointerlock-state'] = document.pointerLockElement === element
      || document.mozPointerLockElement === element;
};

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

function core_init(){
    core_mouse = {
      'button': -1,
      'down': false,
      'down-x': 0,
      'down-y': 0,
      'movement-x': 0,
      'movement-y': 0,
      'pointerlock-id': 'canvas',
      'pointerlock-state': false,
      'todo': {},
      'x': 0,
      'y': 0,
    };

    document.onmozpointerlockchange = core_handle_pointerlockchange;
    document.onpointerlockchange = core_handle_pointerlockchange;
    window.onbeforeunload = core_handle_beforeunload;
    window.oncontextmenu = core_handle_contextmenu;
    window.ongamepadconnected = core_handle_gamepadconnected;
    window.ongamepaddisconnected = core_handle_gamepaddisconnected;
    window.onkeydown = core_handle_keydown;
    window.onkeyup = core_handle_keyup;
    window.onmousedown = core_handle_mousedown;
    window.onmousemove = core_handle_mousemove;
    window.onmouseup = core_handle_mouseup;
    window.ontouchend = core_handle_mouseup;
    window.ontouchmove = core_handle_mousemove;
    window.ontouchstart = core_handle_mousedown;

    if('onmousewheel' in window){
        window.onmousewheel = core_handle_mousewheel;

    }else{
        document.addEventListener(
          'DOMMouseScroll',
          core_handle_mousewheel,
          false
        );
    }

    // Global event binds.
    core_events_bind({
      'keybinds': {
        27: {// Escape
          'solo': true,
          'todo': core_escape,
        },
      },
    });

    core_call({
      'todo': 'repo_init',
    });
}

// Required args: keybinds
// Optional args: clear
function core_keys_updatebinds(args){
    args = core_args({
      'args': args,
      'defaults': {
        'clear': false,
      },
    });

    if(args['clear']){
        core_keys = {};
    }

    for(var keybind in args['keybinds']){
        var key = keybind;

        if(keybind !== 'all'){
            key = parseInt(key);

            if(isNaN(key)){
                key = keybind.charCodeAt(0);
            }
        }

        core_keys[key] = core_handle_defaults({
          'default': {
            'loop': false,
            'preventDefault': false,
            'solo': false,
            'state': false,
            'todo': function(){},
          },
          'var': args['keybinds'][keybind],
        });
    }
}

// Required args: mousebinds
// Optional args: clear
function core_mouse_updatebinds(args){
    args = core_args({
      'args': args,
      'defaults': {
        'clear': false,
      },
    });

    if(args['clear']){
        core_mouse['todo'] = {};
    }

    for(var mousebind in args['mousebinds']){
        core_mouse['todo'][mousebind] = {};
        core_mouse['todo'][mousebind]['loop'] = args['mousebinds'][mousebind]['loop'] || false;
        core_mouse['todo'][mousebind]['preventDefault'] = args['mousebinds'][mousebind]['preventDefault'] || false;
        core_mouse['todo'][mousebind]['todo'] = args['mousebinds'][mousebind]['todo'] || function(){};
    }
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

// Optional args: id
function core_requestpointerlock(args){
    if(core_menu_open){
        return;
    }

    args = core_args({
      'args': args,
      'defaults': {
        'id': 'canvas',
      },
    });

    var element = document.getElementById(args['id']);
    if(!element){
        return;
    }

    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock;
    element.requestPointerLock();

    core_mouse['pointerlock-id'] = args['id'];
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
        if(args['bests']){
            if(core_storage_info[key]['type'] !== 'setting'){
                core_storage_data[key] = core_storage_info[key]['default'];
                core_storage_info[key]['best'] = core_storage_info[key]['default'];

            }else{
                continue;
            }

        }else if(core_storage_info[key]['type'] === 'setting'){
            core_storage_data[key] = core_storage_info[key]['default'];

        }else{
            continue;
        }

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

        if(args['bests']){
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

        }else if(core_storage_info[key]['type'] === 'setting'){
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
          && !(args['var'] instanceof Array)
          && typeof args['var'] !== 'function';
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

var core_events = {};
var core_gamepads = {};
var core_images = {};
var core_keys = {};
var core_menu_open = false;
var core_menu_quit = 'Q = Main Menu';
var core_menu_resume = 'ESC = Resume';
var core_mouse = {};
var core_random_boolean_chance = .5;
var core_random_integer_max = 100;
var core_random_string_characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
var core_random_string_length = 100;
var core_storage_data = {};
var core_storage_info = {};
var core_storage_prefix = '';
var core_uids = {};

window.onload = core_init;
