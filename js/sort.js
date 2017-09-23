'use strict';

// Required args: array, todo
// Optional args: reverse
function sort_custom(args){
    args = core_args({
      'args': args,
      'defaults': {
        'reverse': false,
      },
    });

    args['array'].sort(args['todo']);
    if(args['reverse']){
        args['array'].reverse();
    }
}

// Required args: array
// Optional args: reverse
function sort_numbers(args){
    sort_custom({
      'array': args['array'],
      'reverse': args['reverse'],
      'todo': function(a, b){
          return a - b;
      },
    });
}

// Required args: array
function sort_random(args){
    sort_custom({
      'array': args['array'],
      'todo': function(a, b){
          return Math.random() - 0.5;
      },
    });
}

// Required args: array, property
// Optional args: reverse
function sort_property(args){
    sort_custom({
      'array': args['array'],
      'reverse': args['reverse'],
      'todo': function(a, b){
          if(a[args['property']] > b[args['property']]){
              return 1;

          }else if(a[args['property']] < b[args['property']]){
              return -1;
          }

          return 0;
      },
    });
}

// Required args, array
// Optional args: reverse
function sort_strings(args){
    sort_custom({
      'array': args['array'],
      'reverse': args['reverse'],
      'todo': function(a, b){
          return a.localeCompare(b);
      },
    });
}
