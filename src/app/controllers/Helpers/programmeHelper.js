const {
  isArray,
  find,
  isEmpty,
  orderBy,
  toUpper,
  toString,
  trim,
  map,
  filter,
} = require('lodash');

/**
 *
 * @param {*} metadataValues
 * @param {*} metadataValueKey
 * @param {*} metadataKey
 * @param {*} programmeTitle
 * @returns
 */
const getMetadataValueId = (
  metadataValues,
  metadataValueKey,
  metadataKey,
  programmeTitle
) => {
  const checkValue = metadataValues.find(
    (metadataValue) =>
      toUpper(trim(metadataValue.metadata_value)) ===
        toUpper(trim(metadataValueKey)) &&
      toUpper(trim(metadataValue.metadata.metadata_name)) ===
        toUpper(trim(metadataKey))
  );

  if (checkValue) return checkValue.id;
  throw new Error(
    `Cannot find ${metadataValueKey} in ${metadataKey} ${
      programmeTitle ? ` for ${programmeTitle}` : ''
    }`
  );
};

/**
 * GET METADATA ID FROM NAME
 *
 * @param {*} metadataValues
 * @param {*} metadataValueKey
 * @param {*} metadata
 * @returns
 */
const getMetadataValueIdFromName = (
  metadataValues,
  metadataValueKey,
  metadata
) => {
  const checkValue = find(
    metadataValues,
    (metadataValue) =>
      toUpper(trim(metadataValue.metadata_value)) ===
      toUpper(trim(metadataValueKey))
  );

  if (checkValue) return checkValue.id;
  throw new Error(`Cannot find ${metadataValueKey} in ${metadata}`);
};

/**
 *
 * @param {*} metadataValues
 * @param {*} metadataValueKey
 * @param {*} otherMetadataValueKey
 * @param {*} metadataKey
 * @param {*} programmeTitle
 * @returns
 */
const getMetadataValueIdForFacultiesOrSchools = (
  metadataValues,
  metadataValueKey,
  otherMetadataValueKey,
  metadataKey
) => {
  const checkMetadataValueKey = metadataValues.find(
    (metadataValue) =>
      toUpper(trim(metadataValue.metadata_value)) ===
        toUpper(trim(metadataValueKey)) &&
      toUpper(trim(metadataValue.metadata.metadata_name)) ===
        toUpper(trim(metadataKey))
  );

  if (!checkMetadataValueKey) {
    const checkOtherMetadataValueKey = metadataValues.find(
      (metadataValue) =>
        toUpper(trim(metadataValue.metadata_value)) ===
          toUpper(trim(otherMetadataValueKey)) &&
        toUpper(trim(metadataValue.metadata.metadata_name)) ===
          toUpper(trim(metadataKey))
    );

    if (!checkOtherMetadataValueKey) {
      throw new Error(
        `Cannot find ${metadataValueKey} or ${otherMetadataValueKey} in ${metadataKey} 
        }`
      );
    } else {
      return checkOtherMetadataValueKey.id;
    }
  } else {
    return checkMetadataValueKey.id;
  }
};

/**
 *
 * @param {*} metadataValues
 * @param {*} metadataValueId
 * @param {*} metadataKey
 * @param {*} programmeTitle
 * @returns
 */
const getMetadataValueName = (
  metadataValues,
  metadataValueId,
  metadataKey,
  programmeTitle
) => {
  const checkValue = metadataValues.find(
    (metadataValue) =>
      parseInt(metadataValue.id, 10) === parseInt(metadataValueId, 10) &&
      toUpper(trim(metadataValue.metadata.metadata_name)) ===
        toUpper(trim(metadataKey))
  );

  if (checkValue) return checkValue.metadata_value;
  throw new Error(
    `Cannot find the metadata value you are looking among the ${metadataKey} ${
      programmeTitle ? ` for ${programmeTitle}` : ''
    }`
  );
};

/**
 * GET METADATA VALUES FOR EXCEL JS ROWS
 *
 * @param {*} metadata
 * @param {*} metadataKey
 * @param {*} permutations
 * @returns
 */
const getMetadataValues = (metadata, metadataKey, permutations = false) => {
  let values = [];

  if (isArray(metadata)) {
    const findMetadata = metadata.filter(
      (meta) => meta.metadata_name === metadataKey
    );

    if (findMetadata) {
      values = map(findMetadata, (meta) => [
        meta.metadataValues.metadata_value,
      ]);
    }
  }

  if (isEmpty(values))
    throw new Error(
      `No values have been defined for ${metadataKey} in the Metadata`
    );

  if (permutations === true) {
    const permutedValues = arrayPermutations(values);

    return permutedValues;
  }

  return values;
};

/**
 *
 * @param {*} metadataValues
 * @param {*} value
 * @param {*} metadata
 * @param {*} program
 * @returns
 */
const getArrayMetadataValues = (metadataValues, value, metadata, program) => {
  const arrayValues = [];

  if (value) {
    const splittedText = toString(value).split(',');

    splittedText.forEach((text) =>
      arrayValues.push(
        getMetadataValueId(metadataValues, text, metadata, program)
      )
    );
  }

  return arrayValues;
};

/**
 * GET METADATA VALUES GROUPED BY METADATA KEY
 *
 * @param {*} metadataValues
 * @param {*} metadataKey
 * @returns array
 */
const getArrayMetadataValuesFromMetadata = (metadataValues, metadataKey) => {
  const results = filter(
    metadataValues,
    (value) => value.metadata.metadata_name === toUpper(metadataKey)
  );

  return results;
};

/**
 * GET INSTITUTION REMARK ID
 *
 * @param {*} institutionRemarks
 * @param {*} remarkCode
 * @returns json
 */

const getInstitutionRemark = (institutionRemarks, remarkCode) => {
  const result = find(
    institutionRemarks,
    (remark) => toUpper(remark.metadata_value) === toUpper(remarkCode)
  );

  if (!result)
    throw new Error(
      `No Result Remark ${toUpper(remarkCode)} has been defined in Metadata.`
    );

  return result;
};

/**
 *
 * @param {*} allSpecializations
 * @param {*} specializations
 * @param {*} programmeTitle
 * @returns
 */
const getSpecializations = (
  allSpecializations,
  specializations,
  programmeTitle
) => {
  let specs = [];

  if (!isEmpty(specializations)) {
    specs = toString(specializations)
      .split(',')
      .map((spec) => {
        const matchedSpecs = allSpecializations.find(
          (specialization) =>
            toUpper(trim(specialization.specialization_title)) ===
            toUpper(trim(spec))
        );

        if (!matchedSpecs)
          throw new Error(
            `Cannot find Specialization ${spec} for programme ${programmeTitle}.`
          );

        return parseInt(matchedSpecs.id, 10);
      });
  }

  return specs;
};

/**
 *
 * @param {*} departments
 * @param {*} departmentTitle
 * @param {*} programmeTitle
 * @returns
 */
const getDepartment = (departments, departmentTitle, programmeTitle) => {
  const findDepartment = departments.find(
    (department) =>
      toUpper(trim(department.department_title)) ===
      toUpper(trim(departmentTitle))
  );

  if (findDepartment) return parseInt(findDepartment.id, 10);

  throw new Error(
    `Cannot find Department ${departmentTitle} ${
      programmeTitle ? ` for ${programmeTitle}` : ''
    }`
  );
};

/**
 *
 * @param {*} departments
 * @param {*} value
 * @param {*} programmeTitle
 * @param {*} user
 * @returns
 */
const fetchOtherDepartments = (departments, value, programmeTitle) => {
  const splittedText = !isEmpty(value) ? value.split(',') : [];
  const arrayValues = [];

  splittedText.forEach((text) => {
    const checkValue = departments.find(
      (dept) => toUpper(dept.department_code) === toUpper(text.trim())
    );

    if (!checkValue) {
      throw new Error(
        `Unable To Find A Department With Code ${text.trim()} For Programme ${programmeTitle}.`
      );
    }

    arrayValues.push(parseInt(checkValue.id, 10));
  });

  return arrayValues;
};

/**
 *
 * @param {*} arrayList
 * @returns
 */
const arrayPermutations = (arrayList) => {
  const result = [];

  const f = (prefix, chars) => {
    for (let i = 0; i < chars.length; i++) {
      result.push(`${chars[i]}, ${prefix}`);
      f(`${chars[i]}, ${prefix}`, chars.slice(i + 1));
    }
  };

  f('', arrayList);

  // return A,B,C,D.....
  return orderBy(result.map((list) => [list.replace(/, $/, '')]));
};

/**
 *
 * @param {*} metadataValues
 * @param {*} metadataValueKey
 * @param {*} metadataKey
 * @param {*} programmeTitle
 * @returns
 */
const getMetadataValueIdWithoutError = (
  metadataValues,
  metadataValueKey,
  metadataKey,
  programmeTitle
) => {
  const checkValue = metadataValues.find(
    (metadataValue) =>
      toUpper(trim(metadataValue.metadata_value)) ===
        toUpper(trim(metadataValueKey)) &&
      toUpper(trim(metadataValue.metadata.metadata_name)) ===
        toUpper(trim(metadataKey))
  );

  if (checkValue) {
    return checkValue.id;
  } else {
    return null;
  }
};

module.exports = {
  getMetadataValueId,
  getMetadataValueIdFromName,
  getMetadataValueIdForFacultiesOrSchools,
  getMetadataValueName,
  getMetadataValues,
  getArrayMetadataValues,
  getSpecializations,
  getDepartment,
  arrayPermutations,
  fetchOtherDepartments,
  getMetadataValueIdWithoutError,
  getArrayMetadataValuesFromMetadata,
  getInstitutionRemark,
};
