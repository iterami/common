'use strict';

// Required args: id, src
// Optional args: todo
function images_new(args){
    args['todo'] = args['todo'] || function(){};

    var image = new Image();
    image.onload = args['todo'];
    image.src = args['src'];
    images_images[args['id']] = image;
    return image;
}

var images_images = {};
