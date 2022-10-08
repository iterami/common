'use strict';

// Required args: id, piece-x, piece-y, target-x, target-y
function chess_move(args){
    if(!chess_games[args['id']]){
        return false;
    }

    const piece = chess_games[args['id']]['board'][args['piece-y']][args['piece-x']];
    const valid_move = chess_validate(args);
    if(valid_move){
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

    const target_piece = chess_games[args['id']]['board'][args['target-y']][args['target-x']]
    let valid_move = true;
    switch(piece){
        // pawn
        case chess_pieces[player][0]: {
            const direction = player === 0 ? -1 : 1;

            if(args['target-x'] !== args['piece-x']){

            }else if(target_piece.length === 0){
                if(args['target-y'] !== args['piece-y'] + direction){
                    valid_move = false;
                }

            }else{
                valid_move = false;
            }

            break;
        }

        // knight
        case chess_pieces[player][1]: {
            break;
        }

        // bishop
        case chess_pieces[player][2]: {
            break;
        }

        // rook
        case chess_pieces[player][3]: {
            if(args['target-x'] !== args['piece-x'] && args['target-y'] !== args['piece-y']){
                valid_move = false;
            }

            break;
        }

        // queen
        case chess_pieces[player][4]: {
            break;
        }

        // king
        case chess_pieces[player][5]: {
            const movement_x = Math.abs(args['piece-x'] - args['target-x']);
            const movement_y = Math.abs(args['piece-y'] - args['target-y'])
            if(movement_x > 1 || movement_y > 1 || chess_pieces[player].includes(target_piece)){
                valid_move = false;
            }

            break;
        }

        default:
            valid_move = false;
    }
    return valid_move;
}

globalThis.chess_games = {};
globalThis.chess_pieces = [
  ['♙', '♘', '♗', '♖', '♕', '♔'],
  ['♟', '♞', '♝', '♜', '♛', '♚'],
];
