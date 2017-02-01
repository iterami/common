'use strict';

// Optional args: chance
function random_boolean(args){
    args = args || {};
    args['chance'] = args['chance'] !== void 0
      ? args['chance']
      : random_boolean_chance;

    return Math.random() < args['chance'];
}

// Optional args: hash
function random_hex(args){
    args = args || {};
    args['hash'] = args['hash'] !== void 0
      ? ''
      : '#';

    var color = random_rgb();

    var blue = '0' + color['blue'].toString(16);
    var green = '0' + color['green'].toString(16);
    var red = '0' + color['red'].toString(16);

    return args['hash'] + red.slice(-2) + green.slice(-2) + blue.slice(-2);
}

// Optional args: max, todo
function random_integer(args){
    args = args || {};
    args['max'] = args['max'] || random_integer_max;
    args['todo'] = args['todo'] || 'floor';

    return Math[args['todo']](Math.random() * args['max']);
}

function random_rgb(){
  return {
    'blue': random_integer(),
    'green': random_integer(),
    'red': random_integer(),
  };
}

// Required args: characters, length
function random_string(args){
    var string = '';
    for(var loopCounter = 0; loopCounter < args['length']; loopCounter++){
        string += args['characters'][random_integer({
          'max': args['characters'].length,
        })];
    }
    return string;
}

var random_boolean_chance = .5;
var random_integer_max = 256;
