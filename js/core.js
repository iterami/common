'use strict';

function core_digits_min({
  digits = 2,
  number,
} = {}){
    const value = String(Math.abs(number)).split('.');
    if(value[0].length >= digits){
        return String(number);
    }

    const sign = number < 0 ? '-' : '';
    const formatted = value[0].padStart(digits, '0');
    return sign + formatted + (value.length === 2 ? '.' + value[1] : '');
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
        core_elements.core_ui.style.userSelect = 'auto';
        core_elements.core_menu.style.display = 'inline';

    }else{
        core_elements.core_toggle.blur();
        core_elements.core_menu.style.display = 'none';
        core_elements.core_ui.style.userSelect = 'none';
        core_interval_resume_all();
    }

    globalThis.repo_escape?.();
}

function core_events_bind({
  beforeunload = false,
  blur = false,
  clearkeys = false,
  clearpointer = false,
  elements = false,
  keybinds = false,
  pointerbinds = false,
} = {}){
    if(beforeunload !== false){
        core_events.beforeunload = beforeunload;
        globalThis.addEventListener('beforeunload', core_handle_beforeunload);
    }
    if(blur !== false){
        core_events.blur = blur;
    }

    if(clearkeys){
        core_object_reset(core_keys);
    }
    if(keybinds !== false){
        for(const bind in keybinds){
            core_keys[bind] = core_object_defaults({
              'object': keybinds[bind],
              'defaults': {
                'state': false,
              },
            });
        }
    }

    if(clearpointer){
        core_object_reset(core_pointer.todo);
    }
    if(pointerbinds !== false){
        for(const bind in pointerbinds){
            core_pointer.todo[bind] = {...pointerbinds[bind]};
        }
        if(pointerbinds.contextmenu){
            globalThis.addEventListener('contextmenu', core_handle_contextmenu);
        }

        const options = {
          'passive': false,
        };

        document.addEventListener('pointerlockchange', core_handle_pointerlockchange);
        globalThis.addEventListener('pointercancel', core_handle_pointercancel, options);
        globalThis.addEventListener('pointerdown', core_handle_pointerdown, options);
        globalThis.addEventListener('pointermove', core_handle_pointermove, options);
        globalThis.addEventListener('pointerup', core_handle_pointerup, options);
        globalThis.addEventListener('wheel', core_handle_wheel, options);

        globalThis.addEventListener('touchcancel', core_handle_touch, options);
        globalThis.addEventListener('touchend', core_handle_touch, options);
        globalThis.addEventListener('touchmove', core_handle_touch, options);
        globalThis.addEventListener('touchstart', core_handle_touch, options);
    }

    if(elements !== false){
        for(const id in elements){
            Object.assign(
              core_getelement(id),
              elements[id]
            );
        }
    }
}

function core_file({
  file,
  todo,
  type = 'readAsDataURL',
} = {}){
    const filereader = new FileReader();
    filereader.onload = todo;
    filereader[type](file);
}

function core_float_compare({
  a,
  b,
  precision,
} = {}){
    if(a === b){
        return true;
    }

    if(!precision){
        precision = Number.EPSILON * Math.max(
          1,
          Math.abs(a),
          Math.abs(b)
        );
    }

    return Math.abs(a - b) < precision;
}

function core_getelement(id){
    if(id in core_elements){
        return core_elements[id];
    }

    return document.getElementById(id);
}

function core_getpointerlock(){
    return document.pointerLockElement !== null;
}

function core_handle_beforeunload(event){
    core_events.beforeunload?.todo?.(event);
}

function core_handle_blur(event){
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

    if(core_menu_open && core_menu_block_events
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
      || core_elements.core_ui.contains(event.target)){
        return;
    }

    for(let i = 0; i < 5; i++){
        core_pointer['down_' + i] = Boolean(event.buttons & (1 << i));
    }
    if(core_key_shift && core_pointer.down_1){
        core_handle_blur();
        return;
    }

    core_pointer.x = event.pageX;
    core_pointer.y = event.pageY;
    core_pointer.down_x = event.pageX;
    core_pointer.down_y = event.pageY;
    core_pointer.movement_x = 0;
    core_pointer.movement_y = 0;

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

    core_mobile = event.pointerType !== 'mouse';
    const old_x = core_pointer.x;
    const old_y = core_pointer.y;
    core_pointer.x = event.pageX;
    core_pointer.y = event.pageY;

    if(core_menu_open && core_menu_block_events){
        return;
    }

    for(let i = 0; i < 5; i++){
        core_pointer['down_' + i] = Boolean(event.buttons & (1 << i));
    }

    let movement_x = event.movementX;
    let movement_y = event.movementY;
    if(core_mobile){
        movement_x = core_pointer.x - old_x;
        movement_y = core_pointer.y - old_y;
    }
    if('pointer_horizontal' in core_storage_data){
        movement_x *= core_storage_data.pointer_horizontal;
    }
    if('pointer_vertical' in core_storage_data){
        movement_y *= core_storage_data.pointer_vertical;
    }
    core_pointer.movement_x = movement_x;
    core_pointer.movement_y = movement_y;

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
      && !core_elements.core_ui.contains(event.target)){
        core_handle_prevent(event);
        core_pointer.todo.pointerup.todo?.(event);
    }
}

function core_handle_prevent(event){
    if(!event){
        return;
    }

    event.stopPropagation();
    if(event.cancelable !== false){
        event.preventDefault();
    }
}

function core_handle_touch(event){
    if((core_menu_open && core_menu_block_events)
      || core_elements.core_ui.contains(event.target)){
        return;
    }

    core_handle_prevent(event);
}

function core_handle_wheel(event){
    if(core_menu_open && core_menu_block_events){
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

function core_html({
  parent = false,
  properties = {},
  store = false,
  todo = 'append',
  type = 'div',
} = {}){
    if(properties.id){
        const existing_element = core_getelement(properties.id);
        if(existing_element){
            return existing_element;
        }
    }

    const element = document.createElement(type);
    for(const property in properties){
        if(element[property] === void 0){
            element.setAttribute(
              property,
              properties[property]
            );

        }else{
            element[property] = properties[property];
        }
    }
    if(parent !== false){
        parent[todo](element);
    }
    if(store !== false){
        core_elements[store] = element;
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

function core_image({
  id,
  src,
  todo,
} = {}){
    const image = new Image();
    image.onload = todo;
    image.src = src;
    core_images[id] = image;
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
        'innerHTML': '<a id=core_menu_root></a>/<a class=external id=core_menu_title rel=noreferrer target=_blank></a>',
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

function core_interval_modify({
  id,
  interval,
  lock = false,
  paused = false,
  set = 'setInterval',
  todo,
} = {}){
    const properties = {
      'interval': interval,
      'lock': lock,
      'paused': true,
      'set': set,
      'todo': todo,
    };

    if(core_intervals[id]){
        core_interval_pause(id);

        Object.assign(
          core_intervals[id],
          properties
        );

    }else{
        core_intervals[id] = properties;
    }

    if(!paused){
        core_interval_resume(id);
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

function core_number_format({
  decimals_max = 7,
  decimals_min = 0,
  number,
} = {}){
    if(decimals_max < decimals_min){
        decimals_min = decimals_max;
    }

    return new Intl.NumberFormat(
        void 0,
        {
          'maximumFractionDigits': decimals_max,
          'minimumFractionDigits': decimals_min,
        }
      ).format(number);
}

function core_object_defaults({
  defaults = {},
  object,
} = {}){
    if(object === void 0){
        return defaults;
    }

    for(const property in defaults){
        if(object[property] === void 0){
            object[property] = defaults[property];
        }
    }
    return object;
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

function core_random_drop({
  nothing = 1,
  nothing_type = 0,
  options,
} = {}){
    const totals = {};
    let total = 0;

    for(const option in options){
        total += options[option];
        totals[option] = total;
    }

    if(nothing_type === 0){
        if(total < nothing){
            total += nothing - total;
        }

    }else if(nothing_type === 1){
        total += nothing;
    }

    const random = Math.random() * total;
    for(const option in totals){
        if(random < totals[option]){
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

function core_random_string({
  characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  length = 100,
} = {}){
    let string = '';
    for(let i = 0; i < length; i++){
        string += characters[core_random_integer(characters.length)];
    }
    return string;
}

function core_replace({
  patterns,
  string,
} = {}){
    let string_value = string;
    for(const pattern in patterns){
        string_value = string_value.replace(
          new RegExp(
            pattern,
            'g'
          ),
          patterns[pattern]
        );
    }

    return string_value;
}

function core_repo_init({
  beforeunload = false,
  blur = false,
  events = {},
  globals = {},
  images = {},
  info = '',
  keybinds = false,
  link = false,
  menu = false,
  menu_block_events = true,
  menu_lock = false,
  owner = 'iterami',
  pointerbinds = false,
  root = '../index.htm',
  storage = false,
  storage_controls = false,
  storage_menu = '',
  tabs = {},
  title,
  ui = '',
  ui_elements = [],
} = {}){
    Object.assign(
      globalThis,
      globals
    );

    core_repo_title = title;
    if(info.length){
        core_html({
          'parent': core_elements.core_menu,
          'properties': {
            'id': 'core_menu_info',
            'innerHTML': info,
          },
          'todo': 'append',
        });
    }
    Object.assign(
      document.getElementById('core_menu_root'),
      {
        'href': root,
        'textContent': owner,
      }
    );
    Object.assign(
      document.getElementById('core_menu_title'),
      {
        'href': link === false
          ? 'https://github.com/' + owner + '/' + core_repo_title
          : link,
        'textContent': core_repo_title,
      }
    );
    core_elements.repo_ui.innerHTML = ui;

    let have_default = false;
    for(const id in tabs){
        const tab = tabs[id];
        core_tab_create({
          'content': tab.content,
          'group': tab.group,
          'id': id,
          'label': tab.label,
        });
        if(tab.default){
            core_tab_switch('tab_' + id);
            have_default = true;
        }
    }
    if(storage_controls){
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
        events.storage_reset_controls = {
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
            ...storage_controls,
          },
        );
    }
    if(storage !== false){
        core_tab_create({
          'content': storage_menu
            + '<button id=storage_reset_repo type=button>Reset ' + core_repo_title + ' Settings</button>',
          'group': 'core_menu',
          'id': 'repo',
          'label': core_repo_title,
          'todo': 'prepend',
        });
        core_storage_add({
          'storage': storage,
        });
        events.storage_reset_repo = {
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

    if(keybinds !== false){
        Object.assign(
          core_key_rebinds,
          keybinds,
        );
    }
    core_keys_rebind();

    core_menu_block_events = menu_block_events;
    core_menu_lock = menu_lock;
    core_events_bind({
      'beforeunload': beforeunload,
      'blur': blur,
      'elements': events,
      'pointerbinds': pointerbinds,
    });

    for(const id in images){
        core_image({
          'id': image,
          'src': images[id],
        });
    }
    for(const id of ui_elements){
        core_elements[id] = document.getElementById(id);
    }

    for(const todo of core_init_todo){
        todo();
    }
    delete globalThis.core_init_todo;

    if(menu
      || menu_lock){
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

    let request;
    try{
        request = element.requestPointerLock();

    }catch(error){
        return;
    }

    if(request && core_type(request.then) === 'function'){
        request.catch(function(error){});
    }
}

function core_round({
  decimals = 7,
  number,
} = {}){
    let returned = 0;
    const result = Number(
      Math.round(number + 'e+' + decimals)
        + 'e-' + decimals
    );

    if(globalThis.isNaN(result)){
        const eIndex = String(number).indexOf('e');
        let eString = '';
        if(eIndex >= 0){
            eString = String(number).slice(eIndex);
            number = String(number).slice(
              0,
              eIndex
            );

            const power = Number(eString.slice(2));
            if(power === decimals){
                eString = 'e-' + (power + 1);
            }
        }

        returned = Number(Number(Math.round(number + 'e+' + decimals) + 'e-' + decimals) + eString);

    }else{
        returned = result;
    }

    if(Math.abs(returned) < Number('1e-' + decimals)){
        return 0;
    }
    return returned;
}

function core_script({
  src,
  todo,
} = {}){
    const element = document.createElement('script');
    element.src = src;
    element.onload = todo;
    document.head.appendChild(element);
}

function core_sort_custom({
  array,
  clone = true,
  reverse = false,
  todo,
} = {}){
    const target_array = clone
      ? globalThis.structuredClone(array)
      : array;

    target_array.sort(todo);
    if(reverse){
        target_array.reverse();
    }

    return target_array;
}

function core_sort_numbers({
  array,
  clone,
  reverse,
} = {}){
    return core_sort_custom({
      'array': array,
      'clone': clone,
      'reverse': reverse,
      'todo': function(a, b){
          return a - b;
      },
    });
}

function core_sort_property({
  array,
  clone,
  property,
  reverse,
} = {}){
    return core_sort_custom({
      'array': array,
      'clone': clone,
      'reverse': reverse,
      'todo': function(a, b){
          if(a[property] > b[property]){
              return 1;
          }
          if(a[property] < b[property]){
              return -1;
          }
          return 0;
      },
    });
}

function core_sort_random({
  array,
  clone,
} = {}){
    return core_sort_custom({
      'array': array,
      'clone': clone,
      'todo': function(a, b){
          return core_random_boolean(.5);
      },
    });
}

function core_sort_strings({
  array,
  clone,
  reverse,
} = {}){
    return core_sort_custom({
      'array': array,
      'clone': clone,
      'reverse': reverse,
      'todo': new Intl.Collator().compare,
    });
}

function core_storage_add({
  prefix = core_repo_title + '_',
  storage,
} = {}){
    for(const key in storage){
        core_storage_info[key] = {
          'default': storage[key],
          'prefix': prefix,
        };
        const value = globalThis.localStorage.getItem(prefix + key);
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

function core_storage_element_property({
  element,
  key,
} = {}){
    if(core_type(core_storage_info[key].default) === 'boolean'){
        return 'checked';
    }
    if(core_type(element.value) === 'undefined'){
        return 'textContent';
    }
    return 'value';
}

function core_storage_reset({
  label,
  prefix,
} = {}){
    if(!globalThis.confirm('Reset ' + label + ' settings?')){
        return;
    }

    let keys = [];
    for(const key in core_storage_info){
        if(core_storage_info[key].prefix === prefix){
            keys.push(key);
        }
    }
    for(const key of keys){
        core_storage_data[key] = core_storage_info[key].default;
        globalThis.localStorage.removeItem(core_storage_info[key].prefix + key);
    }

    core_storage_update();
}

function core_storage_save({
  keys = false,
  rebind = true,
} = {}){
    if(core_type(keys) !== 'array'){
        keys = Object.keys(core_storage_data);
    }
    for(const key of keys){
        const element = core_elements[key];
        const property = core_storage_element_property({
          'element': element,
          'key': key,
        });

        if(element.validity && !element.validity.valid){
            element[property] = core_storage_data[key];
            continue;
        }

        const default_value = core_storage_info[key].default;
        const data = core_type_convert({
          'template': default_value,
          'value': element[property],
        });

        if(data !== void 0
          && data !== default_value
          && !Number.isNaN(data)
          && String(data).length){
            globalThis.localStorage.setItem(
              core_storage_info[key].prefix + key,
              data
            );
            core_storage_data[key] = data;

        }else{
            globalThis.localStorage.removeItem(core_storage_info[key].prefix + key);
            core_storage_data[key] = default_value;
            element[property] = default_value;
        }
    }

    if(rebind){
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

function core_tab_create({
  content,
  group,
  id,
  label,
  todo,
} = {}){
    const tabs_id = 'tabs_' + group;
    const tabcontents_id = 'tabcontents_' + group;

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
        'id': 'tab_' + id,
        'onclick': function(){
            core_tab_switch(this.id);
        },
        'textContent': label,
      },
      'todo': todo,
      'type': 'button',
    });
    core_html({
      'parent': document.getElementById(tabcontents_id),
      'properties': {
        'id': 'tabcontent_' + id,
        'innerHTML': content,
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

function core_type_convert({
  template,
  value,
} = {}){
    const type = core_type(template);
    if(type === 'string'){
        return String(value);
    }
    if(type === 'array'
      || type === 'object'){
        return value;
    }
    if(type === 'boolean'
      && core_type(value) !== 'boolean'){
        return value === 'true';
    }
    if(!globalThis.isNaN(Number.parseFloat(template))){
        return Number.parseFloat(value);
    }
    return value;
}

function core_ui_update({
  classname = false,
  ids = {},
  todo = 'textContent',
} = {}){
    for(const id in ids){
        const value = ids[id];
        if(core_ui_values[id] === value){
            continue;
        }

        core_ui_values[id] = value;

        if(!(id in core_elements)){
            core_elements[id] = document.getElementById(id);
        }

        const element = core_elements[id];
        if(element.type === 'checkbox'){
            element.checked = Boolean(value);

        }else if(element.tagName === 'BUTTON' || core_type(element.value) === 'undefined'){
            element[todo] = value;

        }else{
            element.value = value;
        }

        if(!classname){
            continue;
        }

        const elements = document.getElementsByClassName(id);
        for(const item of elements){
            if(item.type === 'checkbox'){
                item.checked = Boolean(value);

            }else if(item.tagName === 'BUTTON' || core_type(item.value) === 'undefined'){
                item[todo] = value;

            }else{
                item.value = value;
            }
        }
    }
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
