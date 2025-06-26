'use strict';

// Required args: file, dx, dy, id, loopstart, loopend, rank
// Optional args: board
function chess_check_diagonal(args){
    const board = args.board || chess_games[args.id].board;

    if(args.loopstart > args.loopend){
        [args.loopstart, args.loopend] = [args.loopend, args.loopstart];
    }

    let x = args.file;
    let y = args.rank;

    for(let i = args.loopstart + 1; i < args.loopend; i++){
        x += args.dx;
        y += args.dy;

        if(board[y][x].length === 1){
            return true;
        }
    }

    return false;
}

// Required args: file, id, loopend, loopstart
// Optional args: board
function chess_check_file(args){
    const board = args.board || chess_games[args.id].board;

    if(args.loopstart > args.loopend){
        [args.loopstart, args.loopend] = [args.loopend, args.loopstart];
    }

    for(let i = args.loopstart + 1; i < args.loopend; i++){
        if(board[i][args.file].length === 1){
            return true;
        }
    }
    return false;
}

// Required args: id, loopend, loopstart, rank
// Optional args: board
function chess_check_rank(args){
    const board = args.board || chess_games[args.id].board;

    if(args.loopstart > args.loopend){
        [args.loopstart, args.loopend] = [args.loopend, args.loopstart];
    }

    for(let i = args.loopstart + 1; i < args.loopend; i++){
        if(board[args.rank][i].length === 1){
            return true;
        }
    }
    return false;
}

// Required args: id, piece_x, piece_y, target_x, target_y
function chess_move(args){
    const game = chess_games[args.id];
    if(!game){
        return false;
    }

    const player = game.player;
    const players = game.players;
    const validation = chess_validate({
      'id': args.id,
      'piece_x': args.piece_x,
      'piece_y': args.piece_y,
      'player': player,
      'target_x': args.target_x,
      'target_y': args.target_y,
      'threat': false,
    });
    if(validation.valid || args.override === true){
        const board = game.board;

        game.moves_50 = validation.moves_50;
        game.en_passant = validation.en_passant;
        let piece = board[args.piece_y][args.piece_x];

        board[args.piece_y][args.piece_x] = '';
        let taken_piece = board[args.target_y][args.target_x];
        if(validation.castling){
            if(validation.rook_long_moved){
                board[args.piece_y][0] = '';
                board[args.piece_y][3] = chess_pieces[player][3];

            }else if(validation.rook_short_moved){
                board[args.piece_y][7] = '';
                board[args.piece_y][5] = chess_pieces[player][3];
            }

        }else if(validation.en_passant_taken){
            taken_piece = board[args.piece_y][args.target_x];
            board[args.piece_y][args.target_x] = '';

        }else if(validation.pawn_promote){
            piece = chess_pieces[player][players[player].pawn_promote];
        }

        players[player].king_checked = validation.king_checked;
        players[player].king_moved = validation.king_moved;
        players[player].king_x = validation.king_x;
        players[player].king_y = validation.king_y;
        players[player].pieces_taken += taken_piece;
        players[player].rook_long_moved = validation.rook_long_moved;
        players[player].rook_short_moved = validation.rook_short_moved;
        board[args.target_y][args.target_x] = piece;
        game.player = 1 - player;
        if(players[player].time > 0){
            players[player].time += players[player].time-increment;
        }

        validation.king_checked_enemy = args.threat !== true
            && chess_threat({
              'id': args.id,
              'player': player,
              'squares': [
                players[1 - player].king_x,
                players[1 - player].king_y,
              ],
             });
        players[1 - player].king_checked = validation.king_checked_enemy;
        if(validation.king_checked_enemy){
            validation.state = 'check';
        }
    }

    return validation;
}

// Required args: id
// Optional args: order_black, order_white
function chess_new(args){
    const order_black = args.order_black || '31245213';
    const order_white = args.order_white || '31245213';

    const board = [
      [],
      [chess_pieces[1][0], chess_pieces[1][0], chess_pieces[1][0], chess_pieces[1][0], chess_pieces[1][0], chess_pieces[1][0], chess_pieces[1][0], chess_pieces[1][0],],
      ['', '', '', '', '', '', '', '',],
      ['', '', '', '', '', '', '', '',],
      ['', '', '', '', '', '', '', '',],
      ['', '', '', '', '', '', '', '',],
      [chess_pieces[0][0], chess_pieces[0][0], chess_pieces[0][0], chess_pieces[0][0], chess_pieces[0][0], chess_pieces[0][0], chess_pieces[0][0], chess_pieces[0][0],],
      [],
    ];
    let king_black = 4;
    for(const piece in order_black){
        board[0].push(chess_pieces[1][order_black[piece]]);
        if(order_black[piece] === '5'){
            king_black = piece;
        }
    }
    let king_white = 4;
    for(const piece in order_white){
        board[7].push(chess_pieces[0][order_white[piece]]);
        if(order_white[piece] === '5'){
            king_white = piece;
        }
    }

    let threefold = '';
    for(const rank of board){
        for(const square of rank){
            threefold += square.length === 0
              ? ' '
              : square;
        }
    }

    const time = Math.floor(args.time) || 3600;
    const increment = Math.floor(args.increment) || 10;
    chess_games[args.id] = {
      'board': board,
      'en_passant': -1,
      'en_passant_taken': false,
      'moves_50': 0,
      'player': 0,
      'players': [
        {
          'king_checked': false,
          'king_moved': false,
          'king_x': king_white,
          'king_y': 7,
          'pawn_promote': 4,
          'pieces_taken': '',
          'rook_long_moved': false,
          'rook_short_moved': false,
          'time': time,
          'time-increment': increment,
        },
        {
          'king_checked': false,
          'king_moved': false,
          'king_x': king_black,
          'king_y': 0,
          'pawn_promote': 4,
          'pieces_taken': '',
          'rook_long_moved': false,
          'rook_short_moved': false,
          'time': time,
          'time-increment': increment,
        },
      ],
      'threefold': {
        [threefold]: 1,
      },
      'threefold_highest': 1,
    };
}

// Required args: id, player, squares
// Optional args: board
function chess_threat(args){
    const board = args.board || chess_games[args.id].board;
    for(let y = 0; y < 8; y++){
        for(let x = 0; x < 8; x++){
            if(board[y][x].length === 1
              && chess_pieces[args.player].includes(board[y][x])){
                for(let square = 0; square < args.squares.length; square += 2){
                    if(chess_validate({
                        'board': args.board,
                        'id': args.id,
                        'piece_x': x,
                        'piece_y': y,
                        'player': args.player,
                        'target_x': args.squares[square],
                        'target_y': args.squares[square + 1],
                        'threat': true,
                      }).valid){
                        return true;
                    }
                }
            }
        }
    }

    return false;
}

// Required args: id, piece_x, piece_y, player, target_x, target_y
// Optional args: board, threat
function chess_validate(args){
    const game = chess_games[args.id];
    if(!game){
        return;
    }

    const board = args.board || game.board;
    const chess_test = [];
    const player = args.player;
    let castling = false;
    let en_passant = -1;
    let en_passant_taken = false;
    let fifty_moves = game.moves_50;
    let king_checked = game.players[player].king_checked;
    let king_moved = game.players[player].king_moved;
    let king_x = game.players[player].king_x;
    let king_y = game.players[player].king_y;
    let rook_long_moved = game.players[player].rook_long_moved;
    let rook_short_moved = game.players[player].rook_short_moved;
    let pawn_promote = false;
    let state = 'valid';
    let valid_move = true;

    const piece = board[args.piece_y][args.piece_x];
    const target_piece = board[args.target_y][args.target_x];

    if(fifty_moves >= 75
      || game.threefold_highest >= 5
      || (game.players[0].pieces_taken.length === 15 && game.players[1].pieces_taken.length === 15)){
        state = 'draw';
        valid_move = false;

    }else if(args.piece_x < 0 || args.piece_x > 7
      || args.piece_y < 0 || args.piece_y > 7
      || args.target_x < 0 || args.target_x > 7
      || args.target_y < 0 || args.target_y > 7
      || game.players[player].time === 0){
        valid_move = false;

    }else{
        if(piece.length === 0
          || (args.threat !== true
          && (!chess_pieces[player].includes(piece) || chess_pieces[player].includes(target_piece)))){
            valid_move = false;

        }else{
            const movement_x = Math.abs(args.piece_x - args.target_x);
            const movement_y = Math.abs(args.piece_y - args.target_y);
            switch(piece){
                // Pawn
                case chess_pieces[player][0]: {
                    const direction = player === 0 ? -1 : 1;

                    if(args.target_x !== args.piece_x){
                        if(movement_x !== 1
                          || args.target_y - args.piece_y !== direction){
                            valid_move = false;

                        }else if(args.target_x === game.en_passant - 1
                          && args.target_y === 2 + (player * 3)){
                            en_passant_taken = true;

                        }else if(!chess_pieces[1 - player].includes(target_piece)){
                            valid_move = false;
                        }

                    }else if(target_piece.length === 0){
                        if(args.piece_y === 6 - (player * 5)){
                            if(args.target_y !== args.piece_y + direction
                              && args.target_y !== args.piece_y + direction * 2){
                                valid_move = false;

                            }else if(game.board[args.piece_y + direction][args.piece_x].length){
                                valid_move = false;

                            }else if(args.target_y === args.piece_y + direction * 2){
                                en_passant = args.piece_x + 1;
                            }

                        }else if(args.target_y !== args.piece_y + direction){
                            valid_move = false;
                        }

                    }else{
                        valid_move = false;
                    }

                    if(valid_move && args.target_y === player * 7){
                        pawn_promote = true;
                    }

                    break;
                }

                // Knight
                case chess_pieces[player][1]: {
                    if(!((movement_x === 1 && movement_y === 2)
                      || (movement_x === 2 && movement_y === 1))){
                        valid_move = false;
                    }

                    break;
                }

                // Bishop
                case chess_pieces[player][2]: {
                    if(movement_x === movement_y){
                        if(movement_y > 1 && chess_check_diagonal({
                            'board': args.board,
                            'file': args.piece_x,
                            'dx': args.piece_x < args.target_x
                              ? 1
                              : -1,
                            'dy': args.piece_y < args.target_y
                              ? 1
                              : -1,
                            'id': args.id,
                            'loopend': args.target_x,
                            'loopstart': args.piece_x,
                            'rank': args.piece_y,
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
                    if(args.target_x === args.piece_x){
                        if(movement_y > 1 && chess_check_file({
                            'board': args.board,
                            'file': args.piece_x,
                            'id': args.id,
                            'loopend': args.target_y,
                            'loopstart': args.piece_y,
                          })){
                            valid_move = false;
                        }

                    }else if(args.target_y === args.piece_y){
                        if(movement_x > 1 && chess_check_rank({
                            'board': args.board,
                            'id': args.id,
                            'loopend': args.target_x,
                            'loopstart': args.piece_x,
                            'rank': args.piece_y,
                          })){
                            valid_move = false;
                        }

                    }else{
                        valid_move = false;
                    }

                    if(valid_move && args.piece_y === (1 - player) * 7){
                        if(!rook_long_moved && args.piece_x === 0){
                            rook_long_moved = true;

                        }else if(!rook_short_moved && args.piece_x === 7){
                            rook_short_moved = true;
                        }
                    }

                    break;
                }

                // Queen
                case chess_pieces[player][4]: {
                    if(movement_x === movement_y){
                        if(movement_y > 1 && chess_check_diagonal({
                            'board': args.board,
                            'file': args.piece_x,
                            'dx': args.piece_x < args.target_x
                              ? 1
                              : -1,
                            'dy': args.piece_y < args.target_y
                              ? 1
                              : -1,
                            'id': args.id,
                            'loopend': args.target_x,
                            'loopstart': args.piece_x,
                            'rank': args.piece_y,
                          })){
                            valid_move = false;
                        }

                    }else if(args.target_x === args.piece_x){
                        if(movement_y > 1 && chess_check_file({
                            'board': args.board,
                            'file': args.piece_x,
                            'id': args.id,
                            'loopend': args.target_y,
                            'loopstart': args.piece_y,
                          })){
                            valid_move = false;
                        }

                    }else if(args.target_y === args.piece_y){
                        if(movement_x > 1 && chess_check_rank({
                            'board': args.board,
                            'id': args.id,
                            'loopend': args.target_x,
                            'loopstart': args.piece_x,
                            'rank': args.piece_y,
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
                      && args.target_y === (1 - player) * 7){
                        const y = (1 - player) * 7;
                        if(!rook_long_moved && args.target_x === 2){
                            if(!chess_threat({
                                'board': args.board,
                                'id': args.id,
                                'player': 1 - args.player,
                                'squares': [
                                  args.piece_x - 1,
                                  y,
                                  args.piece_x - 2,
                                  y,
                                ],
                              }) && !chess_check_rank({
                                'board': args.board,
                                'id': args.id,
                                'loopend': args.piece_x,
                                'loopstart': 0,
                                'rank': args.piece_y,
                              })){
                                castling = true;
                                rook_long_moved = true;

                            }else{
                                valid_move = false;
                            }

                        }else if(!rook_short_moved && args.target_x === 6){
                            if(!chess_threat({
                                'board': args.board,
                                'id': args.id,
                                'player': 1 - args.player,
                                'squares': [
                                  args.piece_x + 1,
                                  y,
                                  args.piece_x + 2,
                                  y,
                                ],
                              }) && !chess_check_rank({
                                'board': args.board,
                                'id': args.id,
                                'loopend': 7,
                                'loopstart': args.piece_x,
                                'rank': args.piece_y,
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
                        king_x = args.target_x;
                        king_y = args.target_y;
                    }

                    break;
                }

                default:
                    valid_move = false;
            }

            if(valid_move
              && args.threat !== true){
                chess_test.push(
                  [...board[0]],
                  [...board[1]],
                  [...board[2]],
                  [...board[3]],
                  [...board[4]],
                  [...board[5]],
                  [...board[6]],
                  [...board[7]]
                );
                chess_test[args.piece_y][args.piece_x] = '';
                chess_test[args.target_y][args.target_x] = piece;

                if(chess_threat({
                    'board': chess_test,
                    'id': args.id,
                    'player': 1 - player,
                    'squares': [
                      king_x,
                      king_y,
                    ],
                  })){
                    state = 'check';
                    valid_move = false;

                }else{
                    king_checked = false;
                }
            }
        }

        if(valid_move){
            if(target_piece.length > 0
              || piece === chess_pieces[0][0]
              || piece === chess_pieces[1][0]){
                fifty_moves = 0;

            }else{
                fifty_moves += .5;
            }

            if(castling
              || en_passant !== -1
              || en_passant_taken
              || pawn_promote
              || piece === chess_pieces[player][0]){
                game.threefold = {};
                game.threefold_highest = 1;
            }
        }
    }

    if(valid_move
      && args.threat !== true){
        if(target_piece.length === 1){
            for(const threefold in game.threefold){
                if(threefold.includes(target_piece)){
                    delete game.threefold[threefold];
                }
            }
        }

        let threefold_string = '';
        for(const rank of chess_test){
            for(const square of rank){
                threefold_string += square.length === 0
                  ? ' '
                  : square;
            }
        }
        if(game.threefold[threefold_string] === void 0){
            game.threefold[threefold_string] = 0;
        }

        game.threefold[threefold_string]++;
        game.threefold_highest = Math.max(
          game.threefold[threefold_string],
          game.threefold_highest
        );
    }

    return {
      'castling': castling,
      'en_passant': en_passant,
      'en_passant_taken': en_passant_taken,
      'king_checked': king_checked,
      'king_moved': king_moved,
      'king_x': king_x,
      'king_y': king_y,
      'moves_50': fifty_moves,
      'pawn_promote': pawn_promote,
      'rook_long_moved': rook_long_moved,
      'rook_short_moved': rook_short_moved,
      'state': state,
      'threefold': game.threefold_highest,
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
