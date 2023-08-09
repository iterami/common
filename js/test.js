'use strict';

// Required args: consts
function test_consts(args){
    let results = '<tr class=header><td>Const<td>Value<td>Test';
    for(const id in args['consts']){
        const label = args['consts'][id];
        let result = false;
        let value = '';
        try{
            value = eval(label);
            result = value !== void 0;
        }catch{}
        results += '<tr ' + (!result ? ' style=background-color:#600' : '') + '>'
          + '<td>' + label
          + '<td>' + value
          + '<td>' + result;
    }
    return results;
}

// Required args: expect, function
function test_function(args){
    args = core_args({
      'args': args,
      'defaults': {
        'args': {},
      },
    });

    let test = false;
    let result = globalThis[args['function']](args['args']);

    if(core_type({
        'type': 'function',
        'var': args['expect'],
      })){
        test = args['expect'](result);

    }else if(core_type({
        'type': 'array',
        'var': args['expect'],
      }) || core_type({
        'type': 'object',
        'var': args['expect'],
      })){
        test = true;
        for(const item in result){
            if(args['expect'][item] === void 0
              || result[item] !== args['expect'][item]){
                test = false;
                break;
            }
        }

    }else{
        test = result === args['expect'];
    }

    return {
      'result': result,
      'test': test,
    };
}

// Required args: link, tests
function test_run(args){
    let results = '<tr class=header><td>Function<td>Args<td>Expected<td>Result<td>Test';

    for(const test in args['tests']){
        const test_args = {};
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

        results += '<tr ' + (!result['test'] ? ' style=background-color:#600' : '') + '>'
          + '<td><a href=' + args['link'] + args['tests'][test]['function'] + '.htm>' + args['tests'][test]['function'] + '()</a>'
          + '<td>' + JSON.stringify(
            args['tests'][test]['args'],
            null,
            1
          ) + '<td>' + expect
          + '<td>' + JSON.stringify(
            result['result'],
            null,
            1
          ) + '<td>' + result['test'];
    }

    return results;
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
        const time_before = new Date();
        args['function'](args['function-args']);
        const time_after = new Date();

        const diff = time_after - time_before;
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
