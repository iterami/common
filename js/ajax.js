'use strict';

// Required args: todo, url
// Optional args: type
function ajax_request(args){
    args['type'] = args['type'] || 'GET';

    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function(){
        if(ajax.readyState === ajax_readyState
          && ajax.status === ajax_status){
            args['todo'](ajax.responseText);
        }
    };

    ajax.open(
      args['type'],
      args['url']
    );
    ajax.send(null);
}

var ajax_readyState = 4;
var ajax_status = 200;
