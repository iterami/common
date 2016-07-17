'use strict';

function images_new(id, src, todo){
    var image = new Image();
    image.onload = todo || function(){};
    image.src = src;
    images_images[id] = image;
    return image;
}

var images_images = {};
