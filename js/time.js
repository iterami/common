'use strict';

function date_to_timestamp(args){
    args = core_args({
      'args': args,
      'defaults': {
        'date': false,
      },
    });

    if(args['date'] === false){
        args['date'] = timestamp_to_date();
    }

    return new Date(
      Date.UTC(
        args['date']['year'],
        args['date']['month'] - 1,
        args['date']['date'],
        args['date']['hour'],
        args['date']['minute'],
        args['date']['second'],
        args['date']['millisecond']
      )
    ).getTime();
}

// Required args: target
function time_diff(args){
    args = core_args({
      'args': args,
      'defaults': {
        'now': false,
      },
    });

    if(args['now'] === false){
        args['now'] = date_to_timestamp();
    }

    let diff = args['target'] - args['now'];
    let prefix = '';
    if(diff < 0){
        diff = -diff;
        prefix = '- ';
    }

    return prefix + time_format({
      'date': timestamp_to_date({
        'timestamp': diff,
      }),
      'diff': true,
    });
}

function time_format(args){
    args = core_args({
      'args': args,
      'defaults': {
        'date': false,
        'diff': false,
      },
    });

    if(args['date'] === false){
        args['date'] = timestamp_to_date();
    }

    if(args['diff']){
        args['date']['date'] -= 1;
        args['date']['month'] -= 1;
        args['date']['year'] -= 1970;
    }

    return core_digits_min({
        'number': args['date']['year'],
      }) + '-'
      + core_digits_min({
        'number': args['date']['month'],
      }) + '-'
      + core_digits_min({
        'number': args['date']['date'],
      }) + ' '
      + core_digits_min({
        'number': args['date']['hour'],
      }) + ':'
      + core_digits_min({
        'number': args['date']['minute'],
      }) + ':'
      + core_digits_min({
        'number': args['date']['second'],
      });
}

function time_from_inputs(){
    const date = {
      'date': 0,
      'hour': 0,
      'millisecond': 0,
      'minute': 0,
      'month': 0,
      'second': 0,
      'year': 0,
    };
    for(const value in date){
        const element = document.getElementById(value);
        if(!element){
            continue;
        }

        date[value] = Number.parseInt(
          element.value,
          10
        );

        if(Number.isNaN(date[value])){
            date[value] = 0;
        }
    }

    return date_to_timestamp({
      'date': date,
    });
}

function timestamp_to_date(args){
    args = core_args({
      'args': args,
    });
    args['timestamp'] = args['timestamp'] !== void 0
      ? new Date(args['timestamp']).getTime()
      : new Date().getTime();

    const date = new Date(args['timestamp']);
    return {
      'date': date.getUTCDate(),
      'day': date.getUTCDay(),
      'hour': date.getUTCHours(),
      'millisecond': date.getUTCMilliseconds(),
      'minute': date.getUTCMinutes(),
      'month': date.getUTCMonth() + 1,
      'second': date.getUTCSeconds(),
      'timestamp': args['timestamp'],
      'year': date.getUTCFullYear(),
    };
}
