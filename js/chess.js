'use strict';

// Required args: id, piece_x, piece_y, target_x, target_y
function chess_move(args){
    const player = chess_games[args['id']]['player'];
    let valid_move = true;

    const piece = chess_games[args['id']]['board'][args['piece_y']][args['piece_x']];
    if(piece.length === 0 || !chess_pieces[player].includes(piece)){
        valid_move = false;

    }else{
        valid_move = chess_validate({
          ...args,
          'piece': piece,
        });
    }

    if(valid_move){
        chess_games[args['id']]['board'][args['piece_y']][args['piece_x']] = '';
        chess_games[args['id']]['board'][args['target_y']][args['target_x']] = piece;
        chess_games[args['id']]['player'] = 1 - player;
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

// Required args: id, piece, piece_x, piece_y, target_x, target_y
function chess_validate(args){
    let valid_move = true;

    return valid_move;
}

globalThis.chess_games = {};
globalThis.chess_pieces = [
  ['♙', '♘', '♗', '♖', '♕', '♔'],
  ['♟', '♞', '♝', '♜', '♛', '♚'],
];
