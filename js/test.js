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

// Required args: link, tests
function test_run(args){
    let results = '';

    for(let test in args['tests']){
        let test_args = {};
        Object.assign(
          test_args,
          args['tests'][test]
        );
        test_args['args'] = {};
        Object.assign(
          test_args['args'],
          args['tests'][test]['args']
        );
        const result = test_function(test_args);
        const expect = core_type({
          'var': args['tests'][test]['expect'],
        })
          ? args['tests'][test]['expect'].toString()
          : JSON.stringify(
            args['tests'][test]['expect'],
            void 0,
            1
          );

        results += '<tr ' + (!result['test'] ? ' style=background:#600' : '') + '>'
          + '<td><a href=' + args['link'] + args['tests'][test]['function'] + '>' + args['tests'][test]['function'] + '()</a>'
          + '<td>' + JSON.stringify(
            args['tests'][test]['args'],
            null,
            1
          ) + '<td>' + expect
          + '<td>' + JSON.stringify(
            result['returned'],
            null,
            1
          ) + '<td>' + result['test'];
    }

    document.getElementById('results').innerHTML = results;
}

// Required args: function
function test_time(args){
    args = core_args({
      'args': args,
      'defaults': {
        'function-args': void 0,
        'runs': 100,
      },
    });

    let runs_done = 0;
    let time_max = 0;
    let time_min = 0;
    let time_total = 0;

    while(runs_done < args['runs']){
        let time_before = new Date();
        args['function'](args['function-args']);
        let time_after = new Date();

        let diff = time_after - time_before;
        if(diff < time_min
          || time_min === 0){
            time_min = diff;
        }
        if(diff > time_max){
            time_max = diff;
        }

        time_total += diff;
        runs_done += 1;
    }

    return {
      'average': time_total / args['runs'],
      'max': time_max,
      'min': time_min,
      'runs': args['runs'],
      'total': time_total,
    };
}
