'use strict';

// Required args: todo, url
function core_ajax(args){
    args = core_args({
      'args': args,
      'defaults': {
        'data': core_ajax_properties['data'],
        'type': core_ajax_properties['type'],
      },
    });

    let ajax = new XMLHttpRequest();
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

    for(let arg in args['defaults']){
        if(args['args'][arg] === void 0){
            args['args'][arg] = args['defaults'][arg];
        }
    }

    return args['args'];
}

// Required args: audios
function core_audio_create(args){
    for(let audio in args['audios']){
        core_audio[audio] = {
          'playing': false,
        };

        for(let property in args['audios'][audio]){
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

    if(core_audio_context === 0){
        core_audio_context = new window.AudioContext();
    }

    let source = core_audio_context['create' + args['properties']['label']](
      args['properties']['arg0'],
      args['properties']['arg1'],
      args['properties']['arg2']
    );

    for(let property in args['properties']){
        if(core_type({
            'type': 'object',
            'var': args['properties'][property],
          })){
            for(let subproperty in args['properties'][property]){
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
function core_audio_source_create(args){
    if(core_audio_context === 0){
        core_audio_context = new window.AudioContext();
    }

    core_audio_sources[args['id']] = {
      'duration': core_audio[args['id']]['duration'] || 0,
      'start': core_audio[args['id']]['start'] || 0,
      'timeout': core_audio[args['id']]['timeout'] || 1000,
    };

    // Create audio nodes.
    let connections_length = core_audio[args['id']]['connections'].length;
    for(let i = 0; i < connections_length; i++){
        core_audio_node_create({
          'id': args['id'],
          'properties': core_audio[args['id']]['connections'][i],
        });

        if(core_audio[args['id']]['connections'][i]['label'] === 'Gain'){
            core_audio_sources[args['id']]['Gain']['gain']['value'] = core_audio[args['id']]['volume'] || core_storage_data['audio-volume'];
        }
    }

    // Connect audio nodes.
    for(let i = 0; i < connections_length - 1; i++){
        core_audio_sources[args['id']][core_audio[args['id']]['connections'][i]['label']].connect(
          core_audio_sources[args['id']][core_audio[args['id']]['connections'][i + 1]['label']]
        );
    }
    core_audio_sources[args['id']][core_audio[args['id']]['connections'][connections_length - 1]['label']].connect(
      core_audio_context.destination
    );
}

// Required args: id
function core_audio_start(args){
    if(core_audio[args['id']]['playing']){
        core_audio_stop({
          'id': args['id'],
        });
    }

    core_audio_source_create({
      'id': args['id'],
    });

    let startTime = core_audio_context.currentTime + core_audio_sources[args['id']]['start'];
    core_audio[args['id']]['playing'] = true;
    core_audio_sources[args['id']][core_audio[args['id']]['connections'][0]['label']].start(startTime);
    core_audio_stop({
      'id': args['id'],
      'when': startTime + core_audio_sources[args['id']]['duration'],
    });
}

// Required args: id
function core_audio_stop(args){
    args = core_args({
      'args': args,
      'defaults': {
        'when': void 0,
      },
    });

    core_audio_sources[args['id']][core_audio[args['id']]['connections'][0]['label']].stop(args['when']);
}

function core_audio_stop_all(args){
    args = core_args({
      'args': args,
      'defaults': {
        'when': void 0,
      },
    });

    for(let id in core_audio_sources){
        core_audio_stop({
          'id': id,
          'when': args['when'],
        });
    }
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

// Required args: max, min, value
function core_clamp(args){
    args = core_args({
      'args': args,
      'defaults': {
        'decimals': core_storage_data['decimals'],
        'wrap': false,
      },
    });

    if(args['wrap']){
        let diff = args['max'] - args['min'];
        while(args['value'] < args['min']){
            args['value'] += diff;
        }
        while(args['value'] >= args['max']){
            args['value'] -= diff;
        }

    }else{
        args['value'] = Math.max(
          args['value'],
          args['min']
        );
        args['value'] = Math.min(
          args['value'],
          args['max']
        );
    }

    return args['value'];
}

function core_date_to_timestamp(args){
    args = core_args({
      'args': args,
      'defaults': {
        'date': false,
      },
    });

    if(args['date'] === false){
        args['date'] = core_timestamp_to_date();
    }

    return new Date(
      Date.UTC(
        args['date']['year'],
        args['date']['month'] - 1,
        args['date']['date'],
        args['date']['hour'],
        args['date']['minute'],
        args['date']['second'],
        args['date']['millisecond']
      )
    ).getTime();
}

// Required args: degrees
function core_degrees_to_radians(args){
    args = core_args({
      'args': args,
      'defaults': {
        'decimals': core_storage_data['decimals'],
      },
    });

    return core_round({
      'decimals': args['decimals'],
      'number': args['degrees'] * core_degree,
    });
}

function core_distance(args){
    args = core_args({
      'args': args,
      'defaults': {
        'decimals': core_storage_data['decimals'],
        'x0': 0,
        'x1': 0,
        'y0': 0,
        'y1': 0,
        'z0': 0,
        'z1': 0,
      },
    });

    return core_round({
      'decimals': args['decimals'],
      'number': Math.sqrt(
        Math.pow(
          args['x0'] - args['x1'],
          2
        ) + Math.pow(
          args['y0'] - args['y1'],
          2
        ) + Math.pow(
          args['z0'] - args['z1'],
          2
        )
      ),
    });
}

function core_entity_create(args){
    args = core_args({
      'args': args,
      'defaults': {
        'id': core_id_count,
        'properties': {},
        'types': [],
      },
    });

    core_id_count++;

    let entity = {};

    for(let type in core_entity_types_default){
        core_entity_handle_defaults({
          'entity': entity,
          'id': args['id'],
          'type': core_entity_types_default[type],
        });
    }

    for(let type in args['types']){
        core_entity_handle_defaults({
          'entity': entity,
          'id': args['id'],
          'type': args['types'][type],
        });
    }

    for(let property in args['properties']){
        entity[property] = core_handle_defaults({
          'default': entity[property],
          'var': args['properties'][property],
        });
    }

    core_entities[args['id']] = entity;

    for(let type in core_entity_types_default){
        core_entity_info[core_entity_types_default[type]]['todo'](args['id']);
    }
    for(let type in args['types']){
        core_entity_info[args['types'][type]]['todo'](args['id']);
    }

    return args['id'];
}

// Required args: id, type
function core_entity_handle_defaults(args){
    for(let property in core_entity_info[args['type']]['default']){
        args['entity'][property] = core_handle_defaults({
          'default': args['entity'][property],
          'var': core_entity_info[args['type']]['default'][property],
        });
    }

    if(core_groups[args['type']][args['id']] === void 0){
        core_group_add({
          'entities': [
            args['id'],
          ],
          'group': args['type'],
        });

        core_entity_info[args['type']]['count']++;
    }

    for(let group in core_entity_info[args['type']]['groups']){
        core_group_add({
          'entities': [
            args['id'],
          ],
          'group': core_entity_info[args['type']]['groups'][group],
        });
    }
}

// Reqruied args: entities
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

    for(let entity in args['entities']){
        delete core_entities[args['entities'][entity]];
    }
}

function core_entity_remove_all(args){
    args = core_args({
      'args': args,
      'defaults': {
        'delete-empty': false,
        'group': false,
      },
    });

    for(let entity in core_entities){
        if(args['group'] !== false
          && !core_groups[args['group']][entity]){
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

    core_group_create({
      'ids': [
        args['type'],
      ],
    });
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

function core_fixed_length_line(args){
    args = core_args({
      'args': args,
      'defaults': {
        'decimals': core_storage_data['decimals'],
        'length': 1,
        'x0': 0,
        'x1': 0,
        'y0': 0,
        'y1': 0,
        'z0': 0,
        'z1': 0,
      },
    });

    let line_distance = core_distance({
      'x0': args['x0'],
      'x1': args['x1'],
      'y0': args['y0'],
      'y1': args['y1'],
      'z0': args['z0'],
      'z1': args['z1'],
    });

    args['x1'] /= line_distance;
    args['x1'] *= args['length'];
    args['y1'] /= line_distance;
    args['y1'] *= args['length'];
    args['z1'] /= line_distance;
    args['z1'] *= args['length'];

    return {
      'x': core_round({
        'decimals': args['decimals'],
        'number': args['x1'],
      }),
      'y': core_round({
        'decimals': args['decimals'],
        'number': args['y1'],
      }),
      'z': core_round({
        'decimals': args['decimals'],
        'number': args['z1'],
      }),
    };
}

// Required args: entities, group
function core_group_add(args){
    if(!(args['group'] in core_groups)){
        core_group_create({
          'id': args['group'],
        });
    }

    for(let entity in args['entities']){
        core_groups[args['group']][args['entities'][entity]] = true;

        core_groups['_length'][args['group']]++;
    }
}

// Required args: ids
function core_group_create(args){
    for(let id in args['ids']){
        core_groups[args['ids'][id]] = {};
        core_groups['_length'][args['ids'][id]] = 0;
    }
}

// Required args: groups, todo
function core_group_modify(args){
    args = core_args({
      'args': args,
      'defaults': {
        'pretodo': false,
      },
    });

    let pretodo = {};
    if(args['pretodo'] !== false){
        pretodo = args['pretodo']();
    }
    for(let group in args['groups']){
        for(let entity in core_groups[args['groups'][group]]){
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
function core_group_remove(args){
    args = core_args({
      'args': args,
      'defaults': {
        'delete-empty': false,
      },
    });

    if(core_groups[args['group']] === void 0){
        return;
    }

    for(let entity in args['entities']){
        delete core_groups[args['group']][args['entities'][entity]];

        core_groups['_length'][args['group']]--;
    }

    if(args['delete-empty']
      && core_groups['_length'][args['group']] === 0){
        delete core_groups[args['group']];
        delete core_groups['_length'][args['group']];
    }
}

// Required args: entities
function core_group_remove_all(args){
    args = core_args({
      'args': args,
      'defaults': {
        'delete-empty': false,
      },
    });

    for(let group in core_groups){
        core_group_remove({
          'delete-empty': args['delete-empty'],
          'entities': args['entities'],
          'group': group,
        });
    }
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
    let key = core_events_keyinfo(event);

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
    if(core_menu_open
      || event['target'].id === 'core-toggle'){
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
    core_mouse['down-' + event.button] = false;
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
        'innerHTML': '<a href=../index.htm id=core-menu-root></a>/<a class=external id=core-menu-title rel=noopener></a><div id=core-menu-info></div><hr><span id=core-menu-tabs></span><div id=core-menu-tabcontent></div><input id=settings-reset type=button value="Reset Settings">',
      },
      'type': 'span',
    });
    core_html({
      'parent': 'core-ui',
      'properties': {
        'id': 'repo-ui',
      },
    });

    core_tab_create({
      'content': '<table><tr><td><input id=audio-volume><td>Audio Volume<tr><td><input id=color-negative type=color><td>Color Negative<tr><td><input id=color-positive type=color><td>Color Positive<tr><td><input id=decimals><td>Decimals<tr><td><input id=jump><td>Jump<tr><td><input id=mouse-sensitivity><td>Mouse Sensitivity<tr><td><input id=move-↑><td>Move ↑<tr><td><input id=move-←><td>Move ←<tr><td><input id=move-↓><td>Move ↓<tr><td><input id=move-→><td>Move →</table>',
      'group': 'core-menu',
      'id': 'iterami',
      'label': 'iterami',
    });

    // Keyboard/mouse init.
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

// Required args: id, to
function core_matrix_clone(args){
    core_matrices[args['to']] = core_matrix_create();
    core_matrix_copy({
      'id': args['id'],
      'to': args['to'],
    });
}

// Required args: id, to
function core_matrix_copy(args){
    Object.assign(
      core_matrices[args['to']],
      core_matrices[args['id']]
    );
}

function core_matrix_create(){
    return new Float32Array(16);
}

// Required args: ids
function core_matrix_delete(args){
    for(let id in args['ids']){
        delete core_matrices[args['ids'][id]];
    }
}

// Required args: id
function core_matrix_identity(args){
    for(let key in core_matrices[args['id']]){
        core_matrices[args['id']][key] =
          key % 5 === 0
            ? 1
            : 0;
    }
}

// Required args: dimensions, id
function core_matrix_rotate(args){
    let cache_id = 'rotate-cache-' + args['id'];

    // Rotate X.
    core_matrix_clone({
      'id': args['id'],
      'to': cache_id,
    });
    let cosine = Math.cos(args['dimensions'][0]);
    let sine = Math.sin(args['dimensions'][0]);

    core_matrices[args['id']][4] = core_matrices[cache_id][4] * cosine + core_matrices[cache_id][8] * sine;
    core_matrices[args['id']][5] = core_matrices[cache_id][5] * cosine + core_matrices[cache_id][9] * sine;
    core_matrices[args['id']][6] = core_matrices[cache_id][6] * cosine + core_matrices[cache_id][10] * sine;
    core_matrices[args['id']][7] = core_matrices[cache_id][7] * cosine + core_matrices[cache_id][11] * sine;
    core_matrices[args['id']][8] = core_matrices[cache_id][8] * cosine - core_matrices[cache_id][4] * sine;
    core_matrices[args['id']][9] = core_matrices[cache_id][9] * cosine - core_matrices[cache_id][5] * sine;
    core_matrices[args['id']][10] = core_matrices[cache_id][10] * cosine - core_matrices[cache_id][6] * sine;
    core_matrices[args['id']][11] = core_matrices[cache_id][11] * cosine - core_matrices[cache_id][7] * sine;

    // Rotate Y.
    core_matrix_copy({
      'id': args['id'],
      'to': cache_id,
    });
    cosine = Math.cos(args['dimensions'][1]);
    sine = Math.sin(args['dimensions'][1]);

    core_matrices[args['id']][0] = core_matrices[cache_id][0] * cosine - core_matrices[cache_id][8] * sine;
    core_matrices[args['id']][1] = core_matrices[cache_id][1] * cosine - core_matrices[cache_id][9] * sine;
    core_matrices[args['id']][2] = core_matrices[cache_id][2] * cosine - core_matrices[cache_id][10] * sine;
    core_matrices[args['id']][3] = core_matrices[cache_id][3] * cosine - core_matrices[cache_id][11] * sine;
    core_matrices[args['id']][8] = core_matrices[cache_id][8] * cosine + core_matrices[cache_id][0] * sine;
    core_matrices[args['id']][9] = core_matrices[cache_id][9] * cosine + core_matrices[cache_id][1] * sine;
    core_matrices[args['id']][10] = core_matrices[cache_id][10] * cosine + core_matrices[cache_id][2] * sine;
    core_matrices[args['id']][11] = core_matrices[cache_id][11] * cosine + core_matrices[cache_id][3] * sine;

    // Rotate Z.
    core_matrix_copy({
      'id': args['id'],
      'to': cache_id,
    });
    cosine = Math.cos(args['dimensions'][2]);
    sine = Math.sin(args['dimensions'][2]);

    core_matrices[args['id']][0] = core_matrices[cache_id][0] * cosine + core_matrices[cache_id][4] * sine;
    core_matrices[args['id']][1] = core_matrices[cache_id][1] * cosine + core_matrices[cache_id][5] * sine;
    core_matrices[args['id']][2] = core_matrices[cache_id][2] * cosine + core_matrices[cache_id][6] * sine;
    core_matrices[args['id']][3] = core_matrices[cache_id][3] * cosine + core_matrices[cache_id][7] * sine;
    core_matrices[args['id']][4] = core_matrices[cache_id][4] * cosine - core_matrices[cache_id][0] * sine;
    core_matrices[args['id']][5] = core_matrices[cache_id][5] * cosine - core_matrices[cache_id][1] * sine;
    core_matrices[args['id']][6] = core_matrices[cache_id][6] * cosine - core_matrices[cache_id][2] * sine;
    core_matrices[args['id']][7] = core_matrices[cache_id][7] * cosine - core_matrices[cache_id][3] * sine;

    core_matrix_delete({
      'ids': [cache_id],
    });
}

// Required args: id
function core_matrix_round(args){
    args = core_args({
      'args': args,
      'defaults': {
        'decimals': core_storage_data['decimals'],
      },
    });

    for(let key in core_matrices[args['id']]){
        core_matrices[args['id']][key] = core_round({
          'decimals': args['decimals'],
          'number': core_matrices[args['id']][key],
        });
    }
}

// Required args: dimensions, id
function core_matrix_translate(args){
    for(let i = 0; i < 4; i++){
        core_matrices[args['id']][i + 12] -= core_matrices[args['id']][i] * args['dimensions'][0]
          + core_matrices[args['id']][i + 4] * args['dimensions'][1]
          + core_matrices[args['id']][i + 8] * args['dimensions'][2];
    }

    core_matrix_round({
      'id': args['id'],
    });
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

// Required args: x0, x1, y0, y1
function core_move_2d(args){
    args = core_args({
      'args': args,
      'defaults': {
        'decimals': core_storage_data['decimals'],
        'multiplier': 1,
      },
    });

    let angle = core_point_angle({
      'x0': args['x0'],
      'x1': args['x1'],
      'y0': args['y0'],
      'y1': args['y1'],
    });

    let dx = core_round({
      'decimals': args['decimals'],
      'number': Math.cos(angle) * args['multiplier'],
    });
    let dy = core_round({
      'decimals': args['decimals'],
      'number': Math.sin(angle) * args['multiplier'],
    });

    if(args['x0'] > args['x1']){
        dx = -dx;
    }
    if(args['y0'] > args['y1']){
        dy = -dy;
    }

    return {
      'angle': angle,
      'x': dx,
      'y': dy,
    };
}

// Required args: dx, dy, speed
function core_move_2d_diagonal(args){
    let sqrt = Math.sqrt(args['speed']);
    return {
      'x': (args['dx'] / args['speed']) * sqrt,
      'y': args['dy'] > 0
        ? sqrt
        : -sqrt,
    };
}

// Required args; angle
function core_move_3d(args){
    args = core_args({
      'args': args,
      'defaults': {
        'decimals': core_storage_data['decimals'],
        'multiplier': 1,
        'speed': 1,
        'strafe': false,
      },
    });
    args['speed'] *= args['multiplier'];

    let radians = -core_degrees_to_radians({
      'decimals': args['decimals'],
      'degrees': args['angle'] - (args['strafe']
          ? 90
          : 0
        ),
    });
    return {
      'x': core_round({
        'decimals': args['decimals'],
        'number': Math.sin(radians) * args['speed'],
      }),
      'z': core_round({
        'decimals': args['decimals'],
        'number': Math.cos(radians) * args['speed'],
      }),
    };
}

// Required args: number
function core_number_format(args){
    args = core_args({
      'args': args,
      'defaults': {
        'decimals': core_storage_data['decimals'],
      },
    });

    if(core_number_formatter === false){
        core_number_formatter = new Intl.NumberFormat(
          void 0,
          {
            'maximumFractionDigits': args['decimals'],
          }
        );
    }

    return core_number_formatter.format(args['number']);
}

// Required args: x0, x1, y0, y1
function core_point_angle(args){
    return Math.atan(Math.abs(args['y0'] - args['y1']) / Math.abs(args['x0'] - args['x1']));
}

// Required args: radians
function core_radians_to_degrees(args){
    args = core_args({
      'args': args,
      'defaults': {
        'decimals': core_storage_data['decimals'],
      },
    });

    return core_round({
      'decimals': args['decimals'],
      'number': args['radians'] * core_radian,
    });
}

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
    let keys = Object.keys(args['object']);

    return keys[core_random_integer({
      'max': keys.length - 1,
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
        'characters': core_random_string_characters,
        'length': core_random_string_length,
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

// Required args: h0, h1, w0, w1, x0, x1, y0, y1
function core_rectangle_overlap(args){
    let boolean = false;
    if(args['x0'] < args['x1'] + args['w1']
      && args['x0'] + args['w0'] > args['x1']
      && args['y0'] < args['y1'] + args['h1']
      && args['y0'] + args['h0'] > args['y1']){
        boolean = true;
    }
    return boolean;
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
//   info, keybinds, menu, mousebinds, storage, storage-menu, tabs, textures, ui
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
        'tabs': {},
        'textures': false,
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

    for(let entity in args['entities']){
        core_entity_set({
          'default': args['entities'][entity]['default'],
          'groups': args['entities'][entity]['groups'],
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
    }
    document.getElementById('core-menu-root').innerHTML = args['github'];
    let repo_title = document.getElementById('core-menu-title');
    repo_title.href = 'https://github.com/' + args['github'] + '/' + core_repo_title;
    repo_title.innerHTML = core_repo_title;

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
    core_events_bind({
      'beforeunload': args['beforeunload'],
      'elements': args['events'],
      'keybinds': args['keybinds'],
      'mousebinds': args['mousebinds'],
    });

    core_audio_create({
      'audios': args['audios'],
    });

    for(let image in args['images']){
        core_image({
          'id': image,
          'src': args['images'][image],
        });
    }
    if(args['textures']){
        core_image({
          'id': '_texture-debug',
          'src': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAD1BMVEUAAP8A/wD/AAAAAAD///8hKtLYAAAAIklEQVQoz2NwQQMMTkoQIAgBIiNMwIEBAowhwGSECaAnBwAdPj4tFnzwQgAAAABJRU5ErkJggg==',
        });
        core_image({
          'id': '_texture-default',
          'src': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P8////fwAKAAP+j4hsjgAAAABJRU5ErkJggg==',
        });
    }

    document.getElementById('repo-ui').innerHTML = args['ui'];
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

    /*
    if(String(args['number']).indexOf('e') >= 0){
        args['number'] = Number(args['number'].toFixed(args['decimals']));
    }
    */

    let result = Number(
      Math.round(args['number'] + 'e+' + args['decimals'])
        + 'e-' + args['decimals']
    );
    if(Number.isNaN(result)){
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
}

// Required args: array
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
          return Math.random() - .5;
      },
    });
}

// Required args: array, property
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

        let data = core_storage_type_convert({
          'key': key,
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

// Required args: key, value
function core_storage_type_convert(args){
    let core_storage_default = core_storage_info[args['key']]['default'];

    if(core_type({
        'type': 'string',
        'var': core_storage_default,
      })){
        return args['value'];

    }else if(!Number.isNaN(Number.parseFloat(core_storage_default))){
        return Number.parseFloat(args['value']);

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
    for(let key in core_storage_data){
        let element = document.getElementById(key);
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

// Required args: target
function core_time_diff(args){
    args = core_args({
      'args': args,
      'defaults': {
        'now': false,
      },
    });

    if(args['now'] === false){
        args['now'] = core_date_to_timestamp();
    }

    let diff = args['target'] - args['now'];
    let prefix = '';
    if(diff < 0){
        diff = -diff;
        prefix = '- ';
    }

    return prefix + core_time_format({
      'date': core_timestamp_to_date({
        'timestamp': diff,
      }),
      'diff': true,
    });
}

function core_time_format(args){
    args = core_args({
      'args': args,
      'defaults': {
        'date': false,
        'diff': false,
      },
    });

    if(args['date'] === false){
        core_timestamp_to_date();
    }

    if(args['diff']){
        args['date']['date'] -= 1;
        args['date']['month'] -= 1;
        args['date']['year'] -= 1970;
    }

    return core_two_digits({
        'number': args['date']['year'],
      }) + '-'
      + core_two_digits({
        'number': args['date']['month'],
      }) + '-'
      + core_two_digits({
        'number': args['date']['date'],
      }) + ' '
      + core_two_digits({
        'number': args['date']['hour'],
      }) + ':'
      + core_two_digits({
        'number': args['date']['minute'],
      }) + ':'
      + core_two_digits({
        'number': args['date']['second'],
      });
}

function core_time_from_inputs(){
    let date = {
      'date': 0,
      'hour': 0,
      'millisecond': 0,
      'minute': 0,
      'month': 0,
      'second': 0,
      'year': 0,
    };
    for(let value in date){
        let element = document.getElementById(value);
        if(!element){
            continue;
        }

        date[value] = Number.parseInt(
          element.value,
          10
        );

        if(Number.isNaN(date[value])){
            date[value] = 0;
        }
    }

    return core_date_to_timestamp({
      'date': date,
    });
}

function core_timestamp_to_date(args){
    args = core_args({
      'args': args,
    });
    args['timestamp'] = args['timestamp'] !== void 0
      ? new Date(args['timestamp']).getTime()
      : new Date().getTime();

    let date = new Date(args['timestamp']);
    return {
      'date': date.getUTCDate(),
      'day': date.getUTCDay(),
      'hour': date.getUTCHours(),
      'millisecond': date.getUTCMilliseconds(),
      'minute': date.getUTCMinutes(),
      'month': date.getUTCMonth() + 1,
      'second': date.getUTCSeconds(),
      'timestamp': args['timestamp'],
      'year': date.getUTCFullYear(),
    };
}

// Required args: number
function core_two_digits(args){
    let prefix = args['number'] < 0
      ? '-'
      : '';
    args['number'] = Math.abs(args['number']);

    return prefix + (args['number'].toString().length < 2
      ? '0' + args['number']
      : args['number']);
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
             elements.item(i)[elements[i].tagName !== 'INPUT'
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

window.core_ajax_properties = {
  'data': null,
  'readyState': 4,
  'status': 200,
  'type': 'GET',
};
window.core_audio = {};
window.core_audio_context = 0;
window.core_audio_sources = {};
window.core_degree = Math.PI / 180;
window.core_entities = {};
window.core_entity_info = {};
window.core_entity_types_default = [];
window.core_events = {};
window.core_gamepads = {};
window.core_groups = {
  '_length': {},
};
window.core_id_count = 0;
window.core_images = {};
window.core_intervals = {};
window.core_key_rebinds = {};
window.core_keys = {};
window.core_matrices = {};
window.core_menu_open = false;
window.core_mode = 0;
window.core_mouse = {};
window.core_number_formatter = false;
window.core_radian = 180 / Math.PI;
window.core_random_boolean_chance = .5;
window.core_random_integer_max = 100;
window.core_random_string_characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
window.core_random_string_length = 100;
window.core_repo_title = '';
window.core_storage_data = {};
window.core_storage_info = {};
window.core_tabs = {};
window.core_tau = Math.PI * 2;
window.core_ui_values = {};

window.onload = core_init;
