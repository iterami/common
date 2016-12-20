'use strict';

// Required args: string
// Optional args: flags
function string_format_html(args){
    args['flags'] = args['flags'] || string_flags;

    return string_replace_multiple({
      'flags': args['flags'],
      'patterns': {
        '&': '&amp;',
        '\'': '&apos;',
        '>': '&gt;',
        '<': '&lt;',
        '"': '&quot;',
        '\n\r': '<br>',
      },
      'string': args['string'],
    });
}

// Required args: patterns, string
// Optional args: flags
function string_replace_multiple(args){
    args['flags'] = args['flags'] || string_flags;

    for(var pattern in args['patterns']){
        args['string'] = args['string'].replace(
          new RegExp(
            pattern,
            args['flags']
          ),
          args['patterns'][pattern]
        );
    }

    return args['string'];
}

var string_flags = 'g';
