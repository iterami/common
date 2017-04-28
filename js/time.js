'use strict';

// Optional args: date
function time_date_to_timestamp(args){
    args = core_args({
      'args': args,
      'defaults': {
        'date': time_timestamp_to_date(),
      },
    });

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
// Optional args: now
function time_diff(args){
    args = core_args({
      'args': args,
      'defaults': {
        'now': time_date_to_timestamp(),
      },
    });

    var diff = args['target'] - args['now'];
    var prefix = '';
    if(diff < 0){
        diff = -diff;
        prefix = '- ';
    }

    return prefix + time_format_date({
      'date': time_timestamp_to_date({
        'timestamp': diff,
      }),
      'diff': true,
    });
}

// Optional args: date, diff
function time_format_date(args){
    args = core_args({
      'args': args,
      'defaults': {
        'date': time_timestamp_to_date(),
        'diff': false,
      },
    });

    if(args['diff']){
        args['date']['date'] -= 1;
        args['date']['month'] -= 1;
        args['date']['year'] -= 1970;
    }

    return time_two_digits({
        'number': args['date']['year'],
      }) + '-'
      + time_two_digits({
        'number': args['date']['month'],
      }) + '-'
      + time_two_digits({
        'number': args['date']['date'],
      }) + ' '
      + time_two_digits({
        'number': args['date']['hour'],
      }) + ':'
      + time_two_digits({
        'number': args['date']['minute'],
      }) + ':'
      + time_two_digits({
        'number': args['date']['second'],
      });
}

function time_from_inputs(){
    var date = {
      'date': 0,
      'hour': 0,
      'millisecond': 0,
      'minute': 0,
      'month': 0,
      'second': 0,
      'year': 0,
    };
    for(var value in date){
        var element = document.getElementById(value);
        if(element){
            date[value] = parseInt(
              element.value,
              10
            );
        }

        if(isNaN(date[value])){
            date[value] = 0;
        }
    }

    return time_date_to_timestamp({
      'date': date,
    });
}

// Optional args: timestamp
function time_timestamp_to_date(args){
    args = core_args({
      'args': args,
    });
    args['timestamp'] = args['timestamp'] !== void 0
      ? new Date(args['timestamp']).getTime()
      : new Date().getTime();

    var date = new Date(args['timestamp']);
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

// Required args: number
function time_two_digits(args){
    var prefix = args['number'] < 0
      ? '-'
      : '';
    args['number'] = Math.abs(args['number']);

    return prefix + (args['number'].toString().length < 2
      ? '0' + args['number']
      : args['number']);
}
