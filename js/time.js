'use strict';

function date_to_timestamp(date){
    if(date === void 0){
        date = timestamp_to_date();
    }

    return Date.UTC(
      date.year,
      date.month - 1,
      date.date,
      date.hour,
      date.minute,
      date.second,
      date.millisecond
    );
}

function time_diff({
  now = false,
  target,
} = {}){
    if(now === false){
        now = date_to_timestamp();
    }

    let diff = target - now;
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

function time_format({
  date = false,
  diff = false,
  milliseconds = false,
} = {}){
    if(date === false){
        date = timestamp_to_date();
    }

    if(diff){
        date.date -= 1;
        date.month -= 1;
        date.year -= 1970;
    }

    return core_digits_min({
        'number': date.year,
      }) + '-'
      + core_digits_min({
        'number': date.month,
      }) + '-'
      + core_digits_min({
        'number': date.date,
      }) + ' '
      + core_digits_min({
        'number': date.hour,
      }) + ':'
      + core_digits_min({
        'number': date.minute,
      }) + ':'
      + core_digits_min({
        'number': date.second,
      }) + (milliseconds
        ? '.' + core_digits_min({
            'digits': 3,
            'number': date.millisecond,
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
    const date = timestamp === void 0
      ? new Date()
      : new Date(timestamp);
    return {
      'date': date.getUTCDate(),
      'day': date.getUTCDay(),
      'hour': date.getUTCHours(),
      'millisecond': date.getUTCMilliseconds(),
      'minute': date.getUTCMinutes(),
      'month': date.getUTCMonth() + 1,
      'second': date.getUTCSeconds(),
      'timestamp': date.getTime(),
      'year': date.getUTCFullYear(),
    };
}
