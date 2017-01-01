'use strict';

// Optional args: chance
function random_boolean(args){
    args = args || {};
    args['chance'] = args['chance'] !== void 0
      ? args['chance']
      : .5;

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

// Required args: max
// Optional args: todo
function random_integer(args){
    args['todo'] = args['todo'] || 'floor';

    return Math[args['todo']](Math.random() * args['max']);
}

function random_rgb(){
  return {
    'blue': random_integer({
      'max': 256,
    }),
    'green': random_integer({
      'max': 256,
    }),
    'red': random_integer({
      'max': 256,
    }),
  };
}

// Required args: characters, length
function random_string(args){
    var characters_length = args['characters'].length - 1;
    var string = '';
    for(var loopCounter = 0; loopCounter < args['length']; loopCounter++){
        string += args['characters'][random_integer({
          'max': characters_length,
        })];
    }
    return string;
}
