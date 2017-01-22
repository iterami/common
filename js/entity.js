'use strict';

// Reqruied args: id, type
// Optional args: properties
function entity_create(args){
    args['properties'] = args['properties'] || {};

    var entity = {};

    for(var property in entity_info[args['type']]['default']){
        entity[property] =  entity_info[args['type']]['default'][property];
    }

    for(property in args['properties']){
        entity[property] =  args['properties'][property];
    }

    entity_entities[args['id']] = entity;
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
function entity_group_modify(args){
    for(var group in args['groups']){
        for(var entity in entity_groups[args['groups'][group]]){
            args['todo'](entity);
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
// Optional args: properties
function entity_set(args){
    args['properpties'] = args['properties'] || {};

    entity_info[args['type']] = {
      'default': args['properties'],
    };
}

var entity_info = {};
var entity_entities = {};
var entity_groups = {};
