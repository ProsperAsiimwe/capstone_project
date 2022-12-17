const { isArray, isEmpty, toString, toUpper, split, trim } = require('lodash');

const validateSheetColumns = (sheetRow, columns, errorMessage) => {
  if (isArray(columns)) {
    columns.forEach((column) => {
      const splitWise = split(column, '|');

      let dataCount = 0;

      for (const columnName of splitWise) {
        if (!isEmpty(toString(sheetRow[trim(columnName)]))) dataCount++;
      }

      if (dataCount < 1) {
        throw new Error(
          toUpper(
            `Column ${splitWise.join(' OR ')} is required ${
              errorMessage ? `for ${errorMessage}` : ''
            }`
          )
        );
      }
    });
  }
};

const validateSheetColumns2 = (sheetRow, columns, http, res, errorMessage) => {
  if (isArray(columns)) {
    columns.forEach((column) => {
      if (isEmpty(toString(sheetRow[column]))) {
        http.setError(400, 'Invalid token provided.', {
          error: `Please Enter data in ${column} column ${
            errorMessage ? `for ${errorMessage}` : ''
          }`,
        });

        return http.send(res);
      }
    });
  }
};

module.exports = { validateSheetColumns, validateSheetColumns2 };
