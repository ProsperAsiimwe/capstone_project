const errorFunction = (errorData) => {
  const err = errorData.original;

  const errorCodes = {
    '08003': 'connection_does_not_exist',
    '08006': 'connection_failure',
    '2F002': 'modifying_sql_data_not_permitted',
    '57P03': 'cannot_connect_now',
    42601: 'syntax_error',
    42501: 'insufficient_privilege',
    42602: 'invalid_name',
    42622: 'name_too_long',
    42939: 'reserved_name',
    42703: 'undefined_column',
    42000: 'syntax_error_or_access_rule_violation',
    '42P01': 'undefined_table',
    '42P02': 'undefined_parameter',
    42883: 'undefined function',
  };

  let error = {};

  let message = '';

  //   if (err === undefined) {
  //     message = 'No errors returned from Postgres'
  //   } else {
  //     if (err.message !== undefined) {
  //       message = `ERROR message:`, err.message
  //     }

  // if (err.code !== undefined) {
  //   message = 'Postgres error code:', err.code

  //   if (errorCodes[err.code] !== undefined) {
  //   message = 'Error code details:', errorCodes[err.code]
  //   }

  // }

  // console.log('errror', error.original);
  // const err = error.original;

  // if (err.code === '42883') {
  //   // return the position of the SQL syntax error
  //   console.log('SQL syntax error position:', err.position);
  // }

  if (err.code === '42883') {
    message = 'Unexpected System Error(No error returned)-Please Contact Admin';
    error = { message };
  }

  return error;
};

module.exports = {
  errorFunction,
};
