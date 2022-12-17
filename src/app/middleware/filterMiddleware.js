const {
  includes,
  map,
  toUpper,
  forEach,
  isArray,
  isObject,
  words,
  startsWith,
} = require('lodash');
const { HttpResponse } = require('@helpers');
const { middlewareSlackBot } = require('@helpers/technicalErrorHelper');

const http = new HttpResponse();

const forbiddenTexts = [
  'drop',
  'alter',
  'delete',
  'update',
  'current_user',
  'BEGIN',
  'COMMIT',
  'owned',
  '--',
  'select',
  'pg_',
  'truncate',
  'insert',
  'create',
  'table',
  'execute',
  'function',
  'current_database',
  'REPLACE',
  'EXECUTE',
  'pgSQL',
  'RECONFIGURE',
  'EXEC',
  'end;--',
  'ROW_COUNT',
];

const pathsToIgnore = [
  '/api/v1/academic-documents/print/render',
  '/api/v1/academic-documents/print/render/certificate',
];

const filterValues = (obj) => {
  const forbiddenValues = map(forbiddenTexts, (t) => toUpper(t));

  const bodyKeys = Object.keys(obj);

  const searchText = (objVal, key) => {
    forEach(words(objVal, /[^, ]+/g), (val) => {
      if (forbiddenValues === toUpper(val))
        throw new Error(`Invalid data sent for ${key} ${objVal}`);

      forEach(forbiddenTexts, (fT) => {
        if (startsWith(val, 'pg_'))
          throw new Error(`Invalid data sent for ${key}: ${val}`);
      });
    });
  };

  forEach(bodyKeys, (key) => {
    const objectValue = obj[key];

    if (isArray(objectValue)) {
      forEach(objectValue, (t) => searchText(t, key));
    } else if (isObject(objectValue)) {
      filterValues(objectValue);
    } else searchText(objectValue, key);
  });
};
/**
 * ENSURE the Request Data does not contain Forbidden Texts
 *
 * @param {*} req Request Header.
 * @param {*} res Handle http Response.
 * @param {*} next continue to the next middleware if data is safe.
 *
 * @return {*} Return Json or next.
 */
const filterMiddleware = async (req, res, next) => {
  try {
    if (includes(pathsToIgnore, req.path)) return next();

    const requestBody = req.body;
    const requestQuery = req.query;
    const requestParams = req.params;

    if (requestBody) filterValues(requestBody);

    if (requestQuery) filterValues(requestQuery);

    if (requestParams) filterValues(requestParams);

    return next();
  } catch (error) {
    http.setError(400, error.message);
    await middlewareSlackBot(req, error.message);

    return http.send(res);
  }
};

module.exports = filterMiddleware;
