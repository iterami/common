'use strict';

// Required args: todo, url
// Optional args: type
function network_ajax(args){
    args['type'] = args['type'] || network_ajax_type;

    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function(){
        if(this.readyState === network_ajax_readyState
          && this.status === network_ajax_status){
            args['todo'](this.responseText);
        }
    };

    ajax.open(
      args['type'],
      args['url']
    );
    ajax.send(null);
}

var network_ajax_readyState = 4;
var network_ajax_status = 200;
var network_ajax_type = 'GET';
