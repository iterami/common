'use strict';

// Required args: args, defaults
function core_args(args){
    if(args['args'] === void 0){
        args['args'] = {};
    }

    for(let arg in args['defaults']){
        if(args['args'][arg] === void 0){
            args['args'][arg] = args['defaults'][arg];
        }
    }

    return args['args'];
}

// Required args: todo
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
        globalThis[args['todo']](args['args']);
    }
}

// Required args: number
function core_digits_min(args){
    args = core_args({
      'args': args,
      'defaults': {
        'digits': 2,
      },
    });

    const sign = args['number'] < 0
      ? '-'
      : '';
    let number = Math.abs(args['number']);
    const fraction = String(core_round({
      'number': number % 1,
    })).substring(1);
    number = String(Math.trunc(number)).padStart(
      args['digits'],
      '0'
    );

    return sign + number + fraction;
}

function core_escape(force){
    if(core_menu_lock
      && force !== true){
        return;
    }

    core_menu_open = !core_menu_open;

    if(!core_menu_open){
        document.getElementById('core-toggle').blur();
        core_storage_save();
        document.getElementById('core-menu').style.display = 'none';
        document.getElementById('core-ui').style.userSelect = 'none';
        document.getElementById('repo-ui').style.display = 'inline';
        core_interval_resume_all();

    }else{
        core_interval_pause_all();
        document.getElementById('repo-ui').style.display = 'none';
        document.getElementById('core-ui').style.userSelect = 'auto';
        document.getElementById('core-menu').style.display = 'inline';
    }

    core_call({
      'todo': 'repo_escape',
    });
}

function core_events_bind(args){
    args = core_args({
      'args': args,
      'defaults': {
        'beforeunload': false,
        'clearkeys': false,
        'clearmouse': false,
        'elements': false,
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

    if(args['elements'] !== false){
        for(const element in args['elements']){
            const domelement = document.getElementById(element);
            for(const event in args['elements'][element]){
                domelement[event] = args['elements'][element][event];
            }
        }
    }
}

function core_events_todoloop(){
    for(const key in core_keys){
        if(core_keys[key]['state']
          && core_keys[key]['loop']){
            core_keys[key]['todo']();
        }
    }
    for(const mousebind in core_mouse['todo']){
        if(core_mouse['todo'][mousebind]['loop']){
            core_mouse['todo'][mousebind]['todo']();
        }
    }
}

// Required args: file, todo
function core_file(args){
    args = core_args({
      'args': args,
      'defaults': {
        'type': 'readAsDataURL',
      },
    });

    const filereader = new FileReader();
    filereader.onloadend = function(event){
        args['todo'](event);
    };
    filereader[args['type']](args['file']);
}

// Required args: a, b
function core_float_compare(args){
    args = core_args({
      'args': args,
      'defaults': {
        'precision': Number.EPSILON,
      },
    });

    return Math.abs(args['a'] - args['b']) < args['precision'];
}

function core_handle_beforeunload(event){
    const result = core_handle_event({
      'event': event,
      'key': 'beforeunload',
      'object': core_events,
      'todo': true,
    });

    core_storage_save();

    if(core_type({
        'type': 'string',
        'var': result,
      })){
        return result;
    }
}

function core_handle_blur(event){
    core_key_shift = false;
    for(const key in core_keys){
        core_keys[key]['state'] = false;
    }
    core_mouse['down-0'] = false;
    core_mouse['down-1'] = false;
    core_mouse['down-2'] = false;
    core_mouse['down-3'] = false;
    core_mouse['down-4'] = false;
}

function core_handle_contextmenu(event){
    const result = core_handle_event({
      'event': event,
      'key': 'contextmenu',
      'object': core_mouse['todo'],
      'todo': true,
    });
    if(result === void 0
      && !core_menu_open){
        return false;
    }
}

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

    const object = args['default'];
    for(const property in args['var']){
        object[property] = core_handle_defaults({
          'var': args['var'][property],
        });
    }
    return object;
}

// Required args: event, key, object
function core_handle_event(args){
    args = core_args({
      'args': args,
      'defaults': {
        'state': void 0,
        'todo': void 0,
      },
    });

    if(Reflect.has(args['object'], args['key'])){
        if(args['object'][args['key']]['preventDefault']
          && !core_menu_open){
            args['event'].preventDefault();
        }

        let returned = void 0;
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
    const gamepad = event.gamepad;
    core_gamepads[gamepad.index] = gamepad;
}

function core_handle_gamepaddisconnected(event){
    Reflect.deleteProperty(
      core_gamepads,
      event.gamepad.index
    );
}

function core_handle_keydown(event){
    if(event.ctrlKey
      || event.altKey
      || event.metaKey){
        return;
    }

    core_key_shift = event.shiftKey;

    if(core_menu_open
      && core_menu_block_events
      && !(event.code === 'Escape' || event.code === core_storage_data['reset'])){
        return;
    }

    if(core_handle_event({
        'event': event,
        'key': event.code,
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
    core_key_shift = event.shiftKey;

    if(core_handle_event({
        'event': event,
        'key': event.code,
        'object': core_keys,
        'state': false,
      })){
        return;
    }

    if(Reflect.has(core_keys, 'all')){
        let all = false;
        for(const key in core_keys){
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
    if((core_menu_open
        && core_menu_block_events)
      || event.target.id === 'core-toggle'){
        return;
    }

    if(core_key_shift && event.button === 2){
        core_handle_blur(event);
        return;
    }

    core_mouse['down-' + event.button] = true;
    core_mouse['down-x'] = event.pageX;
    core_mouse['down-y'] = event.pageY;
    core_mouse['movement-x'] = 0;
    core_mouse['movement-y'] = 0;
    core_mouse['x'] = event.pageX;
    core_mouse['y'] = event.pageY;
    core_handle_event({
      'event': event,
      'key': 'mousedown',
      'object': core_mouse['todo'],
      'todo': true,
    });
}

function core_handle_mousemove(event){
    if(core_menu_open
      && core_menu_block_events){
        return;
    }

    core_mouse['movement-x'] = event.movementX * core_storage_data['mouse-sensitivity'];
    core_mouse['movement-y'] = event.movementY * core_storage_data['mouse-sensitivity'];
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
    if(event.pageX < 0 || event.pageY < 0
      || event.pageX > globalThis.innerWidth
      || event.pageY > globalThis.innerHeight){
        core_mouse['down-0'] = false;
        core_mouse['down-1'] = false;
        core_mouse['down-2'] = false;
        core_mouse['down-3'] = false;
        core_mouse['down-4'] = false;

    }else{
        core_mouse['down-' + event.button] = false;
    }

    if(event.target.id !== 'core-toggle'){
        core_handle_event({
          'event': event,
          'key': 'mouseup',
          'object': core_mouse['todo'],
          'todo': true,
        });
    }
}

function core_handle_mousewheel(event){
    if(core_menu_open
      && core_menu_block_events){
        return;
    }

    core_handle_event({
      'event': event,
      'key': 'mousewheel',
      'object': core_mouse['todo'],
      'todo': true,
    });
}

function core_handle_pointerlockchange(event){
    const element = document.getElementById(core_mouse['pointerlock-id']);
    if(!element){
        return;
    }

    core_mouse['pointerlock-state'] = element === document.pointerLockElement;

    if(!core_mouse['pointerlock-state']){
        core_escape();
    }
}

// Required args: hex
function core_hex_to_rgb(args){
    if(args['hex'][0] === '#'){
        args['hex'] = args['hex'].slice(1);
    }
    if(args['hex'].length === 3){
        args['hex'] = args['hex'][0] + args['hex'][0]
          + args['hex'][1] + args['hex'][1]
          + args['hex'][2] + args['hex'][2];
    }

    return {
      'blue': '0x' + args['hex'][4] + args['hex'][5] | 0,
      'green': '0x' + args['hex'][2] + args['hex'][3] | 0,
      'red': '0x' + args['hex'][0] + args['hex'][1] | 0,
    };
}

function core_html(args){
    args = core_args({
      'args': args,
      'defaults': {
        'parent': false,
        'properties': {},
        'store': false,
        'todo': 'append',
        'type': 'div',
      },
    });

    const element = document.createElement(args['type']);
    for(const property in args['properties']){
        element[property] = core_handle_defaults({
          'var': args['properties'][property],
        });
    }

    if(typeof args['parent'] === 'string'){
        document.getElementById(args['parent'])[args['todo']](element);

    }else if(typeof args['parent'] === 'object'){
        args['parent'][args['todo']](element);
    }

    if(args['store'] !== false){
        core_html_store({
          'ids': [
            args['store'],
          ],
        });
    }

    return element;
}

// Required args: string
function core_html_format(args){
    return core_replace_multiple({
      'patterns': {
        //'"': '&quot;',
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '\'': '&apos;',
        '\n\r': '<br>',
      },
      'string': args['string'],
    });
}

// Required args: id, properties
function core_html_modify(args){
    const element = document.getElementById(args['id']);
    if(!element){
        return;
    }

    Object.assign(
      element,
      args['properties']
    );
}

// Required args: ids
function core_html_store(args){
    for(const id in args['ids']){
        const element = document.getElementById(args['ids'][id]);
        if(!element){
            continue;
        }

        core_elements[args['ids'][id]] = element;
    }
}

// Required args: id, src
function core_image(args){
    args = core_args({
      'args': args,
      'defaults': {
        'todo': function(){},
      },
    });

    const image = new Image();
    image.onload = args['todo'];
    image.src = args['src'];
    core_images[args['id']] = image;
    return image;
}

function core_init(){
    core_html({
      'parent': document.body,
      'properties': {
        'id': 'core-ui',
      },
      'todo': 'prepend',
    })
    core_html({
      'parent': 'core-ui',
      'properties': {
        'id': 'core-toggle',
        'onclick': core_escape,
        'type': 'button',
        'value': '☰',
      },
      'type': 'input',
    });
    core_html({
      'parent': 'core-ui',
      'properties': {
        'id': 'core-menu',
        'innerHTML': '<a id=core-menu-root></a>/<a class=external id=core-menu-title rel=noreferrer></a>'
          + '<div id=core-menu-info></div><hr>'
          + '<span id=core-menu-tabs></span>'
          + '<div id=core-menu-tabcontent></div><hr>'
          + '<input id=storage-save type=button value="Save All to localStorage">',
      },
      'type': 'span',
    });
    core_html({
      'parent': 'core-ui',
      'properties': {
        'id': 'repo-ui',
      },
      'type': 'span',
    });

    core_tab_create({
      'content': '<table><tr><td><input class=mini id=audio-volume max=1 min=0 step=any type=number><td>Audio Volume'
        + '<tr><td><input id=color-negative type=color><td>Color Negative'
        + '<tr><td><input id=color-positive type=color><td>Color Positive'
        + '<tr><td><input class=mini id=crouch type=text><td>Crouch'
        + '<tr><td><input class=mini id=decimals min=0 step=any type=number><td>Decimals'
        + '<tr><td><input class=mini id=jump type=text><td>Jump'
        + '<tr><td><input class=mini id=mouse-sensitivity min=0 step=any type=number><td>Mouse Sensitivity'
        + '<tr><td><input class=mini id=move-↑ type=text><td>Move ↑'
        + '<tr><td><input class=mini id=move-← type=text><td>Move ←'
        + '<tr><td><input class=mini id=move-↓ type=text><td>Move ↓'
        + '<tr><td><input class=mini id=move-→ type=text><td>Move →'
        + '<tr><td><input class=mini id=reset type=text><td>Reset</table>'
        + '<input id=storage-reset type=button value="Reset Global localStorage">',
      'group': 'core-menu',
      'id': 'global',
      'label': 'Global',
    });
    core_storage_add({
      'prefix': 'core-',
      'storage': {
        'audio-volume': 1,
        'color-negative': '#663366',
        'color-positive': '#206620',
        'crouch': 'KeyC',
        'decimals': 7,
        'jump': 'Space',
        'mouse-sensitivity': 1,
        'move-←': 'KeyA',
        'move-↑': 'KeyW',
        'move-→': 'KeyD',
        'move-↓': 'KeyS',
        'reset': 'KeyH',
      },
    });
    core_storage_update();

    core_mouse = {
      'down-0': false,
      'down-1': false,
      'down-2': false,
      'down-3': false,
      'down-4': false,
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
    document.onpointerlockchange = core_handle_pointerlockchange;
    globalThis.onbeforeunload = core_handle_beforeunload;
    globalThis.onblur = core_handle_blur;
    globalThis.oncontextmenu = core_handle_contextmenu;
    globalThis.ongamepadconnected = core_handle_gamepadconnected;
    globalThis.ongamepaddisconnected = core_handle_gamepaddisconnected;
    globalThis.onkeydown = core_handle_keydown;
    globalThis.onkeyup = core_handle_keyup;
    globalThis.onmousedown = core_handle_mousedown;
    globalThis.onmousemove = core_handle_mousemove;
    globalThis.onmouseup = core_handle_mouseup;
    globalThis.ontouchcancel = core_handle_mouseup;
    globalThis.ontouchend = core_handle_mouseup;
    globalThis.ontouchmove = core_handle_mousemove;
    globalThis.ontouchstart = core_handle_mousedown;
    globalThis.onwheel = core_handle_mousewheel;
    core_events_bind({
      'elements': {
        'storage-reset': {
          'onclick': function(){
              const keys = [];
              for(const key in core_storage_info){
                  if(core_storage_info[key]['prefix'] === 'core-'){
                      keys.push(key);
                  }
              }

              core_storage_reset({
                'keys': keys,
              });
          },
        },
        'storage-save': {
          'onclick': core_storage_save,
        },
      },
    });
    core_keys_rebind();

    core_call({
      'todo': 'repo_init',
    });
}

// Required args: id
function core_interval_animationFrame(args){
    core_intervals[args['id']]['var'] = globalThis.requestAnimationFrame(core_intervals[args['id']]['todo']);
}

// Required args: id, todo
function core_interval_modify(args){
    args = core_args({
      'args': args,
      'defaults': {
        'animationFrame': false,
        'interval': 25,
        'paused': false,
        'set': 'setInterval',
        'sync': false,
      },
    });

    if(args['id'] in core_intervals){
        core_interval_pause({
          'id': args['id'],
        });
    }

    core_intervals[args['id']] = {
      'animationFrame': args['animationFrame'],
      'interval': args['interval'],
      'paused': true,
      'set': args['set'],
      'sync': args['sync'],
      'todo': args['todo'],
    };

    if(!args['paused']){
        core_interval_resume({
          'id': args['id'],
        });
    }
}

// Required args: id
function core_interval_pause(args){
    if(!(args['id'] in core_intervals)){
        return;
    }

    globalThis[core_intervals[args['id']]['animationFrame']
      ? 'cancelAnimationFrame'
      : 'clearInterval'](core_intervals[args['id']]['var']);


    core_intervals[args['id']]['paused'] = true;
}

function core_interval_pause_all(){
    for(const interval in core_intervals){
        core_interval_pause({
          'id': interval,
        });
    }
}

// Required args: id
function core_interval_remove(args){
    if(!(args['id'] in core_intervals)){
        return;
    }

    core_interval_pause({
      'id': args['id'],
    });

    Reflect.deleteProperty(
      core_intervals,
      args['id']
    );
}

function core_interval_remove_all(){
    for(const interval in core_intervals){
        core_interval_remove({
          'id': interval,
        });
    }
}

// Required args: id
function core_interval_resume(args){
    if(!(args['id'] in core_intervals)
      || !core_intervals[args['id']]['paused']){
        return;
    }

    core_intervals[args['id']]['paused'] = false;

    if(core_intervals[args['id']]['animationFrame']){
        core_intervals[args['id']]['var'] = globalThis.requestAnimationFrame(core_intervals[args['id']]['todo']);

    }else if(core_intervals[args['id']]['sync']){
        core_intervals[args['id']]['todo']();

        core_intervals[args['id']]['var'] = core_interval_sync({
          'id': args['id'],
          'interval': 1000 - new Date().getMilliseconds(),
        });

    }else{
        core_intervals[args['id']]['var'] = globalThis[core_intervals[args['id']]['set']](
          core_intervals[args['id']]['todo'],
          core_intervals[args['id']]['interval']
        );
    }
}

function core_interval_resume_all(){
    for(const interval in core_intervals){
        core_interval_resume({
          'id': interval,
        });
    }
}

// Required args: id, interval
function core_interval_sync(args){
    if(core_intervals[args['id']]['paused']){
        return;
    }

    return globalThis.setTimeout(
      function(){
          core_intervals[args['id']]['todo']();

          core_intervals[args['id']]['var'] = core_interval_sync({
            'id': args['id'],
            'interval': core_intervals[args['id']]['interval'] - (new Date().getMilliseconds() % core_intervals[args['id']]['interval']),
          });
      },
      args['interval']
    );
}

function core_keys_rebind(){
    const keybinds = {};
    keybinds[core_storage_data['crouch']] = {};
    keybinds[core_storage_data['jump']] = {};
    keybinds[core_storage_data['move-←']] = {};
    keybinds[core_storage_data['move-↑']] = {};
    keybinds[core_storage_data['move-→']] = {};
    keybinds[core_storage_data['move-↓']] = {};
    Object.assign(
      keybinds,
      core_key_rebinds
    );
    keybinds['Escape'] = {
      'solo': true,
      'todo': core_escape,
    };
    keybinds[core_storage_data['reset']] = {
      'solo': true,
      'todo': core_repo_reset,
    };
    core_events_bind({
      'clearkeys': true,
      'keybinds': keybinds,
    });
}

// Required args: keybinds
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

    for(const keybind in args['keybinds']){
        core_keys[keybind] = core_handle_defaults({
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

    for(const mousebind in args['mousebinds']){
        core_mouse['todo'][mousebind] = {
          'loop': args['mousebinds'][mousebind]['loop'] || false,
          'preventDefault': args['mousebinds'][mousebind]['preventDefault'] || false,
          'todo': args['mousebinds'][mousebind]['todo'] || function(){},
        };
    }
}

// Required args: number
function core_number_format(args){
    args = core_args({
      'args': args,
      'defaults': {
        'decimals-max': core_storage_data['decimals'],
        'decimals-min': core_storage_data['decimals'],
      },
    });

    if(args['decimals-max'] < args['decimals-min']){
        args['decimals-min'] = args['decimals-max'];
    }

    return new Intl.NumberFormat(
        void 0,
        {
          'maximumFractionDigits': args['decimals-max'],
          'minimumFractionDigits': args['decimals-min'],
        }
      ).format(args['number']);
}

function core_random_boolean(args){
    args = core_args({
      'args': args,
      'defaults': {
        'chance': .5,
      },
    });

    return Math.random() < args['chance'];
}

function core_random_crypto(args){
    args = core_args({
      'args': args,
      'defaults': {
        'length': 1,
        'type': 'Uint8Array',
      },
    });

    const array = new globalThis[args['type']](args['length']);

    globalThis.crypto.getRandomValues(array);

    return array;
}

function core_random_hex(){
    const color = core_random_rgb();

    const blue = '0' + color['blue'].toString(16);
    const green = '0' + color['green'].toString(16);
    const red = '0' + color['red'].toString(16);

    return red.slice(-2) + green.slice(-2) + blue.slice(-2);
}

function core_random_integer(args){
    args = core_args({
      'args': args,
      'defaults': {
        'max': 100,
        'todo': 'floor',
      },
    });

    return Math[args['todo']](core_random_number({
      'multiplier': args['max'],
    }));
}

// Required args: object
function core_random_key(args){
    const keys = Object.keys(args['object']);

    return keys[core_random_integer({
      'max': keys.length,
    })];
}

function core_random_number(args){
    args = core_args({
      'args': args,
      'defaults': {
        'multiplier': 1,
      },
    });

    return Math.random() * args['multiplier'];
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

// Required args: array
function core_random_splice(args){
    return args['array'].splice(
      core_random_integer({
        'max': args['array'].length,
      }),
      1
    )[0];
}

function core_random_string(args){
    args = core_args({
      'args': args,
      'defaults': {
        'characters': '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        'length': 100,
      },
    });

    let string = '';
    for(let loopCounter = 0; loopCounter < args['length']; loopCounter++){
        string += args['characters'][core_random_integer({
          'max': args['characters'].length,
        })];
    }
    return string;
}

// Required args: patterns, string
function core_replace_multiple(args){
    let string_value = args['string'];
    for(const pattern in args['patterns']){
        string_value = string_value.replace(
          new RegExp(
            pattern,
            'g'
          ),
          args['patterns'][pattern]
        );
    }

    return string_value;
}

// Required args: title
function core_repo_init(args){
    args = core_args({
      'args': args,
      'defaults': {
        'beforeunload': false,
        'events': {},
        'globals': {},
        'images': {},
        'info': '',
        'keybinds': false,
        'link': false,
        'menu': false,
        'menu-block-events': true,
        'menu-lock': false,
        'mousebinds': false,
        'owner': 'iterami',
        'reset': false,
        'root': '../index.htm',
        'storage': false,
        'storage-menu': '',
        'tabs': {},
        'ui': '',
      },
    });

    Object.assign(
      globalThis,
      args['globals']
    );

    core_repo_title = args['title'];
    if(args['info'].length){
        document.getElementById('core-menu-info').innerHTML = '<hr>' + args['info'];
    }
    if(args['storage'] !== false){
        core_storage_add({
          'storage': args['storage'],
        });
        core_tab_create({
          'content': args['storage-menu']
            + '<input id=storage-reset-repo type=button value="Reset ' + core_repo_title + ' localStorage">',
          'group': 'core-menu',
          'id': 'repo',
          'label': core_repo_title,
        });
        args['events']['storage-reset-repo'] = {
          'onclick': function(){
              core_storage_reset({
                'label': core_repo_title,
                'prefix': core_repo_title + '-',
              });
          },
        };
    }
    core_html_modify({
      'id': 'core-menu-root',
      'properties': {
        'href': args['root'],
        'textContent': args['owner'],
      },
    });
    if(args['link'] === false){
        args['link'] = 'https://github.com/' + args['owner'] + '/' + core_repo_title;
    }
    core_html_modify({
      'id': 'core-menu-title',
      'properties': {
        'href': args['link'],
        'textContent': core_repo_title,
      },
    });
    document.getElementById('repo-ui').innerHTML = args['ui'];

    let have_default = false;
    for(const tab in args['tabs']){
        core_tab_create({
          'content': args['tabs'][tab]['content'],
          'group': args['tabs'][tab]['group'],
          'id': tab,
          'label': args['tabs'][tab]['label'],
        });

        if(args['tabs'][tab]['default']){
            core_tab_switch({
              'id': 'tab_' + args['tabs'][tab]['group'] + '_' + tab,
            });
            have_default = true;
        }
    }
    if(!have_default){
        core_tab_switch({
          'id': 'tab_core-menu_repo',
        });
    }

    core_storage_update();

    if(args['keybinds'] !== false){
        core_key_rebinds = args['keybinds'];
    }
    core_menu_block_events = args['menu-block-events'];
    core_menu_lock = args['menu-lock'];
    core_reset_todo = args['reset'];
    core_events_bind({
      'beforeunload': args['beforeunload'],
      'elements': args['events'],
      'keybinds': args['keybinds'],
      'mousebinds': args['mousebinds'],
    });

    for(const image in args['images']){
        core_image({
          'id': image,
          'src': args['images'][image],
        });
    }

    if(args['menu']){
        core_escape(true);
    }
}

function core_repo_reset(){
    if(core_reset_todo !== false){
        core_reset_todo();
    }
}

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

    const element = document.getElementById(args['id']);
    if(!element){
        return;
    }

    element.requestPointerLock();

    core_mouse['pointerlock-id'] = args['id'];
}

// Required args: number
function core_round(args){
    args = core_args({
      'args': args,
      'defaults': {
        'decimals': core_storage_data['decimals'],
      },
    });

    const eIndex = String(args['number']).indexOf('e');
    let eString = '';
    if(eIndex >= 0){
        eString = String(args['number']).slice(eIndex);
        args['number'] = String(args['number']).slice(
          0,
          eIndex
        );

        const power = Number(eString.slice(2));
        if(power === args['decimals']){
            eString = 'e-' + (power + 1);
        }
    }

    let result = Number(
      Math.round(args['number'] + 'e+' + args['decimals'])
        + 'e-' + args['decimals']
    );

    if(eString.length){
        result = Number(result + eString);
    }

    if(Number.isNaN(result)
      || Math.abs(result) < Number('1e-' + args['decimals'])){
        result = 0;
    }

    return result;
}

// Required args: array, todo
function core_sort_custom(args){
    args = core_args({
      'args': args,
      'defaults': {
        'reverse': false,
      },
    });

    const array_clone = [...args['array']];

    array_clone.sort(args['todo']);
    if(args['reverse']){
        array_clone.reverse();
    }

    return array_clone;
}

// Required args: array
function core_sort_numbers(args){
    return core_sort_custom({
      'array': args['array'],
      'reverse': args['reverse'],
      'todo': function(a, b){
          return a - b;
      },
    });
}

// Required args: array, property
function core_sort_property(args){
    return core_sort_custom({
      'array': args['array'],
      'reverse': args['reverse'],
      'todo': function(a, b){
          if(a[args['property']] > b[args['property']]){
              return 1;

          }else if(a[args['property']] < b[args['property']]){
              return -1;
          }

          return 0;
      },
    });
}

// Required args: array
function core_sort_random(args){
    return core_sort_custom({
      'array': args['array'],
      'todo': function(a, b){
          return Math.random() - .5;
      },
    });
}

// Required args: array
function core_sort_strings(args){
    const collator = new Intl.Collator();

    return core_sort_custom({
      'array': args['array'],
      'reverse': args['reverse'],
      'todo': collator.compare,
    });
}

// Required args: storage
function core_storage_add(args){
    args = core_args({
      'args': args,
      'defaults': {
        'prefix': core_repo_title + '-',
      },
    });

    for(const key in args['storage']){
        core_storage_info[key] = {
          'default': args['storage'][key],
          'prefix': args['prefix'],
        };
        core_storage_data[key] = globalThis.localStorage.getItem(args['prefix'] + key);

        if(core_storage_data[key] === null){
            core_storage_data[key] = core_storage_info[key]['default'];
        }

        core_storage_data[key] = core_type_convert({
          'template': core_storage_info[key]['default'],
          'value': core_storage_data[key],
        });
    }
}

// Required args: element, key
function core_storage_element_property(args){
    return core_type({
      'type': 'boolean',
      'var': core_storage_info[args['key']]['default'],
    })
      ? 'checked'
      : (args['element'].tagName === 'DIV' || args['element'].tagName === 'SPAN'
        ? 'innerHTML'
        : 'value');
}

function core_storage_reset(args){
    args = core_args({
      'args': args,
      'defaults': {
        'keys': false,
        'label': 'global',
        'prefix': false,
      },
    });

    if(!globalThis.confirm('Reset ' + args['label'] + ' localStorage?')){
        return false;
    }

    let keys = [];

    if(args['prefix'] !== false){
        for(const key in core_storage_info){
            if(core_storage_info[key]['prefix'] === args['prefix']){
                keys.push(key);
            }
        }

    }else{
        keys = args['keys'] === false
          ? Object.keys(core_storage_data)
          : args['keys'];
    }

    for(const keyid in keys){
        const key = keys[keyid];

        core_storage_data[key] = core_storage_info[key]['default'];
        globalThis.localStorage.removeItem(core_storage_info[key]['prefix'] + key);
    }

    core_storage_update();
    return true;
}

function core_storage_save(args){
    args = core_args({
      'args': args,
      'defaults': {
        'keys': false,
      },
    });

    let keys = args['keys'];
    if(keys === false){
        keys = Object.keys(core_storage_data);
    }

    for(const keyid in keys){
        const key = keys[keyid];

        const element = document.getElementById(key);
        const data = core_type_convert({
          'template': core_storage_info[key]['default'],
          'value': element[core_storage_element_property({
            'element': element,
            'key': key,
          })],
        });
        core_storage_data[key] = data;

        if(data !== void 0
          && !Number.isNaN(data)
          && String(data).length
          && data !== core_storage_info[key]['default']){
            globalThis.localStorage.setItem(
              core_storage_info[key]['prefix'] + key,
              data
            );

        }else{
            globalThis.localStorage.removeItem(core_storage_info[key]['prefix'] + key);
        }
    }

    core_keys_rebind();
}

function core_storage_update(args){
    args = core_args({
      'args': args,
      'defaults': {
        'keys': false,
      },
    });

    let keys = args['keys'];
    if(keys === false){
        keys = Object.keys(core_storage_data);
    }

    for(const keyid in keys){
        const key = keys[keyid];

        const element = document.getElementById(key);
        element[core_storage_element_property({
          'element': element,
          'key': key,
        })] = core_storage_data[key];
    }
}

// Required args: content, group, id, label
function core_tab_create(args){
    core_tabs[args['id']] = {
      'content': args['content'],
      'group': args['group'],
    };

    core_html({
      'parent': args['group'] + '-tabs',
      'properties': {
        'id': 'tab_' + args['group'] + '_' + args['id'],
        'onclick': function(){
            core_tab_switch({
              'id': this.id,
            });
        },
        'type': 'button',
        'value': args['label'],
      },
      'type': 'input',
    });
    core_html({
      'parent': args['group'] + '-tabcontent',
      'properties': {
        'id': 'tabcontent-' + args['id'],
        'innerHTML': args['content'],
        'style': 'display:none',
      },
    });
}

// Required args: id
function core_tab_reset_group(args){
    for(const tab in core_tabs){
        if(core_tabs[tab]['group'] === args['id']){
            document.getElementById('tabcontent-' + tab).style.display = 'none';
        }
    }
}

// Required args: id
function core_tab_switch(args){
    const info = args['id'].split('_');

    const element = document.getElementById('tabcontent-' + info[2]);
    if(!element){
        return;
    }

    const state = element.style.display === 'block';
    core_tab_reset_group({
      'id': info[1],
    });
    element.style.display = state
      ? 'none'
      : 'block';
}

// Required args: var
function core_type(args){
    args = core_args({
      'args': args,
      'defaults': {
        'type': 'function',
      },
    });

    if(args['type'] === 'function'){
        return typeof args['var'] === 'function'
          || typeof globalThis[args['var']] === 'function';

    }else if(args['type'] === 'array'){
        return args['var'] instanceof Array;

    }else if(args['type'] === 'object'){
        return args['var'] instanceof Object
          && !(args['var'] instanceof Array)
          && typeof args['var'] !== 'function';
    }

    return typeof args['var'] === args['type'];
}

// Required args: template, value
function core_type_convert(args){
    if(core_type({
        'type': 'string',
        'var': args['template'],
      })){
        return args['value'];

    }else if(!Number.isNaN(Number.parseFloat(args['template']))){
        return Number.parseFloat(args['value']);

    }else if(core_type({
        'type': 'boolean',
        'var': args['template'],
      }) && !core_type({
        'type': 'boolean',
        'var': args['value'],
      })){
        return args['value'] === 'true';
    }

    return args['value'];
}

function core_ui_update(args){
    args = core_args({
      'args': args,
      'defaults': {
        'class': false,
        'ids': {},
      },
    });

    for(const id in args['ids']){
        if(core_ui_values[id] === args['ids'][id]){
            continue;
        }

        core_ui_values[id] = args['ids'][id];

        const element = document.getElementById(id);
        element[element.tagName !== 'INPUT'
          ? 'innerHTML'
          : 'value'] = args['ids'][id];

        if(!args['class']){
            continue;
        }

        const elements = document.getElementsByClassName(id);
        for(let i = 0; i < elements.length; i++){
             const item = elements.item(i);
             item[item.tagName !== 'INPUT'
               ? 'innerHTML'
               : 'value'] = args['ids'][id];
        }
    }
}

function core_uri(args){
    args = core_args({
      'args': args,
      'defaults': {
        'id': 'canvas',
        'quality': 1,
        'type': 'image/png',
      },
    });

    return document.getElementById(args['id']).toDataURL(
      args['type'],
      args['quality']
    );
}

globalThis.core_elements = {};
globalThis.core_events = {};
globalThis.core_gamepads = {};
globalThis.core_images = {};
globalThis.core_intervals = {};
globalThis.core_key_rebinds = {};
globalThis.core_key_shift = false;
globalThis.core_keys = {};
globalThis.core_menu_block_events = true;
globalThis.core_menu_lock = false;
globalThis.core_menu_open = false;
globalThis.core_mode = 0;
globalThis.core_mouse = {};
globalThis.core_repo_title = '';
globalThis.core_reset_todo = false;
globalThis.core_storage_data = {};
globalThis.core_storage_info = {};
globalThis.core_tabs = {};
globalThis.core_ui_values = {};

globalThis.onload = core_init;
