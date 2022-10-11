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

    const valid_move = chess_validate(args);
    if(valid_move){
        const piece_x = args['piece-x'] - 1;
        const piece_y = args['piece-y'] - 1;
        const piece = chess_games[args['id']]['board'][piece_y][piece_x];

        chess_games[args['id']]['board'][piece_y][piece_x] = '';
        chess_games[args['id']]['board'][args['target-y'] - 1][args['target-x'] - 1] = piece;
        chess_games[args['id']]['player'] = 1 - chess_games[args['id']]['player'];
    }
    return valid_move;
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
      'player': 0,
    };
}

// Required args: id, piece-x, piece-y, target-x, target-y
function chess_validate(args){
    const piece_x = args['piece-x'] - 1;
    const piece_y = args['piece-y'] - 1;
    const target_x = args['target-x'] - 1;
    const target_y = args['target-y'] - 1;

    if(!chess_games[args['id']]
      || piece_x < 0 || piece_x > 7
      || piece_y < 0 || piece_y > 7
      || target_x < 0 || target_x > 7
      || target_y < 0 || target_y > 7){
        return false;
    }

    const player = chess_games[args['id']]['player'];
    const piece = chess_games[args['id']]['board'][piece_y][piece_x];
    if(piece.length === 0 || !chess_pieces[player].includes(piece)){
        return false;
    }

    const target_piece = chess_games[args['id']]['board'][target_y][target_x];
    if(chess_pieces[player].includes(target_piece)){
        return false;
    }
    const movement_x = Math.abs(piece_x - target_x);
    const movement_y = Math.abs(piece_y - target_y);

    switch(piece){
        // Pawn
        case chess_pieces[player][0]: {
            const direction = player === 0 ? -1 : 1;

            if(target_x !== piece_x){
                if(movement_x !== 1
                  || target_y - piece_y !== direction
                  || !chess_pieces[1 - player].includes(target_piece)){
                    return false;
                }

            }else if(target_piece.length === 0){
                if(piece_y === 6 - (player * 5)){
                    if(target_y !== piece_y + direction
                      && target_y !== piece_y + direction * 2){
                        return false;
                    }

                }else if(target_y !== piece_y + direction){
                    return false;
                }

            }else{
                return false;
            }

            break;
        }

        // Knight
        case chess_pieces[player][1]: {
            if(movement_x < 1 || movement_x > 2 || movement_y < 1 || movement_y > 2){
                return false;

            }else if((movement_x === 1 && movement_y !== 2)
              || (movement_x === 2 && movement_y !== 1)){
                return false;
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
                    return false;
                }

            }else{
                return false;
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
                    return false;
                }

            }else if(target_y === piece_y){
                if(movement_x > 1 && chess_check_row({
                    'id': args['id'],
                    'loopend': target_x,
                    'loopstart': piece_x,
                    'row': piece_y,
                  })){
                    return false;
                }

            }else{
                return false;
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
                    return false;
                }

            }else if(target_x === piece_x){
                if(movement_y > 1 && chess_check_column({
                    'column': piece_x,
                    'id': args['id'],
                    'loopend': target_y,
                    'loopstart': piece_y,
                  })){
                    return false;
                }

            }else if(target_y === piece_y){
                if(movement_x > 1 && chess_check_row({
                    'id': args['id'],
                    'loopend': target_x,
                    'loopstart': piece_x,
                    'row': piece_y,
                  })){
                    return false;
                }

            }else{
                return false;
            }

            break;
        }

        // King
        case chess_pieces[player][5]: {
            if(movement_x > 1 || movement_y > 1){
                return false;
            }

            break;
        }

        default:
            return false;
    }
    return true;
}

globalThis.chess_games = {};
globalThis.chess_pieces = [
  ['♙', '♘', '♗', '♖', '♕', '♔'],
  ['♟', '♞', '♝', '♜', '♛', '♚'],
];
