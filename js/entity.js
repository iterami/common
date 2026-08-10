'use strict';

function entity_attach({
  entity,
  to,
  type = 'entity_entities',
  x = 0,
  y = 0,
  z = 0,
} = {}){
    entity.attach_x = x;
    entity.attach_y = y;
    entity.attach_z = z;
    entity.attach_to = to;
    entity.attach_type = type;
}

function entity_create({
  id = entity_id_count,
  properties = {},
  types = [],
} = {}){
    const entity_id = String(id);
    const entity = {
      'id': entity_id,
    };

    for(const type of entity_types_default){
        entity_handle_defaults({
          'entity': entity,
          'id': entity_id,
          'type': type,
        });
    }

    for(const type of types){
        entity_handle_defaults({
          'entity': entity,
          'id': entity_id,
          'type': type,
        });
    }

    Object.assign(
      entity,
      properties,
    );
    entity_entities[entity_id] = entity;

    for(const type of entity_types_default){
        entity_info[type].todo?.(entity);
    }
    for(const type of types){
        entity_info[type].todo?.(entity);
    }

    entity_id_count++;
    return entity;
}

function entity_group_add({
  entities,
  group,
} = {}){
    if(!(group in entity_groups)){
        entity_group_create([group]);
    }

    const entity_group = entity_groups[group];
    for(const entity of entities){
        if(entity_group[entity]){
            return;
        }

        entity_group[entity] = true;
        entity_groups._length[group]++;
    }
}

function entity_group_create(ids){
    for(const id of ids){
        entity_groups[id] = {};
        entity_groups._length[id] = 0;
    }
}

function entity_group_modify({
  groups,
  todo,
} = {}){
    for(const group of groups){
        for(const entity in entity_groups[group]){
            todo(entity_entities[entity]);
        }
    }
}

function entity_group_move({
  entities,
  from,
  to,
} = {}){
    entity_group_remove({
      'entities': entities,
      'group': from,
    });
    entity_group_add({
      'entities': entities,
      'group': to,
    });
}

function entity_group_remove({
  delete_empty = false,
  entities,
  group,
} = {}){
    const entity_group = entity_groups[group];
    if(entity_group === void 0){
        return;
    }

    for(const entity of entities){
        if(!entity_group[entity]){
            continue;
        }

        delete entity_group[entity];
        entity_groups._length[group]--;
        if(entity_info[group]){
            entity_info[group].count--;
        }
    }

    if(delete_empty
      && entity_groups._length[group] === 0){
        delete entity_groups[group];
        delete entity_groups._length[group];
    }
}

function entity_group_remove_all({
  delete_empty,
  entities,
} = {}){
    for(const group in entity_groups){
        if(group === '_length'){
            continue;
        }

        entity_group_remove({
          'delete_empty': delete_empty,
          'entities': entities,
          'group': group,
        });
    }
}

function entity_handle_defaults({
  entity,
  id,
  type,
} = {}){
    core_object_defaults({
      'defaults': entity_info[type].default,
      'object': entity,
    });

    if(entity_groups[type][id] === void 0){
        entity_group_add({
          'entities': [id],
          'group': type,
        });

        entity_info[type].count++;
    }

    for(const group of entity_info[type].groups){
        entity_group_add({
          'entities': [id],
          'group': group,
        });
    }
}

function entity_remove({
  delete_empty = false,
  entities,
} = {}){
    entity_group_remove_all({
      'delete_empty': delete_empty,
      'entities': entities,
    });

    for(const entity of entities){
        delete entity_entities[entity];
    }
}

function entity_remove_all({
  delete_empty = false,
  group = false,
} = {}){
    const entity_group = entity_groups[group];
    for(const entity in entity_entities){
        if(group !== false
          && !entity_group[entity]){
            continue;
        }

        entity_remove({
          'delete_empty': delete_empty,
          'entities': [entity],
        });
    }
}

function entity_set({
  defaults = false,
  groups = [],
  properties = {},
  todo,
  type,
} = {}){
    if(entity_info[type]){
        return;
    }

    entity_info[type] = {
      'count': 0,
      'default': properties,
      'groups': groups,
      'todo': todo,
    };

    if(defaults){
        entity_types_default.push(type);
    }

    entity_group_create([type]);
}

globalThis.entity_entities = {};
globalThis.entity_groups = {
  '_length': {},
};
globalThis.entity_id_count = 0;
globalThis.entity_info = {};
globalThis.entity_types_default = [];
