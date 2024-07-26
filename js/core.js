'use strict';

// Required args: args, defaults
function core_args(args){
    if(args['args'] === void 0){
        return args['defaults'];
    }

    for(const arg in args['defaults']){
        if(args['args'][arg] === void 0){
            args['args'][arg] = args['defaults'][arg];
        }
    }

    return args['args'];
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
      && core_menu_open
      && force !== true){
        return;
    }
    if(core_type(force) === 'boolean'){
        core_menu_open = force;

    }else{
        core_menu_open = !core_menu_open;
    }

    if(!core_menu_open){
        core_elements['core-toggle'].blur();
        core_elements['core-menu'].style.display = 'none';
        core_elements['core-ui'].style.userSelect = 'none';
        core_elements['repo-ui'].style.display = 'inline';
        core_interval_resume_all();

    }else{
        core_interval_pause_all();
        core_elements['repo-ui'].style.display = 'none';
        core_elements['core-ui'].style.userSelect = 'auto';
        core_elements['core-menu'].style.display = 'inline';
    }

    globalThis['repo_escape']?.();
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
        core_events['beforeunload'] = core_args({
          'args': args['beforeunload'],
          'defaults': {
            'loop': false,
            'preventDefault': false,
            'solo': false,
            'state': false,
            'todo': function(){},
          },
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
            const domelement = core_getelement(element);
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

function core_getelement(id){
    if(Object.hasOwn(core_elements, id)){
        return core_elements[id];
    }

    return document.getElementById(id);
}

function core_handle_beforeunload(event){
    const result = core_handle_event({
      'event': event,
      'key': 'beforeunload',
      'object': core_events,
      'todo': true,
    });

    core_storage_save();

    if(core_type(result) === 'string'){
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
    if(!core_menu_open
      && core_handle_event({
        'event': event,
        'key': 'contextmenu',
        'object': core_mouse['todo'],
        'todo': true,
      }) === void 0){
        return false;
    }
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

    if(args['key'] in args['object']){
        if(args['object'][args['key']]['preventDefault']
          && !core_menu_open){
            args['event'].preventDefault();
        }

        if(args['state'] !== void 0){
            args['object'][args['key']]['state'] = args['state'];
        }

        if(args['todo'] !== void 0
          && !args['object'][args['key']]['loop']){
            const returned = args['object'][args['key']]['todo'](args['event']);
            if(returned !== void 0){
                return returned;
            }
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
    delete core_gamepads[event.gamepad.index];
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

    if('all' in core_keys){
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

    core_mouse['movement-x'] = event.movementX * core_storage_data['mouse-horizontal'];
    core_mouse['movement-y'] = event.movementY * core_storage_data['mouse-vertical'];
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
    core_mouse['pointerlock-state'] = document.pointerLockElement !== null
      && document.pointerLockElement.id === core_mouse['pointerlock-id'];

    if(!core_mouse['pointerlock-state']){
        core_escape(true);
    }
}

function core_hex_to_rgb(hex){
    if(hex[0] === '#'){
        hex = hex.slice(1);
    }
    if(hex.length === 3){
        hex = hex[0] + hex[0]
          + hex[1] + hex[1]
          + hex[2] + hex[2];
    }

    return {
      'blue': '0x' + hex[4] + hex[5] | 0,
      'green': '0x' + hex[2] + hex[3] | 0,
      'red': '0x' + hex[0] + hex[1] | 0,
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

    if(args['properties']['id']){
        const existing_element = core_getelement(args['properties']['id']);
        if(existing_element){
            return existing_element;
        }
    }

    const element = document.createElement(args['type']);
    Object.assign(
      element,
      args['properties'],
    );
    if(args['parent'] !== false){
        args['parent'][args['todo']](element);
    }

    if(args['store'] !== false){
        core_elements[args['store']] = element;
    }

    return element;
}

function core_html_format(string){
    return core_replace_multiple({
      'patterns': {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '\'': '&#39;',
        '"': '&#34;',
        '\n\r': '<br>',
      },
      'string': string,
    });
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
      'store': 'core-ui',
      'todo': 'prepend',
    });
    core_html({
      'parent': core_elements['core-ui'],
      'properties': {
        'id': 'core-toggle',
        'onclick': core_escape,
        'textContent': '☰',
      },
      'store': 'core-toggle',
      'type': 'button',
    });
    core_html({
      'parent': core_elements['core-ui'],
      'properties': {
        'id': 'core-menu',
        'innerHTML': '<a id=core-menu-root></a>/<a class=external id=core-menu-title rel=noreferrer></a><hr>'
          + '<span id=core-menu-tabs></span><div id=core-menu-tabcontent></div><hr>'
          + '<button id=storage-save type=button>Save All Settings</button><button id=mobile-add type=button>Mobile</button><br>',
        'style': 'display:none',
      },
      'store': 'core-menu',
      'type': 'span',
    });
    core_html({
      'parent': core_elements['core-ui'],
      'properties': {
        'id': 'repo-ui',
      },
      'store': 'repo-ui',
      'type': 'span',
    });

    core_tab_create({
      'content': '<table><tr><td><input class=mini id=audio-volume min=0 step=any type=number><td>Audio Volume'
        + '<tr><td><input class=mini id=crouch type=text><td>Crouch'
        + '<tr><td><input class=mini id=jump type=text><td>Jump'
        + '<tr><td><input class=mini id=mouse-horizontal step=any type=number><td>Mouse Sensitivity<br>Horizontal'
        + '<tr><td><input class=mini id=mouse-vertical step=any type=number><td>Mouse Sensitivity<br>Vertical'
        + '<tr><td><input class=mini id=move-↑ type=text><td>Move ↑'
        + '<tr><td><input class=mini id=move-← type=text><td>Move ←'
        + '<tr><td><input class=mini id=move-↓ type=text><td>Move ↓'
        + '<tr><td><input class=mini id=move-→ type=text><td>Move →'
        + '<tr><td><input class=mini id=reset type=text><td>Reset</table>'
        + '<button id=storage-reset type=button>Reset Global Settings</button>',
      'group': 'core-menu',
      'id': 'global',
      'label': 'Global',
    });
    core_storage_add({
      'prefix': 'core-',
      'storage': {
        'audio-volume': 1,
        'crouch': 'KeyC',
        'jump': 'Space',
        'mouse-horizontal': 1,
        'mouse-vertical': 1,
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
        'mobile-add': {
          'onclick': core_keys_mobile,
        },
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

    globalThis['repo_init']?.();
}

function core_interval_animationFrame(id){
    core_intervals[id]['var'] = globalThis.requestAnimationFrame(core_intervals[id]['todo']);
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

    if(core_type(args['todo']) !== 'function'){
        return;
    }

    core_interval_pause(args['id']);

    core_intervals[args['id']] = {
      'animationFrame': args['animationFrame'],
      'interval': args['interval'],
      'paused': true,
      'set': args['set'],
      'sync': args['sync'],
      'todo': args['todo'],
    };

    if(!args['paused']){
        core_interval_resume(args['id']);
    }
}

function core_interval_pause(id){
    if(!Object.hasOwn(core_intervals, id)){
        return;
    }

    globalThis[core_intervals[id]['animationFrame']
      ? 'cancelAnimationFrame'
      : 'clearInterval'](core_intervals[id]['var']);

    core_intervals[id]['paused'] = true;
}

function core_interval_pause_all(){
    for(const interval in core_intervals){
        core_interval_pause(interval);
    }
}

function core_interval_remove(id){
    core_interval_pause(id);
    delete core_intervals[id];
}

function core_interval_remove_all(){
    for(const interval in core_intervals){
        core_interval_remove(interval);
    }
}

function core_interval_resume(id){
    if(!Object.hasOwn(core_intervals, id)
      || !core_intervals[id]['paused']){
        return;
    }

    core_intervals[id]['paused'] = false;

    if(core_intervals[id]['animationFrame']){
        core_intervals[id]['var'] = globalThis.requestAnimationFrame(core_intervals[id]['todo']);

    }else if(core_intervals[id]['sync']){
        core_intervals[id]['todo']();

        core_intervals[id]['var'] = core_interval_sync({
          'id': id,
          'interval': 1000 - new Date().getMilliseconds(),
        });

    }else{
        core_intervals[id]['var'] = globalThis[core_intervals[id]['set']](
          core_intervals[id]['todo'],
          core_intervals[id]['interval']
        );
    }
}

function core_interval_resume_all(){
    for(const interval in core_intervals){
        core_interval_resume(interval);
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

function core_keys_mobile(){
    const mobile_ui = core_html({
      'parent': core_elements['core-ui'],
      'properties': {
        'id': 'mobile-ui',
        'style': 'display:none',
      },
      'type': 'span',
    });
    mobile_ui.style.display = mobile_ui.style.display === 'none'
      ? 'block'
      : 'none';

    const keys = ['KeyA', 'KeyD', 'KeyW', 'KeyS', 'Space', 'KeyC', 'KeyH'];
    for(const key in core_keys){
        if(key === 'Escape'
          || keys.includes(key)){
            continue;
        }

        keys.push(key);
    }

    for(const key in keys){
        core_html({
          'parent': mobile_ui,
          'properties': {
            'id': 'mobile-ui-' + keys[key],
            'textContent': keys[key],
            'onclick': function(){
                core_keys[keys[key]]['todo']();
            },
            'onmousedown': function(){
                core_keys[keys[key]]['state'] = true;
            },
            'onmouseleave': function(){
                core_keys[keys[key]]['state'] = false;
            },
            'onmouseup': function(){
                core_keys[keys[key]]['state'] = false;
            },
            'ontouchcancel': function(){
                core_keys[keys[key]]['state'] = false;
            },
            'ontouchend': function(){
                core_keys[keys[key]]['state'] = false;
            },
            'ontouchstart': function(){
                core_keys[keys[key]]['state'] = true;
            },
            'type': 'button',
          },
          'type': 'button',
        });
    }
}

function core_keys_rebind(){
    core_events_bind({
      'clearkeys': true,
      'keybinds': {
        'Escape': {
          'solo': true,
          'todo': core_escape,
        },
        [core_storage_data['crouch']]: {},
        [core_storage_data['jump']]: {},
        [core_storage_data['move-←']]: {},
        [core_storage_data['move-↑']]: {},
        [core_storage_data['move-→']]: {},
        [core_storage_data['move-↓']]: {},
        [core_storage_data['reset']]: {
          'solo': true,
          'todo': core_repo_reset,
        },
        ...core_key_rebinds,
      },
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
        core_keys[keybind] = core_args({
          'args': args['keybinds'][keybind],
          'defaults': {
            'loop': false,
            'preventDefault': false,
            'solo': false,
            'state': false,
            'todo': function(){},
          },
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
        'decimals-max': 7,
        'decimals-min': 7,
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

function core_random_boolean(chance){
    if(chance === void 0){
        chance = .5;
    }

    return Math.random() < chance;
}

function core_random_crypto(args){
    args = core_args({
      'args': args,
      'defaults': {
        'array': 'Uint8Array',
        'length': 1,
      },
    });

    if(core_type(args['array']) === 'string'){
        args['array'] = new globalThis[args['array']](args['length']);
    }

    globalThis.crypto.getRandomValues(args['array']);
    return args['array'];
}

function core_random_hex(){
    return Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
}

function core_random_integer(args){
    args = core_args({
      'args': args,
      'defaults': {
        'max': 100,
        'todo': 'floor',
      },
    });

    return Math[args['todo']](Math.random() * args['max']);
}

function core_random_key(object){
    const keys = Object.keys(object);

    return keys[core_random_integer({
      'max': keys.length,
    })];
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

function core_random_splice(array){
    return array.splice(
      core_random_integer({
        'max': array.length,
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
    for(let i = 0; i < args['length']; i++){
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
        'ui-elements': [],
      },
    });

    Object.assign(
      globalThis,
      args['globals']
    );

    core_repo_title = args['title'];
    if(args['info'].length){
        core_html({
          'parent': document.getElementById('core-menu-title'),
          'properties': {
            'id': 'core-menu-info',
            'innerHTML': '<hr>' + args['info'],
          },
          'todo': 'after',
        });
    }
    if(args['storage'] !== false){
        core_tab_create({
          'content': args['storage-menu']
            + '<button id=storage-reset-repo type=button>Reset ' + core_repo_title + ' Settings</button>',
          'group': 'core-menu',
          'id': 'repo',
          'label': core_repo_title,
        });
        core_storage_add({
          'storage': args['storage'],
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
    Object.assign(
      document.getElementById('core-menu-root'),
      {
        'href': args['root'],
        'textContent': args['owner'],
      }
    );
    Object.assign(
      document.getElementById('core-menu-title'),
      {
        'href': args['link'] === false
          ? 'https://github.com/' + args['owner'] + '/' + core_repo_title
          : args['link'],
        'textContent': core_repo_title,
      }
    );
    core_elements['repo-ui'].innerHTML = args['ui'];

    let have_default = false;
    for(const tab in args['tabs']){
        core_tab_create({
          'content': args['tabs'][tab]['content'],
          'group': args['tabs'][tab]['group'],
          'id': tab,
          'label': args['tabs'][tab]['label'],
        });

        if(args['tabs'][tab]['default']){
            core_tab_switch('tab_' + args['tabs'][tab]['group'] + '_' + tab);
            have_default = true;
        }
    }
    if(!have_default){
        core_tab_switch('tab_core-menu_repo');
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
    for(const element in args['ui-elements']){
        core_elements[args['ui-elements'][element]] = document.getElementById(args['ui-elements'][element]);
    }

    if(args['menu']
      || args['menu-lock']){
        core_escape(true);
    }
}

function core_repo_reset(){
    if(core_reset_todo !== false){
        core_reset_todo();
    }
}

function core_requestpointerlock(element){
    if(core_menu_open){
        return;
    }

    core_mouse['pointerlock-id'] = element.id;
    element.requestPointerLock();
}

// Required args: number
function core_round(args){
    args = core_args({
      'args': args,
      'defaults': {
        'decimals': 7,
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

    if(globalThis.isNaN(result)
      || Math.abs(result) < Number('1e-' + args['decimals'])){
        return 0;
    }

    return result;
}

// Required args: array, todo
function core_sort_custom(args){
    args = core_args({
      'args': args,
      'defaults': {
        'clone': true,
        'reverse': false,
      },
    });

    const target_array = args['clone']
      ? [...args['array']]
      : args['array'];

    target_array.sort(args['todo']);
    if(args['reverse']){
        target_array.reverse();
    }

    return target_array;
}

// Required args: array
function core_sort_numbers(args){
    return core_sort_custom({
      'array': args['array'],
      'clone': args['clone'],
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
      'clone': args['clone'],
      'reverse': args['reverse'],
      'todo': function(a, b){
          if(a[args['property']] > b[args['property']]){
              return 1;
          }
          if(a[args['property']] < b[args['property']]){
              return -1;
          }
          return 0;
      },
    });
}

function core_sort_random(args){
    return core_sort_custom({
      'array': args['array'],
      'clone': args['clone'],
      'todo': function(a, b){
          return core_random_boolean(.5);
      },
    });
}

// Required args: array
function core_sort_strings(args){
    return core_sort_custom({
      'array': args['array'],
      'clone': args['clone'],
      'reverse': args['reverse'],
      'todo': new Intl.Collator().compare,
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
        const value = globalThis.localStorage.getItem(args['prefix'] + key);
        core_storage_data[key] = value === null
          ? core_storage_info[key]['default']
          : core_type_convert({
              'template': core_storage_info[key]['default'],
              'value': value,
            });
        core_elements[key] = document.getElementById(key);
    }
}

// Required args: element, key
function core_storage_element_property(args){
    return core_type(core_storage_info[args['key']]['default']) === 'boolean'
      ? 'checked'
      : (args['element'].tagName === 'DIV' || args['element'].tagName === 'SPAN'
        ? 'textContent'
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

    if(!globalThis.confirm('Reset ' + args['label'] + ' Settings?')){
        return;
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
}

function core_storage_save(keys){
    if(core_type(keys) !== 'array'){
        keys = Object.keys(core_storage_data);
    }

    for(const keyid in keys){
        const key = keys[keyid];

        const element = core_elements[key];
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

function core_storage_update(keys){
    if(core_type(keys) !== 'array'){
        keys = Object.keys(core_storage_data);
    }

    for(const keyid in keys){
        const key = keys[keyid];

        const element = core_elements[key];
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
      'parent': document.getElementById(args['group'] + '-tabs'),
      'properties': {
        'id': 'tab_' + args['group'] + '_' + args['id'],
        'onclick': function(){
            core_tab_switch(this.id);
        },
        'textContent': args['label'],
      },
      'type': 'button',
    });
    core_html({
      'parent': document.getElementById(args['group'] + '-tabcontent'),
      'properties': {
        'id': 'tabcontent-' + args['id'],
        'innerHTML': args['content'],
        'style': 'display:none',
      },
    });
}

function core_tab_reset_group(id){
    for(const tab in core_tabs){
        if(core_tabs[tab]['group'] === id){
            document.getElementById('tabcontent-' + tab).style.display = 'none';
        }
    }
}

function core_tab_switch(id){
    const info = id.split('_');

    const element = document.getElementById('tabcontent-' + info[2]);
    if(!element){
        return;
    }

    const state = element.style.display === 'block';
    core_tab_reset_group(info[1]);
    element.style.display = state
      ? 'none'
      : 'block';
}

function core_type(variable){
    if(variable === void 0
      || variable === null){
        return 'undefined';
    }

    return variable.constructor.name.toLowerCase();
}

// Required args: template, value
function core_type_convert(args){
    if(core_type(args['template']) === 'string'){
        return String(args['value']);
    }
    if(!globalThis.isNaN(Number.parseFloat(args['template']))){
        return Number.parseFloat(args['value']);
    }
    if(core_type(args['template']) === 'boolean'
      && core_type(args['value']) !== 'boolean'){
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

        if(!Object.hasOwn(core_elements, id)){
            core_elements[id] = document.getElementById(id);
        }

        const element = core_elements[id];
        element[element.tagName !== 'INPUT'
          ? 'textContent'
          : 'value'] = args['ids'][id];

        if(!args['class']){
            continue;
        }

        const elements = document.getElementsByClassName(id);
        for(let i = 0; i < elements.length; i++){
             const item = elements.item(i);
             item[item.tagName !== 'INPUT'
               ? 'textContent'
               : 'value'] = args['ids'][id];
        }
    }
}

// Required args: element
function core_uri(args){
    args = core_args({
      'args': args,
      'defaults': {
        'quality': 1,
        'type': 'image/png',
      },
    });

    return args['element'].toDataURL(
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
