'use strict';

// Required args: id, piece-x, piece-y, target-x, target-y
function chess_move(args){
    if(!chess_games[args['id']]){
        return false;
    }

    const valid_move = chess_validate(args);
    if(valid_move){
        const piece = chess_games[args['id']]['board'][args['piece-y']][args['piece-x']];
        chess_games[args['id']]['board'][args['piece-y']][args['piece-x']] = '';
        chess_games[args['id']]['board'][args['target-y']][args['target-x']] = piece;
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
    if(!chess_games[args['id']]
      || args['piece-x'] < 0 || args['piece-x'] > 7
      || args['piece-y'] < 0 || args['piece-y'] > 7
      || args['target-x'] < 0 || args['target-x'] > 7
      || args['target-y'] < 0 || args['target-y'] > 7){
        return false;
    }

    const player = chess_games[args['id']]['player'];
    const piece = chess_games[args['id']]['board'][args['piece-y']][args['piece-x']];
    if(piece.length === 0 || !chess_pieces[player].includes(piece)){
        return false;
    }

    const target_piece = chess_games[args['id']]['board'][args['target-y']][args['target-x']];
    if(chess_pieces[player].includes(target_piece)){
        return false;
    }
    const movement_x = Math.abs(args['piece-x'] - args['target-x']);
    const movement_y = Math.abs(args['piece-y'] - args['target-y']);

    switch(piece){
        // pawn
        case chess_pieces[player][0]: {
            const direction = player === 0 ? -1 : 1;

            if(args['target-x'] !== args['piece-x']){
                if(movement_x !== 1 || movement_y !== 1 || !chess_pieces[1 - player].includes(target_piece)){
                    valid_move = false;
                }

            }else if(target_piece.length === 0){
                if(args['piece-y'] === 6 - (player * 5)){
                    if(args['target-y'] !== args['piece-y'] + direction
                      && args['target-y'] !== args['piece-y'] + direction * 2){
                        return false;
                    }

                }else if(args['target-y'] !== args['piece-y'] + direction){
                    return false;
                }

            }else{
                return false;
            }

            break;
        }

        // knight
        case chess_pieces[player][1]: {
            if(movement_x < 1 || movement_x > 2 || movement_y < 1 || movement_y > 2){
                return false;

            }else if((movement_x === 1 && movement_y !== 2)
              || (movement_x === 2 && movement_y !== 1)){
                return false;
            }

            break;
        }

        // bishop
        case chess_pieces[player][2]: {
            if(movement_x !== movement_y){
                return false;
            }

            break;
        }

        // rook
        case chess_pieces[player][3]: {
            if(args['target-x'] !== args['piece-x'] && args['target-y'] !== args['piece-y']){
                return false;
            }

            break;
        }

        // queen
        case chess_pieces[player][4]: {
            if(movement_x !== movement_y){
                if(args['target-x'] !== args['piece-x'] && args['target-y'] !== args['piece-y']){
                    return false;
                }
            }

            break;
        }

        // king
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
