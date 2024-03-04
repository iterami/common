'use strict';

// Required args: id, column, loopend, loopstart
// Optional args: board
function chess_check_column(args){
    const board = args['board'] || chess_games[args['id']]['board'];

    if(args['loopstart'] > args['loopend']){
        const temp = args['loopstart'];
        args['loopstart'] = args['loopend'];
        args['loopend'] = temp;
    }

    for(let i = args['loopstart'] + 1; i < args['loopend']; i++){
        if(board[i][args['column']].length === 1){
            return true;
        }
    }
    return false;
}

// Required args: id, column, dx, dy, loopstart, loopend, row
// Optional args: board
function chess_check_diagonal(args){
    const board = args['board'] || chess_games[args['id']]['board'];

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

        if(board[y][x].length === 1){
            return true;
        }
    }

    return false;
}

// Required args: id, loopend, loopstart, row
// Optional args: board
function chess_check_row(args){
    const board = args['board'] || chess_games[args['id']]['board'];

    if(args['loopstart'] > args['loopend']){
        const temp = args['loopstart'];
        args['loopstart'] = args['loopend'];
        args['loopend'] = temp;
    }

    for(let i = args['loopstart'] + 1; i < args['loopend']; i++){
        if(board[args['row']][i].length === 1){
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
    const players = chess_games[args['id']]['players'];
    const validation = chess_validate({
      'id': args['id'],
      'piece-x': args['piece-x'],
      'piece-y': args['piece-y'],
      'player': player,
      'target-x': args['target-x'],
      'target-y': args['target-y'],
      'threat': false,
    });
    if(validation['valid'] || args['override'] === true){
        const board = chess_games[args['id']]['board'];

        chess_games[args['id']]['50-moves'] = validation['50-moves'];
        chess_games[args['id']]['en-passant'] = validation['en-passant'];
        let piece = board[args['piece-y']][args['piece-x']];

        board[args['piece-y']][args['piece-x']] = '';
        let taken_piece = board[args['target-y']][args['target-x']];
        if(validation['castling']){
            if(validation['rook-long-moved']){
                board[args['piece-y']][0] = '';
                board[args['piece-y']][3] = chess_pieces[player][3];

            }else if(validation['rook-short-moved']){
                board[args['piece-y']][7] = '';
                board[args['piece-y']][5] = chess_pieces[player][3];
            }

        }else if(validation['en-passant-taken']){
            taken_piece = board[args['piece-y']][args['target-x']];
            board[args['piece-y']][args['target-x']] = '';

        }else if(validation['pawn-promote']){
            piece = chess_pieces[player][players[player]['pawn-promote']];
        }

        players[player]['king-checked'] = validation['king-checked'];
        players[player]['king-moved'] = validation['king-moved'];
        players[player]['king-x'] = validation['king-x'];
        players[player]['king-y'] = validation['king-y'];
        players[player]['pieces-taken'] += taken_piece;
        players[player]['rook-long-moved'] = validation['rook-long-moved'];
        players[player]['rook-short-moved'] = validation['rook-short-moved'];
        board[args['target-y']][args['target-x']] = piece;
        chess_games[args['id']]['player'] = 1 - player;
    }

    validation['king-checked-enemy'] = args['threat'] !== true
        && chess_threat({
          'id': args['id'],
          'player': player,
          'squares': [
            players[1 - player]['king-x'],
            players[1 - player]['king-y'],
          ],
         });
    players[1 - player]['king-checked'] = validation['king-checked-enemy'];

    return validation;
}

// Required args: id
function chess_new(args){
    chess_games[args['id']] = {
      '50-moves': 0,
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

// Required args: id, player, squares
// Optional args: board
function chess_threat(args){
    const board = args['board'] || chess_games[args['id']]['board'];
    for(let y = 0; y < 8; y++){
        for(let x = 0; x < 8; x++){
            if(board[y][x].length === 1
              && chess_pieces[args['player']].includes(board[y][x])){
                for(let square = 0; square < args['squares'].length / 2; square += 2){
                    if(chess_validate({
                        'board': args['board'],
                        'id': args['id'],
                        'piece-x': x,
                        'piece-y': y,
                        'player': args['player'],
                        'target-x': args['squares'][square],
                        'target-y': args['squares'][square + 1],
                        'threat': true,
                      })['valid']){
                        return true;
                    }
                }
            }
        }
    }

    return false;
}

// Required args: id, piece-x, piece-y, player, target-x, target-y
// Optional args: board, threat
function chess_validate(args){
    const game = chess_games[args['id']];
    if(!game){
        return;
    }

    const player = args['player'];
    const board = args['board'] || game['board'];
    let castling = false;
    let en_passant = -1;
    let en_passant_taken = false;
    let fifty_moves = game['50-moves'];
    let king_checked = game['players'][player]['king-checked'];
    let king_moved = game['players'][player]['king-moved'];
    let king_x = game['players'][player]['king-x'];
    let king_y = game['players'][player]['king-y'];
    let rook_long_moved = game['players'][player]['rook-long-moved'];
    let rook_short_moved = game['players'][player]['rook-short-moved'];
    let pawn_promote = false;
    let valid_move = true;

    if(fifty_moves >= 50
      || args['piece-x'] < 0 || args['piece-x'] > 7
      || args['piece-y'] < 0 || args['piece-y'] > 7
      || args['target-x'] < 0 || args['target-x'] > 7
      || args['target-y'] < 0 || args['target-y'] > 7
      || (game['players'][0]['pieces-taken'].length === 15 && game['players'][1]['pieces-taken'].length === 15)){
        valid_move = false;

    }else{
        const piece = board[args['piece-y']][args['piece-x']];
        const target_piece = board[args['target-y']][args['target-x']];
        if(piece.length === 0
          || (args['threat'] !== true
          && (!chess_pieces[player].includes(piece) || chess_pieces[player].includes(target_piece)))){
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

                        }else if(args['target-x'] === game['en-passant'] - 1
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

                            }else if(game['board'][args['piece-y'] + direction][args['piece-x']].length){
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
                            'board': args['board'],
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
                            'board': args['board'],
                            'column': args['piece-x'],
                            'id': args['id'],
                            'loopend': args['target-y'],
                            'loopstart': args['piece-y'],
                          })){
                            valid_move = false;
                        }

                    }else if(args['target-y'] === args['piece-y']){
                        if(movement_x > 1 && chess_check_row({
                            'board': args['board'],
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
                            'board': args['board'],
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
                            'board': args['board'],
                            'column': args['piece-x'],
                            'id': args['id'],
                            'loopend': args['target-y'],
                            'loopstart': args['piece-y'],
                          })){
                            valid_move = false;
                        }

                    }else if(args['target-y'] === args['piece-y']){
                        if(movement_x > 1 && chess_check_row({
                            'board': args['board'],
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
                      && !king_checked
                      && movement_x === 2 && movement_y === 0
                      && args['target-y'] === (1 - player) * 7){
                        if(!rook_long_moved && args['target-x'] === 2){
                            if(!chess_check_row({
                                'board': args['board'],
                                'id': args['id'],
                                'loopend': args['piece-x'],
                                'loopstart': 0,
                                'row': args['piece-y'],
                              })){
                                castling = true;
                                rook_long_moved = true;

                            }else{
                                valid_move = false;
                            }

                        }else if(!rook_short_moved && args['target-x'] === 6){
                            if(!chess_check_row({
                                'board': args['board'],
                                'id': args['id'],
                                'loopend': 7,
                                'loopstart': args['piece-x'],
                                'row': args['piece-y'],
                              })){
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
                    }

                    if(valid_move){
                        king_moved = true;
                        king_x = args['target-x'];
                        king_y = args['target-y'];
                    }

                    break;
                }

                default:
                    valid_move = false;
            }

            if(valid_move
              && args['threat'] !== true){
                chess_test = [
                  [...board[0]],
                  [...board[1]],
                  [...board[2]],
                  [...board[3]],
                  [...board[4]],
                  [...board[5]],
                  [...board[6]],
                  [...board[7]],
                ];
                chess_test[args['piece-y']][args['piece-x']] = '';
                chess_test[args['target-y']][args['target-x']] = piece;

                if(chess_threat({
                    'board': chess_test,
                    'id': args['id'],
                    'player': 1 - player,
                    'squares': [
                      king_x,
                      king_y,
                    ],
                  })){
                    valid_move = false;

                }else{
                    king_checked = false;
                }

                chess_test.length = 0;
            }
        }

        if(valid_move){
            if(target_piece.length > 0
              || piece === chess_pieces[0][0]
              || piece === chess_pieces[1][0]){
                fifty_moves = 0;

            }else{
                fifty_moves += 0.5;
            }
        }
    }

    return {
      '50-moves': fifty_moves,
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

function chess_xy_to_fr(x, y){
    return 'abcdefgh'[x] + (8 - y);
}

globalThis.chess_games = {};
globalThis.chess_pieces = [
  ['♙', '♘', '♗', '♖', '♕', '♔'],
  ['♟', '♞', '♝', '♜', '♛', '♚'],
];
globalThis.chess_test = [];
