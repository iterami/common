'use strict';

// Required args: todo, url
// Optional args: data, type
function network_ajax(args){
    args = core_args({
      'args': args,
      'defaults': {
        'data': network_ajax_data,
        'type': network_ajax_type,
      },
    });

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
    ajax.send(args['data']);
}

var network_ajax_data = null;
var network_ajax_readyState = 4;
var network_ajax_status = 200;
var network_ajax_type = 'GET';
