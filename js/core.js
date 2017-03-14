'use strict';

// Required args: args, defaults
function core_args(args){
    if(args['args'] === void 0){
        args['args'] = {};
    }

    for(var arg in args['defaults']){
        if(args[arg] === void 0){
            args[arg] = args['defaults'][arg];
        }
    }

    return args['args'];
}

// Required args: args, function
function core_call(args){
    if(core_type({
      'var': window[args['function']],
    })){
        window[args['function']](args['args']);
    }
}

// Required args: var
// Optional args: type
function core_type(args){
    args = core_args({
      'args': {
        'type': args['type'],
        'var': args['var'],
      },
      'defaults': {
        'type': 'function',
      },
    });

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
        uid += parseInt(
          Math.random() * 1e17,
          10
        ).toString(34);
    }

    return uid;
}

var core_uids = {};
