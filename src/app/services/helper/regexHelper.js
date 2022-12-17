const { toUpper, forEach, words, startsWith } = require('lodash');

const regexFunction = (errorData) => {
  const errorCodes = [
    ';',
    ')',
    '(',
    'drop',
    'alter',
    'delete',
    'update',
    'current_user',
    'BEGIN',
    'COMMIT',
    'owned',
    '*',
    '--',
    'select',
    'case',
    'when',
    '#',
    'truncate',
    // 'or',
    'union',
    'insert',
    'like',
    'create',
    'view',
    'table',
    'execute',
    'function',
    'pg_exec',
    'current_database',
    'REPLACE',
    'EXECUTE',
    'LANGUAGE',
    'pgSQL',
    'pg_',
    'sleep',
    'pg_sleep',
  ];

  const forbiddenWords = Object.values(errorData);

  for (let i = 0; i < errorCodes.length; i++) {
    forEach(words(forbiddenWords), (forbiddenWord) => {
      if (
        toUpper(forbiddenWord).includes(toUpper(errorCodes[i])) ||
        startsWith(forbiddenWord, errorCodes[i])
      ) {
        throw new Error(
          `current transaction is aborted, <> FORBIDDEN:${errorCodes[i]}`
        );
      }
    });
  }
};

module.exports = {
  regexFunction,
};
