'use strict';

// Optional args: chance
function random_boolean(args){
    args = core_args({
      'args': args,
      'defaults': {
        'chance': random_boolean_chance,
      },
    });

    return Math.random() < args['chance'];
}

function random_hex(){
    var color = random_rgb();

    var blue = '0' + color['blue'].toString(16);
    var green = '0' + color['green'].toString(16);
    var red = '0' + color['red'].toString(16);

    return red.slice(-2) + green.slice(-2) + blue.slice(-2);
}

// Optional args: max, todo
function random_integer(args){
    args = core_args({
      'args': args,
      'defaults': {
        'max': random_integer_max,
        'todo': 'floor',
      },
    });

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

// Optional args: characters, length
function random_string(args){
    args = core_args({
      'args': args,
      'defaults': {
        'characters': random_string_characters,
        'length': random_string_length,
      },
    });

    var string = '';
    for(var loopCounter = 0; loopCounter < args['length']; loopCounter++){
        string += args['characters'][random_integer({
          'max': args['characters'].length,
        })];
    }
    return string;
}

var random_boolean_chance = .5;
var random_integer_max = 100;
var random_string_characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
var random_string_length = 100;
