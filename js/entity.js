'use strict';

// Required args: id, newid
// Optional args: todo
function entity_clone(args){
    args['todo'] = args['todo'] || function(){};

    entity_create({
      'id': args['newid'],
      'properties': entity_entities[args['id']],
    });

    args['todo'](args['newid']);
}

// Reqruied args: id
// Optional args: types, properties
function entity_create(args){
    args['properties'] = args['properties'] || {};
    args['types'] = args['types'] || entity_types_default;

    var entity = {};

    for(var type in args['types']){
        for(var property in entity_info[args['types'][type]]['default']){
            entity[property] = entity_info[args['types'][type]]['default'][property];
        }
    }

    for(property in args['properties']){
        entity[property] = args['properties'][property];
    }

    entity_entities[args['id']] = entity;

    for(var type in args['types']){
        entity_info[args['types'][type]]['todo'](args['id']);
    }
}

// Required args: entities, group
function entity_group_add(args){
    if(!(args['group'] in entity_groups)){
        entity_groups[args['group']] = {};
    }

    for(var entity in args['entities']){
        entity_groups[args['group']][args['entities'][entity]] = true;
    }
}

// Required args: groups, todo
// Optional args: pretodo
function entity_group_modify(args){
    args['pretodo'] = args['pretodo'] || false;
    var pretodo = {};

    if(args['pretodo'] !== false){
        pretodo = args['pretodo']();
    }

    for(var group in args['groups']){
        for(var entity in entity_groups[args['groups'][group]]){
            args['todo'](
              entity,
              pretodo
            );
        }
    }
}

// Required args: entities, group
// Optional args: delete-empty
function entity_group_remove(args){
    args['delete-empty'] = args['delete-empty'] || false;

    if(args['group'] in entity_groups){
        for(var entity in args['entities']){
            delete entity_groups[args['group']][args['entities'][entity]];
        }
    }

    if(args['delete-empty']
      && entity_groups[args['group']].length === 0){
        delete entity_groups[args['group']];
    }
}

// Required args: type
// Optional args: properties, todo
function entity_set(args){
    args['properpties'] = args['properties'] || {};
    args['todo'] = args['todo'] || function(){};

    entity_info[args['type']] = {
      'default': args['properties'],
      'todo': args['todo'],
    };
}

var entity_entities = {};
var entity_groups = {};
var entity_info = {};
var entity_types_default = [];
