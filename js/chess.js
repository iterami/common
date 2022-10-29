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

    const validation = chess_validate(args);
    if(validation['valid']){
        chess_games[args['id']]['en-passant'] = validation['en-passant'];
        const piece_x = args['piece-x'] - 1;
        const piece_y = args['piece-y'] - 1;
        const player = chess_games[args['id']]['player'];
        let piece = chess_games[args['id']]['board'][piece_y][piece_x];

        chess_games[args['id']]['board'][piece_y][piece_x] = '';
        let taken_piece = chess_games[args['id']]['board'][args['target-y'] - 1][args['target-x'] - 1];
        if(validation['castling']){
            if(validation['rook-long-moved']){
                chess_games[args['id']]['board'][piece_y][0] = '';
                chess_games[args['id']]['board'][piece_y][3] = chess_pieces[player][3];

            }else if(validation['rook-short-moved']){
                chess_games[args['id']]['board'][piece_y][7] = '';
                chess_games[args['id']]['board'][piece_y][5] = chess_pieces[player][3];
            }

        }else if(validation['en-passant-taken']){
            taken_piece = chess_games[args['id']]['board'][piece_y][args['target-x'] - 1];
            chess_games[args['id']]['board'][piece_y][args['target-x'] - 1] = '';

        }else if(validation['pawn-promote']){
            piece = chess_pieces[player][chess_games[args['id']]['players'][player]['pawn-promote']];
        }

        chess_games[args['id']]['players'][player]['king-moved'] = validation['king-moved'];
        chess_games[args['id']]['players'][player]['king-x'] = validation['king-x'];
        chess_games[args['id']]['players'][player]['king-y'] = validation['king-y'];
        chess_games[args['id']]['players'][player]['pieces-taken'] += taken_piece;
        chess_games[args['id']]['players'][player]['rook-long-moved'] = validation['rook-long-moved'];
        chess_games[args['id']]['players'][player]['rook-short-moved'] = validation['rook-short-moved'];
        chess_games[args['id']]['board'][args['target-y'] - 1][args['target-x'] - 1] = piece;
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
          'king-moved': false,
          'king-x': 4,
          'king-y': 7,
          'pawn-promote': 4,
          'pieces-taken': '',
          'rook-long-moved': false,
          'rook-short-moved': false,
        },
        {
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
                    'piece-x': x + 1,
                    'piece-y': y + 1,
                    'target-x': args['piece-x'],
                    'target-y': args['piece-y'],
                  })['valid']){
                    return true;
                }
            }
        }
    }

    return false;
}

// Required args: id, piece-x, piece-y, target-x, target-y
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

    const piece_x = args['piece-x'] - 1;
    const piece_y = args['piece-y'] - 1;
    const target_x = args['target-x'] - 1;
    const target_y = args['target-y'] - 1;
    if(!chess_games[args['id']]
      || piece_x < 0 || piece_x > 7
      || piece_y < 0 || piece_y > 7
      || target_x < 0 || target_x > 7
      || target_y < 0 || target_y > 7){
        valid_move = false;

    }else{
        const player = chess_games[args['id']]['player'];
        king_moved = chess_games[args['id']]['players'][player]['king-moved'];
        king_x = chess_games[args['id']]['players'][player]['king-x'];
        king_y = chess_games[args['id']]['players'][player]['king-y'];
        rook_long_moved = chess_games[args['id']]['players'][player]['rook-long-moved'];
        rook_short_moved = chess_games[args['id']]['players'][player]['rook-short-moved'];

        const piece = chess_games[args['id']]['board'][piece_y][piece_x];
        if(piece.length === 0 || !chess_pieces[player].includes(piece)){
            valid_move = false;

        }else{
            const target_piece = chess_games[args['id']]['board'][target_y][target_x];
            if(chess_pieces[player].includes(target_piece)){
                valid_move = false;

            }else{
                const movement_x = Math.abs(piece_x - target_x);
                const movement_y = Math.abs(piece_y - target_y);
                switch(piece){
                    // Pawn
                    case chess_pieces[player][0]: {
                        const direction = player === 0 ? -1 : 1;

                        if(target_x !== piece_x){
                            if(movement_x !== 1
                              || target_y - piece_y !== direction){
                                valid_move = false;

                            }else if(target_x === chess_games[args['id']]['en-passant'] - 1
                              && target_y === 2 + (player * 3)){
                                en_passant_taken = true;

                            }else if(!chess_pieces[1 - player].includes(target_piece)){
                                valid_move = false;
                            }

                        }else if(target_piece.length === 0){
                            if(piece_y === 6 - (player * 5)){
                                if(target_y !== piece_y + direction
                                  && target_y !== piece_y + direction * 2){
                                    valid_move = false;

                                }else if(target_y === piece_y + direction * 2){
                                    en_passant = piece_x + 1;
                                }

                            }else if(target_y !== piece_y + direction){
                                valid_move = false;
                            }

                        }else{
                            valid_move = false;
                        }

                        if(valid_move && target_y === player * 7){
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
                                'column': piece_x,
                                'dx': piece_x < target_x
                                  ? 1
                                  : -1,
                                'dy': piece_y < target_y
                                  ? 1
                                  : -1,
                                'id': args['id'],
                                'loopend': target_x,
                                'loopstart': piece_x,
                                'row': piece_y,
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
                        if(target_x === piece_x){
                            if(movement_y > 1 && chess_check_column({
                                'column': piece_x,
                                'id': args['id'],
                                'loopend': target_y,
                                'loopstart': piece_y,
                              })){
                                valid_move = false;
                            }

                        }else if(target_y === piece_y){
                            if(movement_x > 1 && chess_check_row({
                                'id': args['id'],
                                'loopend': target_x,
                                'loopstart': piece_x,
                                'row': piece_y,
                              })){
                                valid_move = false;
                            }

                        }else{
                            valid_move = false;
                        }

                        if(valid_move && piece_y === (1 - player) * 7){
                            if(!rook_long_moved && piece_x === 0){
                                rook_long_moved = true;

                            }else if(!rook_short_moved && piece_x === 7){
                                rook_short_moved = true;
                            }
                        }

                        break;
                    }

                    // Queen
                    case chess_pieces[player][4]: {
                        if(movement_x === movement_y){
                            if(movement_y > 1 && chess_check_diagonal({
                                'column': piece_x,
                                'dx': piece_x < target_x
                                  ? 1
                                  : -1,
                                'dy': piece_y < target_y
                                  ? 1
                                  : -1,
                                'id': args['id'],
                                'loopend': target_x,
                                'loopstart': piece_x,
                                'row': piece_y,
                              })){
                                valid_move = false;
                            }

                        }else if(target_x === piece_x){
                            if(movement_y > 1 && chess_check_column({
                                'column': piece_x,
                                'id': args['id'],
                                'loopend': target_y,
                                'loopstart': piece_y,
                              })){
                                valid_move = false;
                            }

                        }else if(target_y === piece_y){
                            if(movement_x > 1 && chess_check_row({
                                'id': args['id'],
                                'loopend': target_x,
                                'loopstart': piece_x,
                                'row': piece_y,
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
                          && target_y === (1 - player) * 7){
                            if(!rook_long_moved && target_x === 2){
                                if(!chess_check_row({
                                    'id': args['id'],
                                    'loopend': piece_x,
                                    'loopstart': 0,
                                    'row': piece_y,
                                  })){
                                    king_moved = true;
                                    castling = true;
                                    rook_long_moved = true;

                                }else{
                                    valid_move = false;
                                }

                            }else if(!rook_short_moved && target_x === 6){
                                if(!chess_check_row({
                                    'id': args['id'],
                                    'loopend': 7,
                                    'loopstart': piece_x,
                                    'row': piece_y,
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
                            king_x = target_x;
                            king_y = target_y;
                        }

                        break;
                    }

                    default:
                        valid_move = false;
                }
            }
        }
    }

    if(king_checked){
        move_valid = false;
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
