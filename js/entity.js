'use strict';

// Required args: entity, to
function entity_attach(args){
    args = core_args({
      'args': args,
      'defaults': {
        'type': 'entity_entities',
        'x': 0,
        'y': 0,
        'z': 0,
      },
    });

    args.entity.attach_x = args.x;
    args.entity.attach_y = args.y;
    args.entity.attach_z = args.z;
    args.entity.attach_to = args.to;
    args.entity.attach_type = args.type;
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
    const entity = {
      'id': args.id,
    };

    for(const type of entity_types_default){
        entity_handle_defaults({
          'entity': entity,
          'id': args.id,
          'type': type,
        });
    }

    for(const type of args.types){
        entity_handle_defaults({
          'entity': entity,
          'id': args.id,
          'type': type,
        });
    }

    Object.assign(
      entity,
      args.properties,
    );

    entity_entities[args.id] = entity;

    for(const type of entity_types_default){
        entity_info[type].todo?.(entity);
    }
    for(const type of args.types){
        entity_info[type].todo?.(entity);
    }

    return entity;
}

// Required args: entities, group
function entity_group_add(args){
    if(!(args.group in entity_groups)){
        entity_group_create([
          args.group,
        ]);
    }

    for(const entity of args.entities){
        if(entity_groups[args.group][entity]){
            return;
        }

        entity_groups[args.group][entity] = true;

        entity_groups._length[args.group]++;
    }
}

function entity_group_create(ids){
    for(const id of ids){
        entity_groups[id] = {};
        entity_groups._length[id] = 0;
    }
}

// Required args: groups, todo
function entity_group_modify(args){
    for(const group of args.groups){
        for(const entity in entity_groups[group]){
            args.todo(entity_entities[entity]);
        }
    }
}

// Required args: entities, from, to
function entity_group_move(args){
    entity_group_remove({
      'entities': args.entities,
      'group': args.from,
    });
    entity_group_add({
      'entities': args.entities,
      'group': args.to,
    });
}

// Required args: entities, group
function entity_group_remove(args){
    args = core_args({
      'args': args,
      'defaults': {
        'delete_empty': false,
      },
    });

    if(entity_groups[args.group] === void 0){
        return;
    }

    for(const entity of args.entities){
        if(!entity_groups[args.group][entity]){
            continue;
        }

        delete entity_groups[args.group][entity];
        entity_groups._length[args.group]--;
        if(entity_info[args.group]){
            entity_info[args.group].count--;
        }
    }

    if(args.delete_empty
      && entity_groups._length[args.group] === 0){
        delete entity_groups[args.group];
        delete entity_groups._length[args.group];
    }
}

// Required args: entities
function entity_group_remove_all(args){
    args = core_args({
      'args': args,
      'defaults': {
        'delete_empty': false,
      },
    });

    for(const group in entity_groups){
        if(group === '_length'){
            continue;
        }

        entity_group_remove({
          'delete_empty': args.delete_empty,
          'entities': args.entities,
          'group': group,
        });
    }
}

// Required args: id, type
function entity_handle_defaults(args){
    args.entity = core_args({
      'args': args.entity,
      'defaults': entity_info[args.type].default,
    });

    if(entity_groups[args.type][args.id] === void 0){
        entity_group_add({
          'entities': [
            args.id,
          ],
          'group': args.type,
        });

        entity_info[args.type].count++;
    }

    for(const group of entity_info[args.type].groups){
        entity_group_add({
          'entities': [
            args.id,
          ],
          'group': group,
        });
    }
}

// Required args: entities
function entity_remove(args){
    args = core_args({
      'args': args,
      'defaults': {
        'delete_empty': false,
      },
    });

    entity_group_remove_all({
      'delete_empty': args.delete_empty,
      'entities': args.entities,
    });

    for(const entity of args.entities){
        delete entity_entities[entity];
    }
}

function entity_remove_all(args){
    args = core_args({
      'args': args,
      'defaults': {
        'delete_empty': false,
        'group': false,
      },
    });

    for(const entity in entity_entities){
        if(args.group !== false
          && !entity_groups[args.group][entity]){
            continue;
        }

        entity_remove({
          'delete_empty': args.delete_empty,
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
      },
    });

    if(entity_info[args.type]){
        return;
    }

    entity_info[args.type] = {
      'count': 0,
      'default': args.properties,
      'groups': args.groups,
      'todo': args.todo,
    };

    if(args.default){
        entity_types_default.push(args.type);
    }

    entity_group_create([
      args.type,
    ]);
}

globalThis.entity_entities = {};
globalThis.entity_groups = {
  '_length': {},
};
globalThis.entity_id_count = 0;
globalThis.entity_info = {};
globalThis.entity_types_default = [];
