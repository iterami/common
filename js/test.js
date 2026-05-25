'use strict';

function test_consts({
  consts,
} = {}){
    let passed = 0;
    let table = '';
    let total = 0;

    for(const id in consts){
        total++;

        const label = consts[id];
        let result = false;
        let value = '';
        try{
            value = eval(label);
            result = value !== void 0;
        }catch{}
        table += '<tr ' + (!result ? ' class=failed' : '') + '>'
          + '<td>' + label
          + '<td>' + (value || 'undefined');

        if(result){
            passed++;
        }
    }

    return '<tr class=header><td>Constants ' + passed + '/' + total + '<td>Value' + table;
}

function test_function({
  args,
  expect,
  todo,
} = {}){
    let test = false;
    const returned = globalThis[todo]
      ? globalThis[todo](args)
      : 'undefined function';
    const type = core_type(expect);

    if(type === 'function'){
        test = expect(returned);

    }else if(type === 'array'
      || type === 'object'){
        test = true;
        for(const item in returned){
            if(expect[item] === void 0
              || returned[item] !== expect[item]){
                test = false;
                break;
            }
        }

    }else{
        test = returned === expect;
    }

    return {
      'returned': returned,
      'test': test,
    };
}

function test_run({
  link,
  tests,
} = {}){
    let passed = 0;
    let table = '';
    let total = 0;

    for(const test of tests){
        total++;

        const test_args = {};
        Object.assign(
          test_args,
          test
        );
        const args_type = core_type(test.args);
        let args_json = '';
        if(args_type === 'object'){
            test_args.args = {...test.args};
            const args_object = {};
            for(const arg in test_args.args){
                if(core_type(test_args.args[arg]) === 'function'){
                    args_object[arg] = core_replace({
                      'patterns': {
                        '\n': '<br>',
                      },
                      'string': test_trim(test_args.args[arg].toString()),
                    });
                    continue;
                }
                args_object[arg] = test_args.args[arg];
            }
            args_json = JSON.stringify(
              args_object,
              void 0,
              2
            );

        }else if(args_type === 'function'){
            args_json = test_trim(test_args.args.toString());

        }else{
            test_args.args = test.args;
            args_json = JSON.stringify(
              test_args.args,
              void 0,
              2
            );
        }
        const result = test_function(test_args);
        const expect = core_type(test.expect) === 'function'
          ? test_trim(test.expect.toString())
          : JSON.stringify(
            test.expect,
            void 0,
            2
          );
        const returned_json = JSON.stringify(
          result.returned,
          void 0,
          2
        );

        table += '<tr ' + (!result.test ? ' class=failed' : '') + '>'
          + '<td><a href=' + link + test.todo + '.htm target=_blank>' + test.todo + '()</a>: ' + result.test
          + '<br><textarea readonly>' + args_json
          + '</textarea><td><pre>' + returned_json
          + '</pre><td><pre>' + expect
          + '</pre>';

        if(result.test){
            passed++;
        }
    }

    return '<tr class=header><td>Functions ' + passed + '/' + total + '<td>Returned<td>Expected' + table;
}

function test_time({
  args = void 0,
  runs = 100,
  todo,
} = {}){
    let runs_done = 0;
    let time_max = 0;
    let time_min = 0;
    let time_total = 0;

    while(runs_done < runs){
        const time_before = globalThis.performance.now();
        todo(args);
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
      'average': time_total / runs,
      'max': time_max,
      'min': time_min,
      'runs': runs,
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
