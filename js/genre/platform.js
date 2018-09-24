'use strict';

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

    core_audio_start({
      'id': 'boop',
    });
}

function platform_init(){
}

function platform_jump(args){
    args = core_args({
      'args': args,
      'defaults': {
        'id': 'player',
        'velocity': 1,
      },
    });

    platform_players['player']['y-velocity'] = args['velocity'];
}

function platform_player_reset(args){
    args = core_args({
      'args': args,
      'defaults': {
        'all': false,
        'id': 'player',
      },
    });

    if(args['all']){
        platform_players[args['id']] = {};
    }

    platform_players[args['id']] = core_handle_defaults({
      'default': {
        'can-jump': false,
        'coins': 0,
        'done': false,
        'lives': 1,
        'x': 0,
        'y': 0,
        'y-velocity': 0,
      },
      'var': platform_players[args['id']],
    });
}

window.platform_players = {};
window.platform_score_goal = 1;
