'use strict';

// Required args: todo, url
// Optional args: data, type
function core_ajax(args){
    args = core_args({
      'args': args,
      'defaults': {
        'data': core_ajax_properties['data'],
        'type': core_ajax_properties['type'],
      },
    });

    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function(){
        if(this.readyState === core_ajax_properties['readyState']
          && this.status === core_ajax_properties['status']){
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

    for(var arg in args['defaults']){
        if(args['args'][arg] === void 0){
            args['args'][arg] = args['defaults'][arg];
        }
    }

    return args['args'];
}

// Required args: audios
function core_audio_create(args){
    for(var audio in args['audios']){
        core_audio[audio] = {
          'playing': false,
        };

        for(var property in args['audios'][audio]){
            core_audio[audio][property] = core_handle_defaults({
              'default': core_audio[audio],
              'var': args['audios'][audio][property],
            });
        }

        core_audio[audio]['connections'] = args['audios'][audio]['connections'] || [
          {
            'frequency': {
              'value': core_audio[audio]['frequency'] || 100,
            },
            'label': 'Oscillator',
            'type': core_audio[audio]['type'] || 'sine',
          },
          {
            'gain': {
              'value': args['audios'][audio]['volume'] || core_storage_data['audio-volume'],
            },
            'label': 'Gain',
          },
        ];

        core_audio[audio]['connections'][0]['id'] = audio;
        core_audio[audio]['connections'][0]['onended'] = function(){
            core_audio_onended({
              'id': this.id,
            });
        };
    }
}

// Optional args: id, properties
function core_audio_node_create(args){
    args = core_args({
      'args': args,
      'defaults': {
        'id': false,
        'properties': {
          'label': 'Oscillator',
        },
      },
    });

    var source = core_audio_context['create' + args['properties']['label']](
      args['properties']['arg0'],
      args['properties']['arg1'],
      args['properties']['arg2']
    );

    for(var property in args['properties']){
        if(core_type({
          'type': 'object',
          'var': args['properties'][property],
        })){
            for(var subproperty in args['properties'][property]){
                source[property][subproperty] = args['properties'][property][subproperty];
            }

        }else{
            source[property] = args['properties'][property];
        }
    }

    if(args['id'] === false){
        return source;
    }

    core_audio_sources[args['id']][args['properties']['label']] = source;
}

// Required args: id
function core_audio_onended(args){
    core_audio[args['id']]['playing'] = false;

    if(core_audio[args['id']]['repeat']){
        if(core_audio[args['id']]['timeout'] <= 0){
            core_audio_start({
              'id': args['id'],
            });

        }else{
            window.setTimeout(
              'core_audio_start({id:"' + args['id'] + '"});',
              core_audio[args['id']]['duration'] * core_audio[args['id']]['timeout']
            );
        }
    }

    delete core_audio_sources[args['id']];
}

// Required args: id
// Optional args: volume-multiplier
function core_audio_source_create(args){
    args = core_args({
      'args': args,
      'defaults': {
        'volume-multiplier': core_audio_volume_multiplier,
      },
    });

    core_audio_sources[args['id']] = {
      'duration': core_audio[args['id']]['duration'] || 0,
      'start': core_audio[args['id']]['start'] || 0,
      'timeout': core_audio[args['id']]['timeout'] || 1000,
    };

    // Create audio nodes.
    var connections_length = core_audio[args['id']]['connections'].length;
    for(var i = 0; i < connections_length; i++){
        core_audio_node_create({
          'id': args['id'],
          'properties': core_audio[args['id']]['connections'][i],
        });

        if(core_audio[args['id']]['connections'][i]['label'] === 'Gain'){
            core_audio_sources[args['id']]['Gain']['gain']['value'] = (core_audio[args['id']]['volume'] || core_storage_data['audio-volume'])
              * args['volume-multiplier'];
        }
    }

    // Connect audio nodes.
    for(var i = 0; i < connections_length - 1; i++){
        core_audio_sources[args['id']][core_audio[args['id']]['connections'][i]['label']].connect(
          core_audio_sources[args['id']][core_audio[args['id']]['connections'][i + 1]['label']]
        );
    }
    core_audio_sources[args['id']][core_audio[args['id']]['connections'][connections_length - 1]['label']].connect(
      core_audio_context.destination
    );
}

// Required args: id
// Optional args: volume-multiplier
function core_audio_start(args){
    args = core_args({
      'args': args,
      'defaults': {
        'volume-multiplier': core_audio_volume_multiplier,
      },
    });

    if(args['volume-multiplier'] === 0){
        return;
    }

    if(core_audio[args['id']]['playing']){
        core_audio_stop({
          'id': args['id'],
        });
    }

    core_audio_source_create({
      'id': args['id'],
      'volume-multiplier': args['volume-multiplier'],
    });

    var startTime = core_audio_context.currentTime + core_audio_sources[args['id']]['start'];
    core_audio[args['id']]['playing'] = true;
    core_audio_sources[args['id']][core_audio[args['id']]['connections'][0]['label']].start(startTime);
    core_audio_stop({
      'id': args['id'],
      'when': startTime + core_audio_sources[args['id']]['duration'],
    });
}

// Required args: id
// Optional args: when
function core_audio_stop(args){
    args = core_args({
      'args': args,
      'defaults': {
        'when': void 0,
      },
    });

    core_audio_sources[args['id']][core_audio[args['id']]['connections'][0]['label']].stop(args['when']);
}

// Optional args: when
function core_audio_stop_all(args){
    args = core_args({
      'args': args,
      'defaults': {
        'when': void 0,
      },
    });

    for(var id in core_audio_sources){
        core_audio_stop({
          'id': id,
          'when': args['when'],
        });
    }
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

// Optional args: id, properties, types
function core_entity_create(args){
    args = core_args({
      'args': args,
      'defaults': {
        'id': core_uid(),
        'properties': {},
        'types': [],
      },
    });

    var entity = {};

    for(var type in core_entity_types_default){
        core_entity_handle_defaults({
          'entity': entity,
          'id': args['id'],
          'type': core_entity_types_default[type],
        });
    }

    for(var type in args['types']){
        core_entity_handle_defaults({
          'entity': entity,
          'id': args['id'],
          'type': args['types'][type],
        });
    }

    for(var property in args['properties']){
        entity[property] = core_handle_defaults({
          'default': entity[property],
          'var': args['properties'][property],
        });
    }

    core_entities[args['id']] = entity;

    for(var type in core_entity_types_default){
        core_entity_info[core_entity_types_default[type]]['todo'](args['id']);
    }
    for(var type in args['types']){
        core_entity_info[args['types'][type]]['todo'](args['id']);
    }
}

// Required args: id, type
function core_entity_handle_defaults(args){
    for(var property in core_entity_info[args['type']]['default']){
        args['entity'][property] = core_handle_defaults({
          'default': args['entity'][property],
          'var': core_entity_info[args['type']]['default'][property],
        });
    }

    if(core_groups[args['type']][args['id']] === void 0){
        core_entity_info[args['type']]['count']++;
    }

    core_groups[args['type']][args['id']] = true;

    for(var group in core_entity_info[args['type']]['groups']){
        core_group_add({
          'entities': [
            args['id'],
          ],
          'group': core_entity_info[args['type']]['groups'][group],
        });
    }
}

// Reqruied args: entities
// Optional args: delete-empty
function core_entity_remove(args){
    args = core_args({
      'args': args,
      'defaults': {
        'delete-empty': false,
      },
    });

    core_group_remove_all({
      'delete-empty': args['delete-empty'],
      'entities': args['entities'],
    });

    for(var entity in args['entities']){
        delete core_entities[args['entities'][entity]];
        delete core_uids[args['entities'][entity]];
    }
}

// Optional args: delete-empty, group
function core_entity_remove_all(args){
    args = core_args({
      'args': args,
      'defaults': {
        'delete-empty': false,
        'group': false,
      },
    });

    for(var entity in core_entities){
        if(entity[0] === '_'
          || (args['group'] !== false
            && !core_groups[args['group']][entity]
          )){
            continue;
        }

        core_entity_remove({
          'delete-empty': args['delete-empty'],
          'entities': [
            entity,
          ],
        });
    }
}

// Required args: type
// Optional args: default, groups, properties, todo
function core_entity_set(args){
    args = core_args({
      'args': args,
      'defaults': {
        'default': false,
        'groups': [],
        'properties': {},
        'todo': function(){},
      },
    });

    core_entity_info[args['type']] = {
      'count': 0,
      'default': args['properties'],
      'groups': args['groups'],
      'todo': args['todo'],
    };

    if(args['default']){
        core_entity_types_default.push(args['type']);
    }

    core_groups[args['type']] = {};
}

function core_escape(){
    core_menu_open = !core_menu_open;

    document.getElementById('core-menu').style.display = core_menu_open
      ? 'inline'
      : 'none';
    document.getElementById('repo-ui').style.display = core_menu_open
      ? 'none'
      : 'block';

    if(!core_menu_open){
        core_storage_save();
        core_interval_resume_all();

    }else{
        core_interval_pause_all();
    }

    core_call({
      'todo': 'repo_escape',
    });
}

// Optional args: beforeunload, clearkeys, clearmouse, elements, keybinds, mousebinds
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
        for(var element in args['elements']){
            var domelement = document.getElementById(element);
            for(var event in args['elements'][element]){
                domelement[event] = args['elements'][element][event];
            }
        }
    }
}

function core_events_keyinfo(event){
    var code = event.keyCode || event.which;
    return {
      'code': code,
      'key': String.fromCharCode(code),
    };
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

// Required args: entities, group
function core_group_add(args){
    if(!(args['group'] in core_groups)){
        core_groups[args['group']] = {};
    }

    for(var entity in args['entities']){
        core_groups[args['group']][args['entities'][entity]] = true;
    }
}

// Required args: groups, todo
// Optional args: pretodo
function core_group_modify(args){
    args = core_args({
      'args': args,
      'defaults': {
        'pretodo': false,
      },
    });

    var pretodo = {};
    if(args['pretodo'] !== false){
        pretodo = args['pretodo']();
    }
    for(var group in args['groups']){
        for(var entity in core_groups[args['groups'][group]]){
            args['todo'](
              entity,
              pretodo
            );
        }
    }
}

// Required args: entities, from, to
function core_group_move(args){
    core_group_remove({
      'entities': args['entities'],
      'group': args['from'],
    });
    core_group_add({
      'entities': args['entities'],
      'group': args['to'],
    });
}

// Required args: entities, group
// Optional args: delete-empty
function core_group_remove(args){
    args = core_args({
      'args': args,
      'defaults': {
        'delete-empty': false,
      },
    });

    if(core_groups[args['group']] !== void 0){
        for(var entity in args['entities']){
            if(core_entity_info[args['group']]
              && core_groups[args['group']][args['entities'][entity]] !== void 0){
                core_entity_info[args['group']]['count']--;
            }
            delete core_groups[args['group']][args['entities'][entity]];
        }
    }

    if(args['delete-empty']
      && core_groups[args['group']].length === 0){
        delete core_groups[args['group']];
    }
}

// Required args: entities
// Optional args: delete-empty
function core_group_remove_all(args){
    args = core_args({
      'args': args,
      'defaults': {
        'delete-empty': false,
      },
    });

    for(var group in core_groups){
        core_group_remove({
          'delete-empty': args['delete-empty'],
          'entities': args['entities'],
          'group': group,
        });
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
// Optional args: block, state, todo
function core_handle_event(args){
    args = core_args({
      'args': args,
      'defaults': {
        'state': void 0,
        'todo': void 0,
      },
    });

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

    if(core_menu_open
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
    if(core_menu_open
      || event['target'].id === 'core-toggle'){
        return;
    }

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
    if(core_menu_open){
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
    if(!core_mouse['down']){
        return;
    }

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
    if(core_menu_open){
        return;
    }

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

    core_mouse['pointerlock-state'] = element === core_vendor_prefix({
      'property': 'pointerLockElement',
      'var': document,
    });

    if(!core_mouse['pointerlock-state']){
        core_escape();
    }
};

// Required args: hex
function core_hex_to_rgb(args){
    if(args['hex'][0] === '#'){
        args['hex'] = args['hex'].slice(1);
    }

    var rgb = {
      'blue': '0x' + args['hex'][4] + args['hex'][5] | 0,
      'green': '0x' + args['hex'][2] + args['hex'][3] | 0,
      'red': '0x' + args['hex'][0] + args['hex'][1] | 0,
    };

    return 'rgb(' + rgb['red'] + ', ' + rgb['green'] + ', ' + rgb['blue'] + ')';
}

// Optional args: parent, properties, type
function core_html(args){
    args = core_args({
      'args': args,
      'defaults': {
        'parent': false,
        'properties': {},
        'type': 'div',
      },
    });

    var element = document.createElement(args['type']);
    for(var property in args['properties']){
        element[property] = core_handle_defaults({
          'var': args['properties'][property],
        });
    }

    if(args['parent'] !== false){
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

// Required args: id
// Optional args: properties
function core_html_modify(args){
    args = core_args({
      'args': args,
      'defaults': {
        'properties': {},
      },
    });

    var element = document.getElementById(args['id']);
    if(!element){
        return;
    }

    Object.assign(
      element,
      args['properties']
    );
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

function core_init(){
    // Core menu init.
    var core_ui = core_html({
      'properties': {
        'id': 'core-ui',
      },
    })
    core_html({
      'parent': core_ui,
      'properties': {
        'id': 'core-toggle',
        'onclick': core_escape,
        'type': 'button',
        'value': 'ESC',
      },
      'type': 'input',
    });
    core_html({
      'parent': core_ui,
      'properties': {
        'id': 'core-menu',
        'innerHTML': '<a href=/ id=core-menu-root></a>/<a class=external id=core-menu-title></a><div id=core-menu-info></div><hr>Settings:<span id=core-menu-tabs></span><div id=core-menu-tabcontent></div><input id=settings-reset type=button value="Reset Settings">',
      },
      'type': 'span',
    });
    core_html({
      'parent': core_ui,
      'properties': {
        'id': 'repo-ui',
      },
    });
    document.body.appendChild(core_ui);

    core_tab_create({
      'content': '<table><tr><td><input id=audio-volume max=1 min=0 step=0.01 type=range><td>Audio Volume<tr><td><input id=color-negative type=color><td>Color Negative<tr><td><input id=color-positive type=color><td>Color Positive<tr><td><input id=decimals><td>Decimals<tr><td><input id=jump><td>Jump<tr><td><input id=mouse-sensitivity><td>Mouse Sensitivity<tr><td><input id=move-↑><td>Move ↑<tr><td><input id=move-←><td>Move ←<tr><td><input id=move-↓><td>Move ↓<tr><td><input id=move-→><td>Move →</table>',
      'default': true,
      'group': 'core-menu',
      'id': 'global',
      'label': 'Global',
    });

    // Keyboard/mouse init.
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

    document.addEventListener(
      'onmousewheel' in window
        ? 'mousewheel'
        : 'DOMMouseScroll',
      core_handle_mousewheel,
      {
        'passive': true,
      }
    );
    document.onmozpointerlockchange = core_handle_pointerlockchange;
    document.onpointerlockchange = core_handle_pointerlockchange;
    document.onwebkitpointerlockchange = core_handle_pointerlockchange;
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

    core_audio_context = new window.AudioContext();

    // Global storage.
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

    // Global event binds.
    core_keys_rebind();
    core_events_bind({
      'beforeunload': {
        'todo': core_storage_save,
      },
      'elements': {
        'settings-reset': {
          'onclick': core_storage_reset,
        },
      },
    });

    core_call({
      'todo': 'repo_init',
    });
}

// Required args: id
function core_interval_animationFrame(args){
    core_intervals[args['id']]['var'] = window.requestAnimationFrame(core_intervals[args['id']]['todo']);
}

// Required args: todo
// Optional args: animationFrame, clear, id, interval, paused, set
function core_interval_modify(args){
    args = core_args({
      'args': args,
      'defaults': {
        'animationFrame': false,
        'clear': 'clearInterval',
        'id': core_uid(),
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
    for(var interval in core_intervals){
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
    for(var interval in core_intervals){
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
    for(var interval in core_intervals){
        core_interval_resume({
          'id': interval,
        });
    }
}

function core_keys_rebind(){
    var keybinds = {};
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
            key = parseInt(
              key,
              10
            );

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
        core_mouse['todo'][mousebind] = {
          'loop': args['mousebinds'][mousebind]['loop'] || false,
          'preventDefault': args['mousebinds'][mousebind]['preventDefault'] || false,
          'todo': args['mousebinds'][mousebind]['todo'] || function(){},
        };
    }
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

    return Math[args['todo']](core_random_number({
      'multiplier': args['max'],
    }));
}

// Required args: object
function core_random_key(args){
    var keys = Object.keys(args['object']);

    return keys[core_random_integer({
      'max': keys.length - 1,
    })];
}

// Optional args: multiplier
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

// Required args: patterns, string
function core_replace_multiple(args){
    for(var pattern in args['patterns']){
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
// Optional args: audios, beforeunload, entities, github, globals, images, info, keybinds, menu, mousebinds, storage, storage-menu, ui
function core_repo_init(args){
    args = core_args({
      'args': args,
      'defaults': {
        'audios': {},
        'beforeunload': false,
        'entities': {},
        'events': {},
        'github': 'iterami',
        'globals': {},
        'images': {},
        'info': '',
        'keybinds': false,
        'menu': false,
        'mousebinds': false,
        'storage': {},
        'storage-menu': '',
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

    for(var entity in args['entities']){
        core_entity_set({
          'default': args['entities'][entity]['default'],
          'properties': args['entities'][entity]['properties'],
          'todo': args['entities'][entity]['todo'],
          'type': entity,
        });
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
        core_tab_switch({
          'id': 'tab_core-menu_repo',
        });
    }
    document.getElementById('core-menu-root').innerHTML = args['github'];
    var repo_title = document.getElementById('core-menu-title');
    repo_title.href = 'https://github.com/' + args['github'] + '/' + core_repo_title;
    repo_title.innerHTML = core_repo_title;

    core_storage_update();

    if(args['keybinds'] !== false){
        core_key_rebinds = args['keybinds'];
    }
    core_events_bind({
      'beforeunload': args['beforeunload'],
      'elements': args['events'],
      'keybinds': args['keybinds'],
      'mousebinds': args['mousebinds'],
    });

    core_audio_create({
      'audios': args['audios'],
    });

    for(var image in args['images']){
        core_image({
          'id': image,
          'src': args['images'][image],
        });
    }

    document.getElementById('repo-ui').innerHTML = args['ui'];
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

    element.requestPointerLock = core_vendor_prefix({
      'property': 'requestPointerLock',
      'var': element,
    });
    element.requestPointerLock();

    core_mouse['pointerlock-id'] = args['id'];
}

// Required args: array, todo
// Optional args: reverse
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
}

// Required args: array
// Optional args: reverse
function core_sort_numbers(args){
    core_sort_custom({
      'array': args['array'],
      'reverse': args['reverse'],
      'todo': function(a, b){
          return a - b;
      },
    });
}

// Required args: array
function core_sort_random(args){
    core_sort_custom({
      'array': args['array'],
      'todo': function(a, b){
          return Math.random() - 0.5;
      },
    });
}

// Required args: array, property
// Optional args: reverse
function core_sort_property(args){
    core_sort_custom({
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

// Required args, array
// Optional args: reverse
function core_sort_strings(args){
    core_sort_custom({
      'array': args['array'],
      'reverse': args['reverse'],
      'todo': function(a, b){
          return a.localeCompare(b);
      },
    });
}

// Required args: storage
// Optional args: prefix
function core_storage_add(args){
    args = core_args({
      'args': args,
      'defaults': {
        'prefix': core_repo_title + '-',
      },
    });

    for(var key in args['storage']){
        core_storage_info[key] = {
          'default': args['storage'][key],
          'prefix': args['prefix'],
        };
        core_storage_data[key] = window.localStorage.getItem(args['prefix'] + key);

        if(core_storage_data[key] === null){
            core_storage_data[key] = core_storage_info[key]['default'];
        }

        core_storage_data[key] = core_storage_type_convert({
          'key': key,
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
    if(!window.confirm('Reset ' + core_repo_title + ' settings?')){
        return false;
    }

    for(var key in core_storage_data){
        core_storage_data[key] = core_storage_info[key]['default'];
        window.localStorage.removeItem(core_storage_info[key]['prefix'] + key);
    }

    core_storage_update();
    return true;
}

function core_storage_save(){
    for(var key in core_storage_data){
        var element = document.getElementById(key);
        core_storage_data[key] = element[core_storage_element_property({
          'element': element,
          'key': key,
        })];

        var data = core_storage_type_convert({
          'key': key,
          'value': core_storage_data[key],
        });
        core_storage_data[key] = data;

        if(data !== core_storage_info[key]['default']){
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
        var element = document.getElementById(key);
        element[core_storage_element_property({
          'element': element,
          'key': key,
        })] = core_storage_data[key];
    }
}

// Required args: group, id
// Optional args: content, default, label
function core_tab_create(args){
    args = core_args({
      'args': args,
      'defaults': {
        'content': '',
        'default': false,
        'label': '',
      },
    });

    core_tabs[args['id']] = {
      'content': args['content'],
      'group': args['group'],
    };

    core_html({
      'parent': document.getElementById(args['group'] + '-tabs'),
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
      'parent': document.getElementById(args['group'] + '-tabcontent'),
      'properties': {
        'id': 'tabcontent-' + args['id'],
        'innerHTML': args['content'],
        'style': args['default']
          ? ''
          : 'display:none',
      },
    });
}

// Required args: id
function core_tab_switch(args){
    var info = args['id'].split('_');

    for(var tab in core_tabs){
        if(core_tabs[tab]['group'] === info[1]){
            document.getElementById('tabcontent-' + tab).style.display = 'none';
        }
    }

    document.getElementById('tabcontent-' + info[2]).style.display = 'block';
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
        uid += core_random_integer({
          'max': 1e17,
        }).toString(34);
    }

    return uid;
}

// Optional args: ids
function core_ui_update(args){
    args = core_args({
      'args': args,
      'defaults': {
        'ids': {},
      },
    });

    for(var id in args['ids']){
        if(core_ui_values[id] === args['ids'][id]){
            continue;
        }

        var element = document.getElementById('ui-' + id);
        element[element.tagName !== 'INPUT'
          ? 'innerHTML'
          : 'value'] = args['ids'][id];

        core_ui_values[id] = args['ids'][id];
    }
}

// Required args: property, var
function core_vendor_prefix(args){
    var unprefixed = args['property'].charAt(0).toUpperCase() + args['property'].slice(1);

    return args['var'][args['property']]
      || args['var']['webkit' + unprefixed]
      || args['var']['moz' + unprefixed]
      || args['var']['ms' + unprefixed]
      || args['var']['o' + unprefixed];
}

var core_ajax_properties = {
  'data': null,
  'readyState': 4,
  'status': 200,
  'type': 'GET',
};
var core_audio = {};
var core_audio_context = 0;
var core_audio_sources = {};
var core_audio_volume_multiplier = 1;
var core_entities = {};
var core_entity_info = {};
var core_entity_types_default = [];
var core_events = {};
var core_gamepads = {};
var core_groups = {};
var core_images = {};
var core_intervals = {};
var core_key_rebinds = {};
var core_keys = {};
var core_menu_open = false;
var core_menu_quit = 'Q = Main Menu';
var core_menu_resume = 'ESC = Resume';
var core_mode = 0;
var core_mouse = {};
var core_random_boolean_chance = .5;
var core_random_integer_max = 100;
var core_random_string_characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
var core_random_string_length = 100;
var core_repo_title = '';
var core_storage_data = {};
var core_storage_info = {};
var core_tabs = {};
var core_ui_values = {};
var core_uids = {};

window.onload = core_init;
