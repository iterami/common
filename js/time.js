'use strict';

// Optional args: date
function time_date_to_timestamp(args){
    args = args || {};
    args['date'] = args['date'] || time_timestamp_to_date();

    return new Date(
      Date.UTC(
        args['date']['year'],
        args['date']['month'],
        args['date']['day'],
        args['date']['hour'],
        args['date']['minute'],
        args['date']['second']
      )
    );
}

// Optional args: date
function time_format_date(args){
    args = args || {};
    args['date'] = args['date'] || time_create_date();

    return args['date']['year'] + '-'
      + args['date']['month'] + '-'
      + args['date']['day'] + ' '
      + args['date']['hour'] + ':'
      + args['date']['minute'] + ':'
      + args['date']['second'] + ' ('
      + args['date']['timezone'] + ')';
}

// Optional args: timestamp
function time_timestamp_to_date(args){
    args = args || {};
    args['timestamp'] = args['timestamp'] !== void 0
      ? new Date(args['timestamp'])
      : new Date().getTime();

    var date = new Date(args['timestamp']);
    return {
      'day': time_two_digits({
        'number': date.getUTCDate(),
      }),
      'hour': time_two_digits({
        'number': date.getUTCHours(),
      }),
      'minute': time_two_digits({
        'number': date.getUTCMinutes(),
      }),
      'month': time_two_digits({
        'number': date.getUTCMonth(),
      }),
      'second': time_two_digits({
        'number': date.getUTCSeconds(),
      }),
      'timezone': 0,
      'year': date.getUTCFullYear(),
    };
}

// Required args: number
function time_two_digits(args){
    return args['number'].toString().length < 2
      ? '0' + args['number']
      : args['number'];
}
