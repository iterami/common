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

// Required args: function
function test_time(args){
    args = core_args({
      'args': args,
      'defaults': {
        'function-args': void 0,
        'repeat': 100,
      },
    });

    let time_total = 0;
    let repeats = 0;

    while(repeats < args['repeat']){
        let time_before = new Date();
        args['function'](args['function-args']);
        let time_after = new Date();

        time_total += time_after - time_before;
        repeats += 1;
    }

    return time_total;
}
