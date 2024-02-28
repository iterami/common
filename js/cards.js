'use strict';

function cards_draw(id){
    if(cards_decks[id]['deck'].length === 0){
        return;
    }

    const card = cards_decks[id]['deck'].shift();
    cards_decks[id]['drawn'].unshift(card);
    return card;
}

function cards_new(id){
    const deck = [];
    const suits = [' of spades', ' of diamonds', ' of clubs', ' of hearts'];

    for(let suit = 0; suit < 4; suit++){
        deck.push('ace' + suits[suit]);
        for(let card = 2; card < 11; card++){
            deck.push(card + suits[suit]);
        }
        deck.push(
          'jack' + suits[suit],
          'queen' + suits[suit],
          'king' + suits[suit]
        );
    }

    cards_decks[id] = {
      'deck': deck,
      'drawn': [],
    };
    return deck;
}

function cards_reset(id){
    const drawn = cards_decks[id]['drawn'].length;
    for(let card = 0; card < drawn; card++){
        cards_decks[id]['deck'].push(cards_decks[id]['drawn'].pop());
    }
    return cards_decks[id]['deck'];
}

function cards_shuffle(id){
    const deck = cards_decks[id]['deck'];
    for(var card = deck.length - 1; card > 0; card--){
        const shuffled = Math.floor(Math.random() * (card + 1));
        const temp = deck[card];
        deck[card] = deck[shuffled];
        deck[shuffled] = temp;
    }
    return cards_decks[id]['deck'];
}

globalThis.cards_decks = {};
