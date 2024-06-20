'use strict';

function date_to_timestamp(date){
    if(date === void 0){
        date = timestamp_to_date();
    }

    return new Date(
      Date.UTC(
        date['year'],
        date['month'] - 1,
        date['date'],
        date['hour'],
        date['minute'],
        date['second'],
        date['millisecond']
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
      'date': timestamp_to_date(diff),
      'diff': true,
    });
}

function time_format(args){
    args = core_args({
      'args': args,
      'defaults': {
        'date': false,
        'diff': false,
        'milliseconds': false,
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
      }) + (args['milliseconds']
        ? '.' + core_digits_min({
            'digits': 3,
            'number': args['date']['millisecond'],
          })
        : '');
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
        const element = core_getelement(value);
        if(!element){
            continue;
        }

        date[value] = Number.parseInt(
          element.value,
          10
        );

        if(globalThis.isNaN(date[value])){
            date[value] = 0;
        }
    }

    return date_to_timestamp(date);
}

function timestamp_to_date(timestamp){
    timestamp = timestamp !== void 0
      ? new Date(timestamp).getTime()
      : new Date().getTime();

    const date = new Date(timestamp);
    return {
      'date': date.getUTCDate(),
      'day': date.getUTCDay(),
      'hour': date.getUTCHours(),
      'millisecond': date.getUTCMilliseconds(),
      'minute': date.getUTCMinutes(),
      'month': date.getUTCMonth() + 1,
      'second': date.getUTCSeconds(),
      'timestamp': timestamp,
      'year': date.getUTCFullYear(),
    };
}
