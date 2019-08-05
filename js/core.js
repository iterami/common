'use strict';

// Required args: todo, url
function core_ajax(args){
    args = core_args({
      'args': args,
      'defaults': {
        'data': null,
        'readyState': 4,
        'status': 200,
        'type': 'GET',
      },
    });

    let ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function(){
        if(this.readyState === args['readyState']
          && this.status === args['status']){
            args['todo'](this.responseText);
        }
    };

    ajax.open(
      args['type'],
      args['url']
    );
    ajax.send(args['data']);
}

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
        window[args['todo']](args['args']);
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

    let sign = args['number'] < 0
      ? '-'
      : '';
    let number = Math.abs(args['number']);
    let fraction = String(core_round({
      'number': number % 1,
    })).substring(1);
    number = String(Math.trunc(number));

    while(number.length < args['digits']){
        number = '0' + number;
    }

    return sign + number + fraction;
}

function core_escape(){
    core_menu_open = !core_menu_open;

    if(!core_menu_open){
        document.getElementById('core-menu').style.display = 'none';
        document.getElementById('core-ui').style.userSelect = 'none';
        document.getElementById('repo-ui').style.display = 'block';

        core_storage_save();
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
        for(let element in args['elements']){
            let domelement = document.getElementById(element);
            for(let event in args['elements'][element]){
                domelement[event] = args['elements'][element][event];
            }
        }
    }
}

function core_events_keyinfo(event){
    let code = event.keyCode || event.which;
    return {
      'code': code,
      'key': String.fromCharCode(code),
    };
}

function core_events_todoloop(){
    for(let key in core_keys){
        if(core_keys[key]['state']
          && core_keys[key]['loop']){
            core_keys[key]['todo']();
        }
    }
    for(let mousebind in core_mouse['todo']){
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

    let filereader = new FileReader();
    filereader.onload = function(event){
        args['todo'](event);
    };
    filereader[args['type']](args['file']);
}

function core_handle_beforeunload(event){
    let result = core_handle_event({
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
    for(let key in core_keys){
        core_keys[key]['state'] = false;
    }
    core_mouse['down-0'] = false;
    core_mouse['down-1'] = false;
    core_mouse['down-2'] = false;
    core_mouse['down-3'] = false;
    core_mouse['down-4'] = false;
}

function core_handle_contextmenu(event){
    let result = core_handle_event({
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

    let object = args['default'];
    for(let property in args['var']){
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

    if(args['object'].hasOwnProperty(args['key'])){
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
    let gamepad = event.gamepad;
    core_gamepads[gamepad.index] = gamepad;
}

function core_handle_gamepaddisconnected(event){
    delete core_gamepads[event.gamepad.index];
}

function core_handle_keydown(event){
    if(event.ctrlKey){
        return;
    }

    let key = core_events_keyinfo(event);

    if(core_menu_open
      && core_menu_block_events
      && key['code'] !== 27){
        return;
    }

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
    let key = core_events_keyinfo(event);

    if(core_handle_event({
        'event': event,
        'key': key['code'],
        'object': core_keys,
        'state': false,
      })){
        return;
    }

    if(core_keys.hasOwnProperty('all')){
        let all = false;
        for(let key in core_keys){
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
      || event['target'].tagName.toLowerCase() === 'input'){
        return;
    }

    core_mouse['down-' + event.button] = true;
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
    core_mouse['down-' + event.button] = false;
    core_handle_event({
      'event': event,
      'key': 'mouseup',
      'object': core_mouse['todo'],
      'todo': true,
    });
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
    let element = document.getElementById(core_mouse['pointerlock-id']);
    if(!element){
        return;
    }

    core_mouse['pointerlock-state'] = element === document.pointerLockElement;

    if(!core_mouse['pointerlock-state']){
        core_escape();
    }
};

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

    let rgb = {
      'blue': '0x' + args['hex'][4] + args['hex'][5] | 0,
      'green': '0x' + args['hex'][2] + args['hex'][3] | 0,
      'red': '0x' + args['hex'][0] + args['hex'][1] | 0,
    };

    return 'rgb(' + rgb['red'] + ', ' + rgb['green'] + ', ' + rgb['blue'] + ')';
}

function core_html(args){
    args = core_args({
      'args': args,
      'defaults': {
        'parent': false,
        'properties': {},
        'type': 'div',
      },
    });

    let element = document.createElement(args['type']);
    for(let property in args['properties']){
        element[property] = core_handle_defaults({
          'var': args['properties'][property],
        });
    }

    if(typeof args['parent'] === 'string'){
        document.getElementById(args['parent']).appendChild(element);

    }else if(typeof args['parent'] === 'object'){
        args['parent'].appendChild(element);
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
    let element = document.getElementById(args['id']);
    if(!element){
        return;
    }

    Object.assign(
      element,
      args['properties']
    );
}

// Required args: id, src
function core_image(args){
    args = core_args({
      'args': args,
      'defaults': {
        'todo': function(){},
      },
    });

    let image = new Image();
    image.onload = args['todo'];
    image.src = args['src'];
    core_images[args['id']] = image;
    return image;
}

function core_init(){
    // Core menu init.
    let core_ui = core_html({
      'properties': {
        'id': 'core-ui',
      },
    })
    document.body.appendChild(core_ui);
    core_html({
      'parent': 'core-ui',
      'properties': {
        'id': 'core-toggle',
        'onclick': core_escape,
        'type': 'button',
        'value': 'ESC',
      },
      'type': 'input',
    });
    core_html({
      'parent': 'core-ui',
      'properties': {
        'id': 'core-menu',
        'innerHTML': '<a href=../index.htm id=core-menu-root></a>/<a class=external id=core-menu-title rel=noopener></a>'
          + '<div id=core-menu-info></div><hr>'
          + '<span id=core-menu-tabs></span>'
          + '<div id=core-menu-tabcontent></div>'
          + '<input id=settings-reset type=button value="Reset All Settings">'
          + '<input id=settings-save type=button value="Save Settings">',
      },
      'type': 'span',
    });
    core_html({
      'parent': 'core-ui',
      'properties': {
        'id': 'repo-ui',
      },
    });

    // Global storage.
    core_tab_create({
      'content': '<table><tr><td><input id=audio-volume><td>Audio Volume'
        + '<tr><td><input id=color-negative type=color><td>Color Negative'
        + '<tr><td><input id=color-positive type=color><td>Color Positive'
        + '<tr><td><input id=decimals><td>Decimals'
        + '<tr><td><input id=jump><td>Jump'
        + '<tr><td><input id=mouse-sensitivity><td>Mouse Sensitivity'
        + '<tr><td><input id=move-↑><td>Move ↑'
        + '<tr><td><input id=move-←><td>Move ←'
        + '<tr><td><input id=move-↓><td>Move ↓'
        + '<tr><td><input id=move-→><td>Move →</table>',
      'group': 'core-menu',
      'id': 'iterami',
      'label': 'iterami',
    });
    core_storage_add({
      'prefix': 'core-',
      'storage': {
        'audio-volume': 1,
        'color-negative': '#663366',
        'color-positive': '#206620',
        'decimals': 7,
        'jump': 32,
        'mouse-sensitivity': 1,
        'move-←': 65,
        'move-↑': 87,
        'move-→': 68,
        'move-↓': 83,
      },
    });
    core_storage_update();

    // Events + Keyboard/Mouse.
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
    window.onbeforeunload = core_handle_beforeunload;
    window.onblur = core_handle_blur;
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
    window.onwheel = core_handle_mousewheel;
    core_events_bind({
      'elements': {
        'settings-reset': {
          'onclick': core_storage_reset,
        },
        'settings-save': {
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
    core_intervals[args['id']]['var'] = window.requestAnimationFrame(core_intervals[args['id']]['todo']);
}

// Required args: id, todo
function core_interval_modify(args){
    args = core_args({
      'args': args,
      'defaults': {
        'animationFrame': false,
        'clear': 'clearInterval',
        'interval': 25,
        'paused': false,
        'set': 'setInterval',
      },
    });

    if(args['id'] in core_intervals){
        core_interval_pause({
          'id': args['id'],
        });
    }

    core_intervals[args['id']] = {
      'animationFrame': args['animationFrame'],
      'clear': args['clear'],
      'interval': args['interval'],
      'paused': args['paused'],
      'set': args['set'],
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

    window[core_intervals[args['id']]['animationFrame']
      ? 'cancelAnimationFrame'
      : core_intervals[args['id']]['clear']](core_intervals[args['id']]['var']);

    core_intervals[args['id']]['paused'] = true;
}

function core_interval_pause_all(){
    for(let interval in core_intervals){
        if(!core_intervals[interval]['paused']){
            core_interval_pause({
              'id': interval,
            });
        }
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

    delete core_intervals[args['id']];
}

function core_interval_remove_all(){
    for(let interval in core_intervals){
        core_interval_remove({
          'id': interval,
        });
    }
}

// Required args: id
function core_interval_resume(args){
    if(!(args['id'] in core_intervals)){
        return;
    }

    if(!core_intervals[args['id']]['paused']){
        core_interval_pause({
          'id': args['id'],
        });
    }
    core_intervals[args['id']]['paused'] = false;
    if(core_intervals[args['id']]['animationFrame']){
        core_intervals[args['id']]['var'] = window.requestAnimationFrame(core_intervals[args['id']]['todo']);

    }else{
        core_intervals[args['id']]['var'] = window[core_intervals[args['id']]['set']](
          core_intervals[args['id']]['todo'],
          core_intervals[args['id']]['interval']
        );
    }
}

function core_interval_resume_all(){
    for(let interval in core_intervals){
        core_interval_resume({
          'id': interval,
        });
    }
}

function core_keys_rebind(){
    let keybinds = {};
    Object.assign(
      keybinds,
      core_key_rebinds
    );
    keybinds[27] = {// Escape
      'solo': true,
      'todo': core_escape,
    };
    keybinds[core_storage_data['jump']] = {};
    keybinds[core_storage_data['move-←']] = {};
    keybinds[core_storage_data['move-↑']] = {};
    keybinds[core_storage_data['move-→']] = {};
    keybinds[core_storage_data['move-↓']] = {};
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

    for(let keybind in args['keybinds']){
        let key = keybind;

        if(keybind !== 'all'){
            key = Number.parseInt(
              key,
              10
            );

            if(Number.isNaN(key)){
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

    for(let mousebind in args['mousebinds']){
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
        'decimals': core_storage_data['decimals'],
      },
    });

    return new Intl.NumberFormat(
        void 0,
        {
          'maximumFractionDigits': args['decimals'],
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

function core_random_hex(){
    let color = core_random_rgb();

    let blue = '0' + color['blue'].toString(16);
    let green = '0' + color['green'].toString(16);
    let red = '0' + color['red'].toString(16);

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
    let keys = Object.keys(args['object']);

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
    for(let pattern in args['patterns']){
        args['string'] = args['string'].replace(
          new RegExp(
            pattern,
            'g'
          ),
          args['patterns'][pattern]
        );
    }

    return args['string'];
}

// Required args: title
function core_repo_init(args){
    args = core_args({
      'args': args,
      'defaults': {
        'beforeunload': false,
        'events': {},
        'github': 'iterami',
        'globals': {},
        'images': {},
        'info': '',
        'keybinds': false,
        'menu': false,
        'menu-block-events': true,
        'mousebinds': false,
        'storage': {},
        'storage-menu': '',
        'tabs': {},
        'ui': '',
      },
    });

    Object.assign(
      window,
      args['globals']
    );

    if(args['menu']){
        core_escape();
    }

    core_repo_title = args['title'];
    core_storage_add({
      'storage': args['storage'],
    });
    if(args['info'].length > 0){
        document.getElementById('core-menu-info').innerHTML = '<hr>' + args['info'];
    }
    if(args['storage-menu'].length > 0){
        core_tab_create({
          'content': args['storage-menu'],
          'group': 'core-menu',
          'id': 'repo',
          'label': core_repo_title,
        });
    }
    document.getElementById('core-menu-root').innerHTML = args['github'];
    let repo_title = document.getElementById('core-menu-title');
    repo_title.href = 'https://github.com/' + args['github'] + '/' + core_repo_title;
    repo_title.innerHTML = core_repo_title;
    document.getElementById('repo-ui').innerHTML = args['ui'];

    let have_default = false;
    for(let tab in args['tabs']){
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
    core_events_bind({
      'beforeunload': args['beforeunload'],
      'elements': args['events'],
      'keybinds': args['keybinds'],
      'mousebinds': args['mousebinds'],
    });

    for(let image in args['images']){
        core_image({
          'id': image,
          'src': args['images'][image],
        });
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

    let element = document.getElementById(args['id']);
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

    let eIndex = String(args['number']).indexOf('e');
    let eString = '';
    if(eIndex >= 0){
        eString = String(args['number']).slice(eIndex);
        args['number'] = String(args['number']).slice(
          0,
          eIndex
        );

        let power = Number(eString.slice(2));
        if(power === args['decimals']){
            eString = 'e-' + (power + 1);
        }
    }

    let result = Number(
      Math.round(args['number'] + 'e+' + args['decimals'])
        + 'e-' + args['decimals']
    );

    if(eString.length > 0){
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

    args['array'].sort(args['todo']);
    if(args['reverse']){
        args['array'].reverse();
    }

    return args['array'];
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

// Required args: array
function core_sort_random(args){
    return core_sort_custom({
      'array': args['array'],
      'todo': function(a, b){
          return Math.random() - .5;
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
function core_sort_strings(args){
    return core_sort_custom({
      'array': args['array'],
      'reverse': args['reverse'],
      'todo': function(a, b){
          return a.localeCompare(b);
      },
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

    for(let key in args['storage']){
        core_storage_info[key] = {
          'default': args['storage'][key],
          'prefix': args['prefix'],
        };
        core_storage_data[key] = window.localStorage.getItem(args['prefix'] + key);

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

function core_storage_reset(){
    if(!window.confirm('Reset all settings?')){
        return false;
    }

    for(let key in core_storage_data){
        core_storage_data[key] = core_storage_info[key]['default'];
        window.localStorage.removeItem(core_storage_info[key]['prefix'] + key);
    }

    core_storage_update();
    return true;
}

function core_storage_save(){
    for(let key in core_storage_data){
        let element = document.getElementById(key);
        core_storage_data[key] = element[core_storage_element_property({
          'element': element,
          'key': key,
        })];

        let data = core_type_convert({
          'template': core_storage_info[key]['default'],
          'value': core_storage_data[key],
        });
        core_storage_data[key] = data;

        if(data !== void 0
          && data !== NaN
          && String(data).length > 0
          && data !== core_storage_info[key]['default']){
            window.localStorage.setItem(
              core_storage_info[key]['prefix'] + key,
              data
            );

        }else{
            window.localStorage.removeItem(core_storage_info[key]['prefix'] + key);
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

    let keys = [];

    if(args['keys'] === false){
        for(let key in core_storage_data){
            keys.push(key);
        }

    }else{
        keys = args['keys'];
    }

    for(let key in keys){
        let element = document.getElementById(keys[key]);
        element[core_storage_element_property({
          'element': element,
          'key': keys[key],
        })] = core_storage_data[keys[key]];
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
function core_tab_switch(args){
    let info = args['id'].split('_');

    let element = document.getElementById('tabcontent-' + info[2]);
    if(!element){
        return;
    }

    for(let tab in core_tabs){
        if(core_tabs[tab]['group'] === info[1]
          && tab !== info[2]){
            document.getElementById('tabcontent-' + tab).style.display = 'none';
        }
    }

    element.style.display = element.style.display === 'block'
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
          || typeof window[args['var']] === 'function';

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
        'ids': {},
      },
    });

    for(let id in args['ids']){
        if(core_ui_values[id] === args['ids'][id]){
            continue;
        }

        core_ui_values[id] = args['ids'][id];

        let element = document.getElementById(id);
        element[element.tagName !== 'INPUT'
          ? 'innerHTML'
          : 'value'] = args['ids'][id];

        let elements = document.getElementsByClassName(id);
        for(let i = 0; i < elements.length; i++){
             let item = elements.item(i);
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
        'id': 'buffer',
        'quality': 1,
        'type': 'image/png',
      },
    });

    return document.getElementById(args['id']).toDataURL(
      args['type'],
      args['quality']
    );
}

window.core_events = {};
window.core_gamepads = {};
window.core_images = {};
window.core_intervals = {};
window.core_key_rebinds = {};
window.core_keys = {};
window.core_menu_block_events = true;
window.core_menu_open = false;
window.core_mode = 0;
window.core_mouse = {};
window.core_repo_title = '';
window.core_storage_data = {};
window.core_storage_info = {};
window.core_tabs = {};
window.core_ui_values = {};

window.onload = core_init;
