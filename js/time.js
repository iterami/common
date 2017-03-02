'use strict';

// Optional args: date
function time_date_to_timestamp(args){
    args = args || {};
    args['date'] = args['date'] || time_timestamp_to_date();

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

// Optional args: date
function time_format_date(args){
    args = args || {};
    args['date'] = args['date'] || time_timestamp_to_date();

    return args['date']['year'] + '-'
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
      }) + ' ('
      + time_two_digits({
        'number': args['date']['timezone'],
      }) + ')';
}

// Optional args: timestamp
function time_timestamp_to_date(args){
    args = args || {};
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
