const {
  capitalize,
  toLower,
  toUpper,
  words,
  forEach,
  replace,
  isEmpty,
  find,
  split,
} = require('lodash');

const wordsToLowerCase = [
  'OF',
  'WITH',
  'AND',
  'OR',
  'FOR',
  'WITHOUT',
  'A',
  'ANA',
  'IS',
  'WAS',
  'WAS',
  'BE',
  'AT',
  'AFF',
  'BY',
  'ON',
  'DOWN',
  'ONTO',
  'OVER',
  'FROM',
  'PAST',
  'IN',
  'TO',
  'INTO',
  'UPON',
  'NEAR',
  'SO',
  'AS',
  'THAN',
  'BUT',
  'THAT',
  'TILL',
  'IF',
  'WHEN',
  'NOR',
  'YET',
  'ONCE',
  'UP',
  'II',
  'THE',
];

const wordsToUppercase = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'ICT',
  'CVS',
  'CVS,',
  'GIT',
  'IT',
  'CSOS',
];

/**
 * Capitalize Each word of the text
 *
 * @param {*} text - String to convert
 * @returns string - capitalized word
 */
const capitalizedText = (text) => {
  const findHyphen = text.match(/-/g);

  if (findHyphen) {
    return split(text, '-')
      .map((hText) => capitalizedText(hText))
      .join('-');
  }

  const newText = split(text, ' ')
    .map((w, index) => {
      if (find(wordsToUppercase, (wtp) => wtp === toUpper(w))) {
        return toUpper(w);
      } else if (wordsToLowerCase.includes(toUpper(w)) && index !== 0) {
        return toLower(w);
      }

      return capitalize(w);
    })
    .join(' ');

  return newText;
};

/**
 * CONVERT and Capitalize Words
 *
 * @param {*} textToConvert
 * @returns string
 */
const capitalizeWords = (textToConvert) => {
  if (isEmpty(textToConvert)) return textToConvert;

  const findBrackets = textToConvert.match(/\(.+?\)/g);

  const bracketText = [];

  if (findBrackets) {
    let oldText = textToConvert;

    forEach(findBrackets, (b, index) => {
      oldText = replace(oldText, b, `${index * 100 + 500}`);
      bracketText.push(words(b).join(' '));
    });

    const capitalizeText = capitalizedText(oldText);

    let convertedWords = capitalizeText;

    forEach(
      bracketText,
      (bT, index) =>
        (convertedWords = replace(
          capitalizeText,
          `${index * 100 + 500}`,
          `(${capitalizedText(bT)})`
        ))
    );

    return convertedWords;
  } else return capitalizedText(textToConvert);
};

module.exports = {
  wordsToLowerCase,
  wordsToUppercase,
  capitalizeWords,
  capitalizedText,
};
