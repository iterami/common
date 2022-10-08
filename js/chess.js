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
    if(!chess_games[args['id']]){
        return false;
    }

    const player = chess_games[args['id']]['player'];
    const piece = chess_games[args['id']]['board'][args['piece-y']][args['piece-x']];

    if(piece.length === 0
      || args['piece-x'] < 0 || args['piece-x'] > 7
      || args['piece-y'] < 0 || args['piece-y'] > 7
      || args['target-x'] < 0 || args['target-x'] > 7
      || args['target-y'] < 0 || args['target-y'] > 7
      || !chess_pieces[player].includes(piece)){
        return false;
    }

    let valid_move = true;

    switch(piece){
        case chess_pieces[player][0]:
            console.log('pawn');
            break;
        case chess_pieces[player][1]:
            console.log('knight');
            break;
        case chess_pieces[player][2]:
            console.log('bishop');
            break;
        case chess_pieces[player][3]:
            console.log('rook');
            break;
        case chess_pieces[player][4]:
            console.log('queen');
            break;
        case chess_pieces[player][5]:
            console.log('king');
            break;
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
