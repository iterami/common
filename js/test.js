'use strict';

// Required args: expect, function
function test_function(args){
    args = core_args({
      'args': args,
      'defaults': {
        'args': {},
      },
    });

    let test = false;
    let returned = window[args['function']](args['args']);

    if(core_type({
        'type': 'function',
        'var': args['expect'],
      })){
        test = args['expect'](returned);

    }else if(core_type({
        'type': 'array',
        'var': args['expect'],
      }) || core_type({
        'type': 'object',
        'var': args['expect'],
      })){
        test = true;
        for(let item in returned){
            if(args['expect'][item] === void 0
              || returned[item] !== args['expect'][item]){
                test = false;
                break;
            }
        }

    }else{
        test = returned === args['expect'];
    }

    return {
      'returned': returned,
      'test': test,
    };
}

function test_time(){
}
