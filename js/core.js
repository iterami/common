'use strict';

// Required args: args, defaults
function core_args(args){
    if(args.args === void 0){
        return args.defaults;
    }

    for(const arg in args.defaults){
        if(args.args[arg] === void 0){
            args.args[arg] = args.defaults[arg];
        }
    }

    return args.args;
}

// Required args: number
function core_digits_min(args){
    args = core_args({
      'args': args,
      'defaults': {
        'digits': 2,
      },
    });

    const number = String(Math.abs(args.number)).split('.');
    if(number[0].length >= args.digits){
        return String(args.number);
    }

    const sign = args.number < 0 ? '-' : '';
    const formatted = number[0].padStart(args.digits, '0');
    return sign + formatted + (number.length === 2 ? '.' + number[1] : '');
}

function core_escape(force){
    if(core_menu_lock
      && core_menu_open
      && force !== true){
        return;
    }
    if(core_type(force) === 'boolean'){
        if(core_menu_open === force){
            return;
        }
        core_menu_open = force;

    }else{
        core_menu_open = !core_menu_open;
    }

    if(core_menu_open){
        core_interval_pause_all();
        core_handle_blur();
        core_elements.repo_ui.style.display = 'none';
        core_elements.core_ui.style.userSelect = 'auto';
        core_elements.core_menu.style.display = 'inline';

    }else{
        core_elements.core_toggle.blur();
        core_elements.core_menu.style.display = 'none';
        core_elements.core_ui.style.userSelect = 'none';
        core_elements.repo_ui.style.display = 'inline';
        core_interval_resume_all();
    }

    globalThis.repo_escape?.();
}

function core_events_bind(args){
    args = core_args({
      'args': args,
      'defaults': {
        'beforeunload': false,
        'blur': false,
        'clearkeys': false,
        'clearpointer': false,
        'elements': false,
        'keybinds': false,
        'pointerbinds': false,
      },
    });

    if(args.beforeunload !== false){
        core_events.beforeunload = args.beforeunload;
        globalThis.addEventListener('beforeunload', core_handle_beforeunload);
    }
    if(args.blur !== false){
        core_events.blur = args.blur;
    }

    if(args.clearkeys){
        core_object_reset(core_keys);
    }
    if(args.keybinds !== false){
        for(const keybind in args.keybinds){
            core_keys[keybind] = core_args({
              'args': args.keybinds[keybind],
              'defaults': {
                'state': false,
              },
            });
        }
    }

    if(args.clearpointer){
        core_object_reset(core_pointer.todo);
    }
    if(args.pointerbinds !== false){
        for(const pointerbind in args.pointerbinds){
            core_pointer.todo[pointerbind] = core_args({
              'args': args.pointerbinds[pointerbind],
            });
        }
        if(args.pointerbinds.contextmenu){
            globalThis.addEventListener('contextmenu', core_handle_contextmenu);
        }

        document.addEventListener('pointerlockchange', core_handle_pointerlockchange);
        globalThis.addEventListener('pointercancel', core_handle_pointercancel, {'passive': false});
        globalThis.addEventListener('pointerdown', core_handle_pointerdown, {'passive': false});
        globalThis.addEventListener('pointermove', core_handle_pointermove, {'passive': false});
        globalThis.addEventListener('pointerup', core_handle_pointerup, {'passive': false});
        globalThis.addEventListener('wheel', core_handle_wheel, {'passive': false});

        globalThis.addEventListener('touchcancel', core_handle_touch, {'passive': false});
        globalThis.addEventListener('touchend', core_handle_touch, {'passive': false});
        globalThis.addEventListener('touchmove', core_handle_touch, {'passive': false});
        globalThis.addEventListener('touchstart', core_handle_touch, {'passive': false});
    }

    if(args.elements !== false){
        for(const element in args.elements){
            const domelement = core_getelement(element);
            for(const event in args.elements[element]){
                domelement[event] = args.elements[element][event];
            }
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
    filereader.onloadend = args.todo;
    filereader[args.type](args.file);
}

// Required args: a, b
function core_float_compare(args){
    args = core_args({
      'args': args,
      'defaults': {
        'precision': Number.EPSILON,
      },
    });

    return Math.abs(args.a - args.b) < args.precision;
}

function core_getelement(id){
    if(Object.hasOwn(core_elements, id)){
        return core_elements[id];
    }

    return document.getElementById(id);
}

function core_getpointerlock(){
    return document.pointerLockElement !== null;
}

function core_handle_beforeunload(event){
    if(core_events.beforeunload){
        core_events.beforeunload.todo?.(event);
    }
}

function core_handle_blur(){
    if(core_getpointerlock()){
        document.exitPointerLock();
    }
    core_key_shift = false;
    for(const key in core_keys){
        core_keys[key].state = false;
    }
    core_pointer.down_0 = false;
    core_pointer.down_1 = false;
    core_pointer.down_2 = false;
    core_pointer.down_3 = false;
    core_pointer.down_4 = false;

    if(core_events.blur){
        core_handle_prevent(event);
        core_events.blur.todo?.(event);
    }
}

function core_handle_contextmenu(event){
    if(!core_menu_open
      && core_pointer.todo.contextmenu){
        core_handle_prevent(event);
        core_pointer.todo.contextmenu.todo?.(event);
        return false;
    }
}

function core_handle_keydown(event){
    core_key_shift = event.shiftKey;

    if(event.ctrlKey
      || event.altKey
      || event.metaKey){
        return;
    }

    if(core_menu_open
      && core_menu_block_events
      && event.code !== 'Escape'){
        return;
    }

    const key = core_keys[event.code];
    if(key){
        if(key.state){
            return;
        }
        core_handle_prevent(event);
        key.state = true;
        key.down?.(event);
    }
}

function core_handle_keyup(event){
    core_key_shift = event.shiftKey;

    const key = core_keys[event.code];
    if(key){
        core_handle_prevent(event);
        key.state = false;
        key.up?.(event);
    }
}

function core_handle_pointercancel(event){
    if(event.isPrimary){
        return;
    }

    core_pointer.down_0 = false;
    core_pointer.down_1 = false;
    core_pointer.down_2 = false;
    core_pointer.down_3 = false;
    core_pointer.down_4 = false;
    core_pointer.movement_x = 0;
    core_pointer.movement_y = 0;

    if(core_pointer.todo.pointercancel){
        core_handle_prevent(event);
        core_pointer.todo.pointercancel.todo?.(event);
    }
}

function core_handle_pointerdown(event){
    if(!event.isPrimary
      || (core_menu_open && core_menu_block_events)
      || event.target.id === 'core_toggle'){
        return;
    }

    for(let i = 0; i < 5; i++){
        core_pointer['down_' + i] = Boolean(event.buttons & (1 << i));
    }
    if(core_key_shift && core_pointer.down_1){
        core_handle_blur();
        return;
    }

    const x = Math.floor(event.pageX);
    const y = Math.floor(event.pageY);
    core_pointer.movement_x = 0;
    core_pointer.movement_y = 0;
    core_pointer.x = x;
    core_pointer.y = y;
    core_pointer.down_x = x;
    core_pointer.down_y = y;

    if(core_pointer.todo.pointerdown){
        core_handle_prevent(event);
        core_pointer.todo.pointerdown.todo?.(event);
    }
}

function core_handle_pointerlockchange(){
    if(core_menu_open){
        document.exitPointerLock();

    }else if(!core_getpointerlock()){
        core_escape(true);
    }
}

function core_handle_pointermove(event){
    if(!event.isPrimary){
        return;
    }

    const x = Math.floor(event.pageX);
    const y = Math.floor(event.pageY);
    const old_x = core_pointer.x;
    const old_y = core_pointer.y;
    core_pointer.x = x;
    core_pointer.y = y;

    if(core_menu_open && core_menu_block_events){
        return;
    }

    core_mobile = event.pointerType !== 'mouse';
    for(let i = 0; i < 5; i++){
        core_pointer['down_' + i] = Boolean(event.buttons & (1 << i));
    }
    if(core_mobile){
        core_pointer.movement_x = (x - old_x) * (core_storage_data.pointer_horizontal || 1);
        core_pointer.movement_y = (y - old_y) * (core_storage_data.pointer_vertical || 1);

    }else{
        core_pointer.movement_x = event.movementX * (core_storage_data.pointer_horizontal || 1);
        core_pointer.movement_y = event.movementY * (core_storage_data.pointer_vertical || 1);
    }

    if(core_pointer.todo.pointermove){
        core_handle_prevent(event);
        core_pointer.todo.pointermove.todo?.(event);
    }
}

function core_handle_pointerup(event){
    core_pointer.down_0 = false;
    core_pointer.down_1 = false;
    core_pointer.down_2 = false;
    core_pointer.down_3 = false;
    core_pointer.down_4 = false;

    if(core_pointer.todo.pointerup
      && event.target.id !== 'core_toggle'){
        core_handle_prevent(event);
        core_pointer.todo.pointerup.todo?.(event);
    }
}

function core_handle_prevent(event){
    event.stopPropagation();

    if(event.cancelable !== false){
        event.preventDefault();
    }
}

function core_handle_touch(event){
    if((core_menu_open && core_menu_block_events)
      || event.target.id === 'core_toggle'){
        return;
    }

    core_handle_prevent(event);
}

function core_handle_wheel(event){
    if(core_menu_open
      && core_menu_block_events){
        return;
    }

    if(core_pointer.todo.wheel){
        core_handle_prevent(event);
        core_pointer.todo.wheel.todo?.(event);
    }
}

function core_hex_to_rgb(hex){
    if(hex[0] === '#'){
        hex = hex.slice(1);
    }
    if(hex.length === 3){
        return {
          'blue': '0x' + hex[2] + hex[2] | 0,
          'green': '0x' + hex[1] + hex[1] | 0,
          'red': '0x' + hex[0] + hex[0] | 0,
        };
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

    if(args.properties.id){
        const existing_element = core_getelement(args.properties.id);
        if(existing_element){
            return existing_element;
        }
    }

    const element = document.createElement(args.type);
    for(const property in args.properties){
        if(element[property] === void 0){
            element.setAttribute(
              property,
              args.properties[property]
            );

        }else{
            element[property] = args.properties[property];
        }
    }
    if(args.parent !== false){
        args.parent[args.todo](element);
    }

    if(args.store !== false){
        core_elements[args.store] = element;
    }

    return element;
}

function core_html_format(string){
    return core_replace({
      'patterns': {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '\'': '&apos;',
        '"': '&quot;',
        '\n\r': '<br>',
        '\n': '<br>',
      },
      'string': string,
    });
}

// Required args: id, src
function core_image(args){
    const image = new Image();
    image.onload = args.todo;
    image.src = args.src;
    core_images[args.id] = image;
    return image;
}

function core_init(){
    core_html({
      'parent': document.body,
      'properties': {
        'id': 'core_ui',
      },
      'store': 'core_ui',
      'todo': 'prepend',
    });
    core_html({
      'parent': core_elements.core_ui,
      'properties': {
        'id': 'core_toggle',
        'onclick': core_escape,
        'textContent': '☰',
      },
      'store': 'core_toggle',
      'type': 'button',
    });
    core_html({
      'parent': core_elements.core_ui,
      'properties': {
        'id': 'core_menu',
        'innerHTML': '<a id=core_menu_root></a>/<a class=external id=core_menu_title rel=noreferrer></a>',
        'style': 'display:none',
      },
      'store': 'core_menu',
      'type': 'span',
    });
    core_html({
      'parent': core_elements.core_ui,
      'properties': {
        'id': 'repo_ui',
      },
      'store': 'repo_ui',
      'type': 'span',
    });

    core_pointer = {
      'down_0': false,
      'down_1': false,
      'down_2': false,
      'down_3': false,
      'down_4': false,
      'down_x': 0,
      'down_y': 0,
      'movement_x': 0,
      'movement_y': 0,
      'todo': {},
      'x': 0,
      'y': 0,
    };
    globalThis.addEventListener('blur', core_handle_blur);
    globalThis.addEventListener('keydown', core_handle_keydown);
    globalThis.addEventListener('keyup', core_handle_keyup);

    globalThis.repo_init();
}

function core_interval_animationFrame(id){
    const interval = core_intervals[id];
    interval.var = globalThis.requestAnimationFrame(interval.todo);
}

function core_interval_lock(id){
    const interval = core_intervals[id];
    interval.lock = true;

    if(!interval.paused){
        core_interval_pause(id);
    }
}

function core_interval_lock_all(){
    for(const interval in core_intervals){
        core_interval_lock(interval);
    }
}

// Required args: id, interval, todo
function core_interval_modify(args){
    args = core_args({
      'args': args,
      'defaults': {
        'lock': false,
        'paused': false,
        'set': 'setInterval',
      },
    });

    const properties = {
      'interval': args.interval,
      'lock': args.lock,
      'paused': true,
      'set': args.set,
      'todo': args.todo,
    };

    if(core_intervals[args.id]){
        core_interval_pause(args.id);

        Object.assign(
          core_intervals[args.id],
          properties
        );

    }else{
        core_intervals[args.id] = properties;
    }

    if(!args.paused){
        core_interval_resume(args.id);
    }
}

function core_interval_pause(id){
    const interval = core_intervals[id];
    interval.paused = true;

    globalThis[interval.interval === -1
      ? 'cancelAnimationFrame'
      : 'clearInterval'](interval.var);
}

function core_interval_pause_all(){
    for(const interval in core_intervals){
        core_interval_pause(interval);
    }
}

function core_interval_resume(id){
    const interval = core_intervals[id];
    if(!interval.paused){
        return;
    }

    interval.lock = false;
    interval.paused = false;

    if(interval.interval === -1){
        interval.var = globalThis.requestAnimationFrame(interval.todo);

    }else if(interval.interval === -2){
        interval.todo();
        interval.var = core_interval_sync(interval);

    }else{
        interval.var = globalThis[interval.set](
          interval.todo,
          interval.interval
        );
    }
}

function core_interval_resume_all(){
    for(const interval in core_intervals){
        if(core_intervals[interval].lock){
            continue;
        }

        core_interval_resume(interval);
    }
}

function core_interval_sync(interval){
    if(interval.paused){
        return;
    }

    return globalThis.setTimeout(
      function(){
          interval.todo();
          interval.var = core_interval_sync(interval);
      },
      1000 - new Date().getMilliseconds(),
    );
}

function core_keys_rebind(){
    const keys = {
      'Escape': {
        'down': core_escape,
      },
    };
    for(const id in core_key_rebinds){
        keys[core_storage_data[id] || id] = {
          ...core_key_rebinds[id],
        };
    }
    core_events_bind({
      'clearkeys': true,
      'keybinds': keys,
    });
}

// Required args: number
function core_number_format(args){
    args = core_args({
      'args': args,
      'defaults': {
        'decimals_max': 7,
        'decimals_min': 0,
      },
    });

    if(args.decimals_max < args.decimals_min){
        args.decimals_min = args.decimals_max;
    }

    return new Intl.NumberFormat(
        void 0,
        {
          'maximumFractionDigits': args.decimals_max,
          'minimumFractionDigits': args.decimals_min,
        }
      ).format(args.number);
}

function core_object_reset(object){
    if(core_type(object) === 'array'){
        object.length = 0;
        return;
    }

    for(const property in object){
        delete object[property];
    }
}

function core_random_boolean(chance){
    if(chance === void 0){
        chance = .5;
    }

    return Math.random() < chance;
}

// Required args: options
function core_random_drop(args){
    args = core_args({
      'args': args,
      'defaults': {
        'nothing': 1,
        'nothing_type': 0,
      },
    });

    const options = {};
    let total = 0;

    for(const option in args.options){
        total += args.options[option];
        options[option] = total;
    }

    if(args.nothing_type === 0){
        if(total < args.nothing){
            total += args.nothing - total;
        }

    }else if(args.nothing_type === 1){
        total += args.nothing;
    }

    const random = Math.random() * total;
    for(const option in options){
        if(random < options[option]){
            return option;
        }
    }

    return false;
}

function core_random_hex(){
    return core_random_integer(0xffffff).toString(16).padStart(6, '0');
}

function core_random_integer(max){
    return Math.floor(Math.random() * max);
}

function core_random_key(object){
    const keys = Object.keys(object);

    return keys[core_random_integer(keys.length)];
}

function core_random_rgb(){
    return {
      'blue': core_random_integer(256),
      'green': core_random_integer(256),
      'red': core_random_integer(256),
    };
}

function core_random_splice(array){
    return array.splice(
      core_random_integer(array.length),
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
    for(let i = 0; i < args.length; i++){
        string += args.characters[core_random_integer(args.characters.length)];
    }
    return string;
}

// Required args: patterns, string
function core_replace(args){
    let string_value = args.string;
    for(const pattern in args.patterns){
        string_value = string_value.replace(
          new RegExp(
            pattern,
            'g'
          ),
          args.patterns[pattern]
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
        'blur': false,
        'events': {},
        'globals': {},
        'images': {},
        'info': '',
        'keybinds': false,
        'link': false,
        'menu': false,
        'menu_block_events': true,
        'menu_lock': false,
        'owner': 'iterami',
        'pointerbinds': false,
        'root': '../index.htm',
        'storage': false,
        'storage_controls': false,
        'storage_menu': '',
        'tabs': {},
        'ui': '',
        'ui_elements': [],
      },
    });

    Object.assign(
      globalThis,
      args.globals
    );

    core_repo_title = args.title;
    if(args.info.length){
        core_html({
          'parent': core_elements.core_menu,
          'properties': {
            'id': 'core_menu_info',
            'innerHTML': args.info,
          },
          'todo': 'append',
        });
    }
    Object.assign(
      document.getElementById('core_menu_root'),
      {
        'href': args.root,
        'textContent': args.owner,
      }
    );
    Object.assign(
      document.getElementById('core_menu_title'),
      {
        'href': args.link === false
          ? 'https://github.com/' + args.owner + '/' + core_repo_title
          : args.link,
        'textContent': core_repo_title,
      }
    );
    core_elements.repo_ui.innerHTML = args.ui;

    let have_default = false;
    for(const tab in args.tabs){
        core_tab_create({
          'content': args.tabs[tab].content,
          'group': args.tabs[tab].group,
          'id': tab,
          'label': args.tabs[tab].label,
        });

        if(args.tabs[tab].default){
            core_tab_switch('tab_' + tab);
            have_default = true;
        }
    }
    if(args.storage_controls){
        core_tab_create({
          'content': '<table><tr><td><input class=mini id=move_up type=text><td>Move Up/Forward'
            + '<tr><td><input class=mini id=move_left type=text><td>Move Left'
            + '<tr><td><input class=mini id=move_down type=text><td>Move Down/Back'
            + '<tr><td><input class=mini id=move_right type=text><td>Move Right'
            + '<tr><td><input class=mini id=jump type=text><td>Jump'
            + '<tr><td><input class=mini id=crouch type=text><td>Crouch'
            + '<tr><td><input class=mini id=pointer_horizontal step=any type=number>x<br><input class=mini id=pointer_vertical step=any type=number>y<td>Pointer<br>Sensitivity</table><button id=storage_reset_controls type=button>Reset Controls</button>',
          'group': 'core_menu',
          'id': 'controls',
          'label': 'Controls',
        });
        core_storage_add({
          'prefix': 'controls_',
          'storage': {
            'crouch': 'KeyC',
            'jump': 'Space',
            'move_down': 'KeyS',
            'move_left': 'KeyA',
            'move_right': 'KeyD',
            'move_up': 'KeyW',
            'pointer_horizontal': 1,
            'pointer_vertical': 1,
          },
        });
        args.events.storage_reset_controls = {
          'onclick': function(){
              core_storage_reset({
                'label': 'controls',
                'prefix': 'controls_',
              });
              core_keys_rebind();
          },
        };
        Object.assign(
          core_key_rebinds,
          {
            'crouch': true,
            'jump': true,
            'move_down': true,
            'move_left': true,
            'move_right': true,
            'move_up': true,
            ...args.storage_controls,
          },
        );
    }
    if(args.storage !== false){
        core_tab_create({
          'content': args.storage_menu
            + '<button id=storage_reset_repo type=button>Reset ' + core_repo_title + ' Settings</button>',
          'group': 'core_menu',
          'id': 'repo',
          'label': core_repo_title,
          'todo': 'prepend',
        });
        core_storage_add({
          'storage': args.storage,
        });
        args.events.storage_reset_repo = {
          'onclick': function(){
              core_storage_reset({
                'label': core_repo_title,
                'prefix': core_repo_title + '_',
              });
          },
        };
    }
    core_storage_update();
    if(!have_default){
        core_tab_switch('tab_repo');
    }

    if(args.keybinds !== false){
        Object.assign(
          core_key_rebinds,
          args.keybinds,
        );
    }
    core_keys_rebind();

    core_menu_block_events = args.menu_block_events;
    core_menu_lock = args.menu_lock;
    core_events_bind({
      'beforeunload': args.beforeunload,
      'blur': args.blur,
      'elements': args.events,
      'pointerbinds': args.pointerbinds,
    });

    for(const image in args.images){
        core_image({
          'id': image,
          'src': args.images[image],
        });
    }
    for(const element of args.ui_elements){
        core_elements[element] = document.getElementById(element);
    }

    for(const todo of core_init_todo){
        todo();
    }
    delete globalThis.core_init_todo;

    if(args.menu
      || args.menu_lock){
        core_escape(true);
    }
}

function core_requestpointerlock(element){
    if(core_menu_open
      || core_mobile
      || core_getpointerlock()
      || core_keys.Escape.state){
        return;
    }

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

    let returned = 0;
    const result = Number(
      Math.round(args.number + 'e+' + args.decimals)
        + 'e-' + args.decimals
    );

    if(globalThis.isNaN(result)){
        const eIndex = String(args.number).indexOf('e');
        let eString = '';
        if(eIndex >= 0){
            eString = String(args.number).slice(eIndex);
            args.number = String(args.number).slice(
              0,
              eIndex
            );

            const power = Number(eString.slice(2));
            if(power === args.decimals){
                eString = 'e-' + (power + 1);
            }
        }

        returned = Number(Number(Math.round(args.number + 'e+' + args.decimals) + 'e-' + args.decimals) + eString);

    }else{
        returned = result;
    }

    if(Math.abs(returned) < Number('1e-' + args.decimals)){
        return 0;
    }
    return returned;
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

    const target_array = args.clone
      ? globalThis.structuredClone(args.array)
      : args.array;

    target_array.sort(args.todo);
    if(args.reverse){
        target_array.reverse();
    }

    return target_array;
}

// Required args: array
function core_sort_numbers(args){
    return core_sort_custom({
      'array': args.array,
      'clone': args.clone,
      'reverse': args.reverse,
      'todo': function(a, b){
          return a - b;
      },
    });
}

// Required args: array, property
function core_sort_property(args){
    return core_sort_custom({
      'array': args.array,
      'clone': args.clone,
      'reverse': args.reverse,
      'todo': function(a, b){
          if(a[args.property] > b[args.property]){
              return 1;
          }
          if(a[args.property] < b[args.property]){
              return -1;
          }
          return 0;
      },
    });
}

// Required args: array
function core_sort_random(args){
    return core_sort_custom({
      'array': args.array,
      'clone': args.clone,
      'todo': function(a, b){
          return core_random_boolean(.5);
      },
    });
}

// Required args: array
function core_sort_strings(args){
    return core_sort_custom({
      'array': args.array,
      'clone': args.clone,
      'reverse': args.reverse,
      'todo': new Intl.Collator().compare,
    });
}

// Required args: storage
function core_storage_add(args){
    args = core_args({
      'args': args,
      'defaults': {
        'prefix': core_repo_title + '_',
      },
    });

    for(const key in args.storage){
        core_storage_info[key] = {
          'default': args.storage[key],
          'prefix': args.prefix,
        };
        const value = globalThis.localStorage.getItem(args.prefix + key);
        core_storage_data[key] = value === null
          ? core_storage_info[key].default
          : core_type_convert({
              'template': core_storage_info[key].default,
              'value': value,
            });
        core_elements[key] = document.getElementById(key);
    }

    if(!document.getElementById('storage_save')){
        core_html({
          'parent': core_elements.core_menu,
          'properties': {
            'id': 'storage_save',
            'onclick': core_storage_save,
            'textContent': 'Save All Settings',
            'type': 'button',
          },
          'todo': 'append',
          'type': 'button',
        });
    }
}

// Required args: element, key
function core_storage_element_property(args){
    return core_type(core_storage_info[args.key].default) === 'boolean'
      ? 'checked'
      : (core_type(args.element.value) === 'undefined'
        ? 'textContent'
        : 'value');
}


// Required args: label, prefix
function core_storage_reset(args){
    if(!globalThis.confirm('Reset ' + args.label + ' settings?')){
        return;
    }

    let keys = [];
    for(const key in core_storage_info){
        if(core_storage_info[key].prefix === args.prefix){
            keys.push(key);
        }
    }
    for(const key of keys){
        core_storage_data[key] = core_storage_info[key].default;
        globalThis.localStorage.removeItem(core_storage_info[key].prefix + key);
    }

    core_storage_update();
}

function core_storage_save(args){
    args = core_args({
      'args': args,
      'defaults': {
        'keys': false,
        'rebind': true,
      },
    });

    if(core_type(args.keys) !== 'array'){
        args.keys = Object.keys(core_storage_data);
    }
    for(const key of args.keys){
        const element = core_elements[key];
        const data = core_type_convert({
          'template': core_storage_info[key].default,
          'value': element[core_storage_element_property({
            'element': element,
            'key': key,
          })],
        });
        core_storage_data[key] = data;

        if(data !== void 0
          && !Number.isNaN(data)
          && String(data).length
          && data !== core_storage_info[key].default){
            globalThis.localStorage.setItem(
              core_storage_info[key].prefix + key,
              data
            );

        }else{
            globalThis.localStorage.removeItem(core_storage_info[key].prefix + key);
        }
    }

    if(args.rebind){
        core_keys_rebind();
    }
}

function core_storage_update(keys){
    if(core_type(keys) !== 'array'){
        keys = Object.keys(core_storage_data);
    }

    for(const key of keys){
        const element = core_elements[key];
        element[core_storage_element_property({
          'element': element,
          'key': key,
        })] = core_storage_data[key];
    }
}

// Required args: content, group, id, label
function core_tab_create(args){
    const tabs_id = 'tabs_' + args.group;
    const tabcontents_id = 'tabcontents_' + args.group;

    let tabs = document.getElementById(tabs_id);
    if(!tabs){
        tabs = core_html({
          'parent': core_elements.core_menu,
          'properties': {
            'id': tabs_id,
          },
          'todo': 'append',
        });
        core_html({
          'parent': core_elements.core_menu,
          'properties': {
            'className': 'tabcontents',
            'id': tabcontents_id,
          },
          'todo': 'append',
        });
    }

    core_html({
      'parent': tabs,
      'properties': {
        'id': 'tab_' + args.id,
        'onclick': function(){
            core_tab_switch(this.id);
        },
        'textContent': args.label,
      },
      'todo': args.todo,
      'type': 'button',
    });
    core_html({
      'parent': document.getElementById(tabcontents_id),
      'properties': {
        'id': 'tabcontent_' + args.id,
        'innerHTML': args.content,
        'style': 'display:none',
      },
    });
}

function core_tab_switch(id){
    const tab = document.getElementById('tabcontent_' + id.substring(4));
    if(!tab){
        return;
    }

    const state = tab.style.display === 'block';
    const tabs = tab.parentElement.children;
    for(let tab = 0; tab < tabs.length; tab++){
        tabs[tab].style.display = 'none';
    }
    tab.style.display = state
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
    const type = core_type(args.template);
    if(type === 'string'){
        return String(args.value);
    }
    if(type === 'array'
      || type === 'object'){
        return args.value;
    }
    if(type === 'boolean'
      && core_type(args.value) !== 'boolean'){
        return args.value === 'true';
    }
    if(!globalThis.isNaN(Number.parseFloat(args.template))){
        return Number.parseFloat(args.value);
    }
    return args.value;
}

function core_ui_update(args){
    args = core_args({
      'args': args,
      'defaults': {
        'class': false,
        'ids': {},
        'todo': 'textContent',
      },
    });

    for(const id in args.ids){
        if(core_ui_values[id] === args.ids[id]){
            continue;
        }

        core_ui_values[id] = args.ids[id];

        if(!Object.hasOwn(core_elements, id)){
            core_elements[id] = document.getElementById(id);
        }

        const element = core_elements[id];
        if(element.type === 'checkbox'){
            element.checked = Boolean(args.ids[id]);

        }else{
            element[(element.tagName === 'BUTTON' || core_type(element.value) === 'undefined')
              ? args.todo
              : 'value'] = args.ids[id];
        }

        if(!args.class){
            continue;
        }

        const elements = document.getElementsByClassName(id);
        for(const item of elements){
            if(item.type === 'checkbox'){
                item.checked = Boolean(args.ids[id]);

            }else{
                item[(element.tagName === 'BUTTON' || core_type(item.value) === 'undefined')
                  ? args.todo
                  : 'value'] = args.ids[id];
            }
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

    return args.element.toDataURL(
      args.type,
      args.quality
    );
}

globalThis.core_elements = {};
globalThis.core_events = {};
globalThis.core_images = {};
globalThis.core_init_todo = [];
globalThis.core_intervals = {};
globalThis.core_key_rebinds = {};
globalThis.core_key_shift = false;
globalThis.core_keys = {};
globalThis.core_menu_block_events = true;
globalThis.core_menu_lock = false;
globalThis.core_menu_open = false;
globalThis.core_mobile = 'TouchEvent' in globalThis;
globalThis.core_mode = 0;
globalThis.core_pointer = {};
globalThis.core_repo_title = '';
globalThis.core_storage_data = {};
globalThis.core_storage_info = {};
globalThis.core_ui_values = {};

globalThis.onload = core_init;
