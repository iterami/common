'use strict';

// Required args: entity, to
function entity_attach(args){
    args = core_args({
      'args': args,
      'defaults': {
        'offset-x': 0,
        'offset-y': 0,
        'offset-z': 0,
        'type': 'entity_entities',
      },
    });

    const entity = entity_entities[args['entity']];
    entity['attach-offset-x'] = args['offset-x'];
    entity['attach-offset-y'] = args['offset-y'];
    entity['attach-offset-z'] = args['offset-z'];
    entity['attach-to'] = args['to'];
    entity['attach-type'] = args['type'];
}

function entity_create(args){
    args = core_args({
      'args': args,
      'defaults': {
        'id': entity_id_count,
        'properties': {},
        'types': [],
      },
    });

    entity_id_count++;

    const entity = {};

    for(const type in entity_types_default){
        entity_handle_defaults({
          'entity': entity,
          'id': args['id'],
          'type': entity_types_default[type],
        });
    }

    for(const type in args['types']){
        entity_handle_defaults({
          'entity': entity,
          'id': args['id'],
          'type': args['types'][type],
        });
    }

    for(const property in args['properties']){
        entity[property] = core_handle_defaults({
          'default': entity[property],
          'var': args['properties'][property],
        });
    }

    entity_entities[args['id']] = entity;

    for(const type in entity_types_default){
        entity_info[entity_types_default[type]]['todo'](args['id']);
    }
    for(const type in args['types']){
        entity_info[args['types'][type]]['todo'](args['id']);
    }

    return args['id'];
}

// Required args: entities, group
function entity_group_add(args){
    if(!(args['group'] in entity_groups)){
        entity_group_create({
          'id': args['group'],
        });
    }

    for(const entity in args['entities']){
        if(entity_groups[args['group']][args['entities'][entity]]){
            return;
        }

        entity_groups[args['group']][args['entities'][entity]] = true;

        entity_groups['_length'][args['group']]++;
    }
}

// Required args: ids
function entity_group_create(args){
    for(const id in args['ids']){
        entity_groups[args['ids'][id]] = {};
        entity_groups['_length'][args['ids'][id]] = 0;
    }
}

// Required args: groups, todo
function entity_group_modify(args){
    args = core_args({
      'args': args,
      'defaults': {
        'pretodo': false,
      },
    });

    const pretodo = {};
    if(args['pretodo'] !== false){
        pretodo = args['pretodo']();
    }
    for(const group in args['groups']){
        for(const entity in entity_groups[args['groups'][group]]){
            args['todo'](
              entity,
              pretodo
            );
        }
    }
}

// Required args: entities, from, to
function entity_group_move(args){
    entity_group_remove({
      'entities': args['entities'],
      'group': args['from'],
    });
    entity_group_add({
      'entities': args['entities'],
      'group': args['to'],
    });
}

// Required args: entities, group
function entity_group_remove(args){
    args = core_args({
      'args': args,
      'defaults': {
        'delete-empty': false,
      },
    });

    if(entity_groups[args['group']] === void 0){
        return;
    }

    for(const entity in args['entities']){
        if(!entity_groups[args['group']][args['entities'][entity]]){
            continue;
        }

        Reflect.deleteProperty(
          entity_groups[args['group']],
          args['entities'][entity]
        );

        entity_groups['_length'][args['group']]--;
        if(entity_info[args['group']]){
            entity_info[args['group']]['count']--;
        }
    }

    if(args['delete-empty']
      && entity_groups['_length'][args['group']] === 0){
        Reflect.deleteProperty(
          entity_groups,
          args['group']
        );
        Reflect.deleteProperty(
          entity_groups['_length'],
          args['group']
        );
    }
}

// Required args: entities
function entity_group_remove_all(args){
    args = core_args({
      'args': args,
      'defaults': {
        'delete-empty': false,
      },
    });

    for(const group in entity_groups){
        if(group === '_length'){
            continue;
        }

        entity_group_remove({
          'delete-empty': args['delete-empty'],
          'entities': args['entities'],
          'group': group,
        });
    }
}

// Required args: id, type
function entity_handle_defaults(args){
    for(const property in entity_info[args['type']]['default']){
        args['entity'][property] = core_handle_defaults({
          'default': args['entity'][property],
          'var': entity_info[args['type']]['default'][property],
        });
    }

    if(entity_groups[args['type']][args['id']] === void 0){
        entity_group_add({
          'entities': [
            args['id'],
          ],
          'group': args['type'],
        });

        entity_info[args['type']]['count']++;
    }

    for(const group in entity_info[args['type']]['groups']){
        entity_group_add({
          'entities': [
            args['id'],
          ],
          'group': entity_info[args['type']]['groups'][group],
        });
    }
}

// Required args: entities
function entity_remove(args){
    args = core_args({
      'args': args,
      'defaults': {
        'delete-empty': false,
      },
    });

    entity_group_remove_all({
      'delete-empty': args['delete-empty'],
      'entities': args['entities'],
    });

    for(const entity in args['entities']){
        Reflect.deleteProperty(
          entity_entities,
          args['entities'][entity]
        );
    }
}

function entity_remove_all(args){
    args = core_args({
      'args': args,
      'defaults': {
        'delete-empty': false,
        'group': false,
      },
    });

    for(const entity in entity_entities){
        if(args['group'] !== false
          && !entity_groups[args['group']][entity]){
            continue;
        }

        entity_remove({
          'delete-empty': args['delete-empty'],
          'entities': [
            entity,
          ],
        });
    }
}

// Required args: type
function entity_set(args){
    args = core_args({
      'args': args,
      'defaults': {
        'default': false,
        'groups': [],
        'properties': {},
        'todo': function(){},
      },
    });

    entity_info[args['type']] = {
      'count': 0,
      'default': args['properties'],
      'groups': args['groups'],
      'todo': args['todo'],
    };

    if(args['default']){
        entity_types_default.push(args['type']);
    }

    entity_group_create({
      'ids': [
        args['type'],
      ],
    });
}

window.entity_entities = {};
window.entity_groups = {
  '_length': {},
};
window.entity_id_count = 0;
window.entity_info = {};
window.entity_types_default = [];
