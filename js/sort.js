'use strict';

// Required args: array
function sort_random(args){
    args['array'].sort(function(a, b){
        return Math.random() > .5
          ? 1
          : -1;
    });
}

// Required args: array, property
function sort_property(args){
    args['array'].sort(function(a, b){
        if(a[args['property']] > b[args['property']]){
            return -1;
        }
        if(a[args['property']] < b[args['property']]){
            return 1;
        }
        return 0;
    });
}
