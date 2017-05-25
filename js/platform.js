'use strict';

function platform_init(){
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
        'coins': 0,
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
