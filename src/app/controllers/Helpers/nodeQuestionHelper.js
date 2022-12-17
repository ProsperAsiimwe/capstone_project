const { toUpper } = require('lodash');

/**
 *
 * @param {*} data
 */
const numericQuestionsHandler = function (data) {
  const result = [];

  let start = parseInt(data.questions_from, 10);

  const stop = parseInt(data.questions_to, 10);

  for (start; start <= stop; start++) {
    result.push({
      question: start.toString(),
    });
  }

  return result;
};

/**
 *
 * @param {*} data
 */
const romanNumeralsQuestionsHandler = function (data) {
  const result = [];

  let start = parseInt(data.questions_from, 10);

  const stop = parseInt(data.questions_to, 10);

  for (start; start <= stop; start++) {
    const roman = convertToRoman(start);

    result.push({
      question: roman.toString(),
    });
  }

  return result;
};

/**
 *
 * @param {*} data
 */
const alphabetQuestionsHandler = function (data) {
  const result = [];

  const alphabet = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ];

  let start = alphabet.indexOf(toUpper(data.questions_from));

  const stop = alphabet.indexOf(toUpper(data.questions_to));

  if (start < 0) {
    throw new Error(
      `Unable To Find ${toUpper(data.questions_from)} On The English Alphabet.`
    );
  }

  if (stop < 0) {
    throw new Error(
      `Unable To Find ${toUpper(data.questions_to)} On The English Alphabet.`
    );
  }

  for (start; start <= stop; start++) {
    const quest = alphabet[start];

    result.push({
      question: quest.toString(),
    });
  }

  return result;
};

/**
 *
 * @param {*} num
 * @returns
 */
const convertToRoman = function (num) {
  let numeral = '';

  const arr = [
    { number: 1, roman: 'I' },
    { number: 4, roman: 'IV' },
    { number: 5, roman: 'V' },
    { number: 9, roman: 'IX' },
    { number: 10, roman: 'X' },
    { number: 40, roman: 'XL' },
    { number: 50, roman: 'L' },
    { number: 90, roman: 'XC' },
    { number: 100, roman: 'C' },
    { number: 400, roman: 'CD' },
    { number: 500, roman: 'D' },
    { number: 900, roman: 'CM' },
    { number: 1000, roman: 'M' },
  ];

  while (num > 0) {
    const searching = arr.filter((myArr) => myArr.number <= num);

    const latest = searching.pop();
    const full = Math.floor(num / latest.number);

    for (let i = 0; i < full; i++) {
      numeral += latest.roman;
    }
    num = num % latest.number;
  }

  return numeral;
};

module.exports = {
  numericQuestionsHandler,
  romanNumeralsQuestionsHandler,
  alphabetQuestionsHandler,
  convertToRoman,
};
