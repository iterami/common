'use strict';

// Optional args: id
function platform_coin_collide(args){
    args = core_args({
      'args': args,
      'defaults': {
        'id': 'player',
      },
    });

    platform_players[args['id']]['coins'] += 1;
    if(platform_players[args['id']]['coins'] >= platform_score_goal){
        platform_players[args['id']]['done'] = true;
    }
}

function platform_init(){
}

// Optional args: id, velocity
function platform_jump(args){
    args = core_args({
      'args': args,
      'defaults': {
        'id': 'player',
        'velocity': 1,
      },
    });

    platform_players['player']['y-velocity'] = args['velocity'];;
}

// Required args: player
// Optional args: all
function platform_player_reset(args){
    args = core_args({
      'args': args,
      'defaults': {
        'all': false,
      },
    });

    if(args['all']){
        platform_players[args['player']] = {};
    }

    platform_players[args['player']] = core_handle_defaults({
      'default': {
        'can-jump': false,
        'coins': 0,
        'done': false,
        'lives': 1,
        'x': 0,
        'y': 0,
        'y-velocity': 0,
      },
      'var': platform_players[args['player']],
    });
}

var platform_players = {};
var platform_score_goal = 1;
