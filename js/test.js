'use strict';

// Required args: consts
function test_consts(args){
    let results = '<tr class=header><td>Const<td>Value<td>Test';
    for(const id in args['consts']){
        const label = args['consts'][id];
        const value = globalThis.eval(label);
        const result = value !== void 0;
        results += '<tr ' + (!result ? ' style=background-color:#600' : '') + '>'
          + '<td>' + label
          + '<td>' + value
          + '<td>' + result;
    }
    return results;
}

// Required args: args, expect, function
function test_function(args){
    let test = false;
    const result = globalThis[args['function']](args['args']);
    const type = core_type(args['expect']);

    if(type === 'function'){
        test = args['expect'](result);

    }else if(type === 'array'
      || type === 'object'){
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
        const args_type = core_type(args['tests'][test]['args']);
        let args_json = '';
        if(args_type === 'object'){
            test_args['args'] = {...args['tests'][test]['args']};
            const args_object = {};
            for(const arg in test_args['args']){
                if(core_type(test_args['args'][arg]) === 'function'){
                    args_object[arg] = core_replace_multiple({
                      'patterns': {
                        '\n': '<br>',
                      },
                      'string': test_trim(test_args['args'][arg].toString()),
                    });
                    continue;
                }
                args_object[arg] = test_args['args'][arg];
            }
            args_json = JSON.stringify(
              args_object,
              void 0,
              2
            );

        }else if(args_type === 'function'){
            args_json = test_trim(test_args['args'].toString());

        }else{
            test_args['args'] = args['tests'][test]['args'];
            args_json = JSON.stringify(
              test_args['args'],
              void 0,
              2
            );
        }
        const result = test_function(test_args);
        const expect = core_type(args['tests'][test]['expect']) === 'function'
          ? test_trim(args['tests'][test]['expect'].toString())
          : JSON.stringify(
            args['tests'][test]['expect'],
            void 0,
            2
          );
        const result_json = JSON.stringify(
          result['result'],
          void 0,
          2
        );

        results += '<tr ' + (!result['test'] ? ' style=background-color:#600' : '') + '>'
          + '<td><a href=' + args['link'] + args['tests'][test]['function'] + '.htm>' + args['tests'][test]['function'] + '()</a>'
          + '<td><pre>' + args_json
          + '</pre><td><pre>' + expect
          + '</pre><td><pre>' + result_json
          + '</pre><td>' + result['test'];
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
        const time_before = globalThis.performance.now();
        args['function'](args['function-args']);
        const time_after = globalThis.performance.now();

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

function test_trim(string){
    const split = string.split('\n');
    let trimmed = split[0];
    for(let i = 1; i < split.length; i++){
        trimmed += '\n' + split[i].slice(10);
    }
    return trimmed;
}
