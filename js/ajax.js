'use strict';

// Required args: url
// Optional args: todo, type
function ajax_query(args){
    args['todo'] = args['todo'] || false;
    args['type'] = args['type'] || 'GET';

    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function(){
        if(ajax.readyState === 4
          && ajax.status === 200){
            if(args['todo'] !== false){
                args['todo'](ajax.responseText);
            }
        }
    };

    ajax.open(
      args['type'],
      args['url']
    );
    ajax.send(null);
}
