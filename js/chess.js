'use strict';

// Required args: id, column, loopend, loopstart
function chess_check_column(args){
    if(args['loopstart'] > args['loopend']){
        const temp = args['loopstart'];
        args['loopstart'] = args['loopend'];
        args['loopend'] = temp;
    }

    for(let i = args['loopstart'] + 1; i < args['loopend']; i++){
        if(chess_games[args['id']]['board'][i][args['column']].length === 1){
            return true;
        }
    }
    return false;
}

// Required args: id, column, dx, dy, loopstart, loopend, row
function chess_check_diagonal(args){
    if(args['loopstart'] > args['loopend']){
        const temp = args['loopstart'];
        args['loopstart'] = args['loopend'];
        args['loopend'] = temp;
    }

    let x = args['column'];
    let y = args['row'];

    for(let i = args['loopstart'] + 1; i < args['loopend']; i++){
        x += args['dx'];
        y += args['dy'];

        if(chess_games[args['id']]['board'][y][x].length === 1){
            return true;
        }
    }

    return false;
}

// Required args: id, loopend, loopstart, row
function chess_check_row(args){
    if(args['loopstart'] > args['loopend']){
        const temp = args['loopstart'];
        args['loopstart'] = args['loopend'];
        args['loopend'] = temp;
    }

    for(let i = args['loopstart'] + 1; i < args['loopend']; i++){
        if(chess_games[args['id']]['board'][args['row']][i].length === 1){
            return true;
        }
    }
    return false;
}

// Required args: id, piece-x, piece-y, target-x, target-y
function chess_move(args){
    if(!chess_games[args['id']]){
        return false;
    }

    const player = chess_games[args['id']]['player'];
    const validation = chess_validate({
      'id': args['id'],
      'piece-x': args['piece-x'],
      'piece-y': args['piece-y'],
      'player': player,
      'target-x': args['target-x'],
      'target-y': args['target-y'],
      'threat': false,
    });
    if(validation['valid']){
        chess_games[args['id']]['en-passant'] = validation['en-passant'];
        let piece = chess_games[args['id']]['board'][args['piece-y']][args['piece-x']];

        chess_games[args['id']]['board'][args['piece-y']][args['piece-x']] = '';
        let taken_piece = chess_games[args['id']]['board'][args['target-y']][args['target-x']];
        if(validation['castling']){
            if(validation['rook-long-moved']){
                chess_games[args['id']]['board'][args['piece-y']][0] = '';
                chess_games[args['id']]['board'][args['piece-y']][3] = chess_pieces[player][3];

            }else if(validation['rook-short-moved']){
                chess_games[args['id']]['board'][args['piece-y']][7] = '';
                chess_games[args['id']]['board'][args['piece-y']][5] = chess_pieces[player][3];
            }

        }else if(validation['en-passant-taken']){
            taken_piece = chess_games[args['id']]['board'][args['piece-y']][args['target-x']];
            chess_games[args['id']]['board'][args['piece-y']][args['target-x']] = '';

        }else if(validation['pawn-promote']){
            piece = chess_pieces[player][chess_games[args['id']]['players'][player]['pawn-promote']];
        }

        chess_games[args['id']]['players'][player]['king-checked'] = validation['king-checked'];
        chess_games[args['id']]['players'][player]['king-moved'] = validation['king-moved'];
        chess_games[args['id']]['players'][player]['king-x'] = validation['king-x'];
        chess_games[args['id']]['players'][player]['king-y'] = validation['king-y'];
        chess_games[args['id']]['players'][player]['pieces-taken'] += taken_piece;
        chess_games[args['id']]['players'][player]['rook-long-moved'] = validation['rook-long-moved'];
        chess_games[args['id']]['players'][player]['rook-short-moved'] = validation['rook-short-moved'];
        chess_games[args['id']]['board'][args['target-y']][args['target-x']] = piece;
        chess_games[args['id']]['player'] = 1 - player;
    }
    return validation;
}

// Required args: id
function chess_new(args){
    chess_games[args['id']] = {
      'board': [
        [chess_pieces[1][3], chess_pieces[1][1], chess_pieces[1][2], chess_pieces[1][4], chess_pieces[1][5], chess_pieces[1][2], chess_pieces[1][1], chess_pieces[1][3],],
        [chess_pieces[1][0], chess_pieces[1][0], chess_pieces[1][0], chess_pieces[1][0], chess_pieces[1][0], chess_pieces[1][0], chess_pieces[1][0], chess_pieces[1][0],],
        ['', '', '', '', '', '', '', '',],
        ['', '', '', '', '', '', '', '',],
        ['', '', '', '', '', '', '', '',],
        ['', '', '', '', '', '', '', '',],
        [chess_pieces[0][0], chess_pieces[0][0], chess_pieces[0][0], chess_pieces[0][0], chess_pieces[0][0], chess_pieces[0][0], chess_pieces[0][0], chess_pieces[0][0],],
        [chess_pieces[0][3], chess_pieces[0][1], chess_pieces[0][2], chess_pieces[0][4], chess_pieces[0][5], chess_pieces[0][2], chess_pieces[0][1], chess_pieces[0][3],],
      ],
      'en-passant': -1,
      'en-passant-taken': false,
      'player': 0,
      'players': [
        {
          'king-checked': false,
          'king-moved': false,
          'king-x': 4,
          'king-y': 7,
          'pawn-promote': 4,
          'pieces-taken': '',
          'rook-long-moved': false,
          'rook-short-moved': false,
        },
        {
          'king-checked': false,
          'king-moved': false,
          'king-x': 4,
          'king-y': 0,
          'pawn-promote': 4,
          'pieces-taken': '',
          'rook-long-moved': false,
          'rook-short-moved': false,
        },
      ],
    };
}

// Required args: id, piece-x, piece-y, player
function chess_threat(args){
    for(let y = 0; y < 8; y++){
        for(let x = 0; x < 8; x++){
            const piece = chess_games[args['id']]['board'][y][x];
            if(chess_pieces[args['player']].includes(piece)){
                if(chess_validate({
                    'id': args['id'],
                    'piece-x': x,
                    'piece-y': y,
                    'player': args['player'],
                    'target-x': args['piece-x'],
                    'target-y': args['piece-y'],
                    'threat': true,
                  })['valid']){
                    return true;
                }
            }
        }
    }

    return false;
}

// Required args: id, piece-x, piece-y, player, target-x, target-y
// Optional args: threat
function chess_validate(args){
    let castling = false;
    let en_passant = -1;
    let en_passant_taken = false;
    let king_checked = false;
    let king_moved = false;
    let king_x = -1;
    let king_y = -1;
    let rook_long_moved = false;
    let rook_short_moved = false;
    let pawn_promote = false;
    let valid_move = true;

    if(!chess_games[args['id']]
      || args['piece-x'] < 0 || args['piece-x'] > 7
      || args['piece-y'] < 0 || args['piece-y'] > 7
      || args['target-x'] < 0 || args['target-x'] > 7
      || args['target-y'] < 0 || args['target-y'] > 7){
        valid_move = false;

    }else{
        const player = args['player'];
        king_moved = chess_games[args['id']]['players'][player]['king-moved'];
        king_x = chess_games[args['id']]['players'][player]['king-x'];
        king_y = chess_games[args['id']]['players'][player]['king-y'];
        rook_long_moved = chess_games[args['id']]['players'][player]['rook-long-moved'];
        rook_short_moved = chess_games[args['id']]['players'][player]['rook-short-moved'];

        const piece = chess_games[args['id']]['board'][args['piece-y']][args['piece-x']];
        if(piece.length === 0 || (args['threat'] !== true && !chess_pieces[player].includes(piece))){
            valid_move = false;

        }else{
            const target_piece = chess_games[args['id']]['board'][args['target-y']][args['target-x']];
            if(args['threat'] !== true && chess_pieces[player].includes(target_piece)){
                valid_move = false;

            }else{
                const movement_x = Math.abs(args['piece-x'] - args['target-x']);
                const movement_y = Math.abs(args['piece-y'] - args['target-y']);
                switch(piece){
                    // Pawn
                    case chess_pieces[player][0]: {
                        const direction = player === 0 ? -1 : 1;

                        if(args['target-x'] !== args['piece-x']){
                            if(movement_x !== 1
                              || args['target-y'] - args['piece-y'] !== direction){
                                valid_move = false;

                            }else if(args['target-x'] === chess_games[args['id']]['en-passant'] - 1
                              && args['target-y'] === 2 + (player * 3)){
                                en_passant_taken = true;

                            }else if(!chess_pieces[1 - player].includes(target_piece)){
                                valid_move = false;
                            }

                        }else if(target_piece.length === 0){
                            if(args['piece-y'] === 6 - (player * 5)){
                                if(args['target-y'] !== args['piece-y'] + direction
                                  && args['target-y'] !== args['piece-y'] + direction * 2){
                                    valid_move = false;

                                }else if(chess_games[args['id']]['board'][args['piece-y'] + direction][args['piece-x']].length){
                                    valid_move = false;

                                }else if(args['target-y'] === args['piece-y'] + direction * 2){
                                    en_passant = args['piece-x'] + 1;
                                }

                            }else if(args['target-y'] !== args['piece-y'] + direction){
                                valid_move = false;
                            }

                        }else{
                            valid_move = false;
                        }

                        if(valid_move && args['target-y'] === player * 7){
                            pawn_promote = true;
                        }

                        break;
                    }

                    // Knight
                    case chess_pieces[player][1]: {
                        if(movement_x < 1 || movement_x > 2 || movement_y < 1 || movement_y > 2){
                            valid_move = false;

                        }else if((movement_x === 1 && movement_y !== 2)
                          || (movement_x === 2 && movement_y !== 1)){
                            valid_move = false;
                        }

                        break;
                    }

                    // Bishop
                    case chess_pieces[player][2]: {
                        if(movement_x === movement_y){
                            if(movement_y > 1 && chess_check_diagonal({
                                'column': args['piece-x'],
                                'dx': args['piece-x'] < args['target-x']
                                  ? 1
                                  : -1,
                                'dy': args['piece-y'] < args['target-y']
                                  ? 1
                                  : -1,
                                'id': args['id'],
                                'loopend': args['target-x'],
                                'loopstart': args['piece-x'],
                                'row': args['piece-y'],
                              })){
                                valid_move = false;
                            }

                        }else{
                            valid_move = false;
                        }

                        break;
                    }

                    // Rook
                    case chess_pieces[player][3]: {
                        if(args['target-x'] === args['piece-x']){
                            if(movement_y > 1 && chess_check_column({
                                'column': args['piece-x'],
                                'id': args['id'],
                                'loopend': args['target-y'],
                                'loopstart': args['piece-y'],
                              })){
                                valid_move = false;
                            }

                        }else if(args['target-y'] === args['piece-y']){
                            if(movement_x > 1 && chess_check_row({
                                'id': args['id'],
                                'loopend': args['target-x'],
                                'loopstart': args['piece-x'],
                                'row': args['piece-y'],
                              })){
                                valid_move = false;
                            }

                        }else{
                            valid_move = false;
                        }

                        if(valid_move && args['piece-y'] === (1 - player) * 7){
                            if(!rook_long_moved && args['piece-x'] === 0){
                                rook_long_moved = true;

                            }else if(!rook_short_moved && args['piece-x'] === 7){
                                rook_short_moved = true;
                            }
                        }

                        break;
                    }

                    // Queen
                    case chess_pieces[player][4]: {
                        if(movement_x === movement_y){
                            if(movement_y > 1 && chess_check_diagonal({
                                'column': args['piece-x'],
                                'dx': args['piece-x'] < args['target-x']
                                  ? 1
                                  : -1,
                                'dy': args['piece-y'] < args['target-y']
                                  ? 1
                                  : -1,
                                'id': args['id'],
                                'loopend': args['target-x'],
                                'loopstart': args['piece-x'],
                                'row': args['piece-y'],
                              })){
                                valid_move = false;
                            }

                        }else if(args['target-x'] === args['piece-x']){
                            if(movement_y > 1 && chess_check_column({
                                'column': args['piece-x'],
                                'id': args['id'],
                                'loopend': args['target-y'],
                                'loopstart': args['piece-y'],
                              })){
                                valid_move = false;
                            }

                        }else if(args['target-y'] === args['piece-y']){
                            if(movement_x > 1 && chess_check_row({
                                'id': args['id'],
                                'loopend': args['target-x'],
                                'loopstart': args['piece-x'],
                                'row': args['piece-y'],
                              })){
                                valid_move = false;
                            }

                        }else{
                            valid_move = false;
                        }

                        break;
                    }

                    // King
                    case chess_pieces[player][5]: {
                        if(!king_moved
                          && movement_x === 2 && movement_y === 0
                          && args['target-y'] === (1 - player) * 7){
                            if(!rook_long_moved && args['target-x'] === 2){
                                if(!chess_check_row({
                                    'id': args['id'],
                                    'loopend': args['piece-x'],
                                    'loopstart': 0,
                                    'row': args['piece-y'],
                                  })){
                                    king_moved = true;
                                    castling = true;
                                    rook_long_moved = true;

                                }else{
                                    valid_move = false;
                                }

                            }else if(!rook_short_moved && args['target-x'] === 6){
                                if(!chess_check_row({
                                    'id': args['id'],
                                    'loopend': 7,
                                    'loopstart': args['piece-x'],
                                    'row': args['piece-y'],
                                  })){
                                    king_moved = true;
                                    castling = true;
                                    rook_short_moved = true;

                                }else{
                                    valid_move = false;
                                }

                            }else{
                                valid_move = false;
                            }

                        }else if(movement_x > 1 || movement_y > 1){
                            valid_move = false;

                        }else{
                            king_moved = true;
                        }

                        if(valid_move){
                            king_x = args['target-x'];
                            king_y = args['target-y'];
                        }

                        break;
                    }

                    default:
                        valid_move = false;
                }

                if(args['threat'] !== true
                  && chess_threat({
                    'id': args['id'],
                    'piece-x': king_x,
                    'piece-y': king_y,
                    'player': 1 - player,
                  })){
                    king_checked = true;
                }
            }
        }
    }

    if(king_checked){
        //valid_move = false;
    }

    return {
      'castling': castling,
      'en-passant': en_passant,
      'en-passant-taken': en_passant_taken,
      'king-checked': king_checked,
      'king-moved': king_moved,
      'king-x': king_x,
      'king-y': king_y,
      'pawn-promote': pawn_promote,
      'rook-long-moved': rook_long_moved,
      'rook-short-moved': rook_short_moved,
      'valid': valid_move,
    };
}

globalThis.chess_games = {};
globalThis.chess_pieces = [
  ['♙', '♘', '♗', '♖', '♕', '♔'],
  ['♟', '♞', '♝', '♜', '♛', '♚'],
];
