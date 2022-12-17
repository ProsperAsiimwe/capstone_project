const { getMetadataValueId } = require('@controllers/Helpers/programmeHelper');
const {
  resultAllocationNodeService,
  metadataValueService,
  nodeQuestionService,
} = require('@services/index');
const { isEmpty, uniqBy, flatten, trim, toUpper, sumBy } = require('lodash');
const moment = require('moment');

/**
 *
 * @param {*} data
 * @param {*} node
 * @param {*} formattedMarks
 * @param {*} nodeId
 * @param {*} user
 * @param {*} studentProgrammes
 * @param {*} assessment
 * @param {*} transaction
 * @returns
 */
const handleUploadToNodeWithoutChildren = async function (
  data,
  node,
  formattedMarks,
  nodeId,
  user,
  studentProgrammes,
  assessment,
  transaction
) {
  const uploadedMarks = [];
  const nodeUpdateData = {};

  if (assessment === 'total_mark') {
    // If the node has a parent
    if (node.parentNode) {
      for (const mark of formattedMarks) {
        if (!mark['STUDENT NAME']) {
          throw new Error(
            `One Of The Records Provided Has Been Uploaded Without A Student.`
          );
        }

        if (!mark['STUDENT NUMBER']) {
          throw new Error(
            `Student ${mark['STUDENT NAME']} has no student number.`
          );
        }

        if (!mark['REG. NUMBER']) {
          throw new Error(
            `Student ${mark['STUDENT NAME']} has no registration number.`
          );
        }

        data.student_programme_id = getStudentProgramme(
          mark['STUDENT NUMBER'],
          mark['REG. NUMBER'],
          mark['STUDENT NAME'],
          studentProgrammes
        );

        data.result_allocation_node_id = node.id;

        if (
          !mark[
            `${node.node_name} MARK (OUT OF ${node.percentage_contribution})`
          ]
        ) {
          throw new Error(
            `Record With Student ${mark['STUDENT NAME']} Has No ${node.node_name} MARK (OUT OF ${node.percentage_contribution}).`
          );
        }

        if (
          parseFloat(
            mark[
              `${node.node_name} MARK (OUT OF ${node.percentage_contribution})`
            ]
          ) > parseFloat(node.percentage_contribution)
        ) {
          throw new Error(
            `${node.node_name} Score Of Student ${mark['STUDENT NAME']} Has To Be Less Than Or Equal To ${node.percentage_contribution}.`
          );
        }

        data.marks = parseFloat(
          mark[
            `${node.node_name} MARK (OUT OF ${node.percentage_contribution})`
          ]
        );

        const upload = await insertNewNodeMark(data, transaction);

        if (upload[1] === true) {
          uploadedMarks.push(upload[0].dataValues);
        }
      }

      nodeUpdateData.marks_uploaded = true;
      nodeUpdateData.marks_upload_date = moment.now();
      nodeUpdateData.is_computed = true;

      await resultAllocationNodeService.updateResultAllocationNode(
        nodeId,
        nodeUpdateData,
        transaction
      );

      if (!isEmpty(uploadedMarks)) {
        const parent = node.parentNode;

        if (parent) {
          // If the node has a parent then it could be having other siblings

          await handleUploadingASiblingNode(
            parent,
            node,
            uploadedMarks,
            user,
            transaction
          );
        }
      }
    } else {
      // the node has no parents meaning it is the final mark node
      for (const mark of formattedMarks) {
        if (!mark['STUDENT NAME']) {
          throw new Error(
            `One Of The Records Provided Has Been Uploaded Without A Student.`
          );
        }
        if (!mark['STUDENT NUMBER']) {
          throw new Error(
            `Student ${mark['STUDENT NAME']} has no student number.`
          );
        }

        if (!mark['REG. NUMBER']) {
          throw new Error(
            `Student ${mark['STUDENT NAME']} has no registration number.`
          );
        }

        data.student_programme_id = getStudentProgramme(
          mark['STUDENT NUMBER'],
          mark['REG. NUMBER'],
          mark['STUDENT NAME'],
          studentProgrammes
        );

        data.result_allocation_node_id = node.id;

        if (
          !mark[
            `${node.node_name} MARK (OUT OF ${node.percentage_contribution})`
          ]
        ) {
          throw new Error(
            `Record With Student ${mark['STUDENT NAME']} Has No ${node.node_name} MARK (OUT OF ${node.percentage_contribution}).`
          );
        }

        if (
          parseFloat(
            mark[
              `${node.node_name} MARK (OUT OF ${node.percentage_contribution})`
            ]
          ) > parseFloat(node.percentage_contribution)
        ) {
          throw new Error(
            `${node.node_name} Score Of Student ${mark['STUDENT NAME']} Has To Be Less Than Or Equal To ${node.percentage_contribution}.`
          );
        }

        data.marks = parseFloat(
          mark[
            `${node.node_name} MARK (OUT OF ${node.percentage_contribution})`
          ]
        );

        if (!node.pass_mark) {
          throw new Error(
            `Please Provide a Pass Mark for The Final Mark Node ${node.node_name}`
          );
        }

        if (data.marks < parseFloat(node.pass_mark)) {
          data.has_passed = false;
        } else {
          data.has_passed = true;
        }

        const upload = await insertNewNodeMark(data, transaction);

        uploadedMarks.push(upload);
      }

      nodeUpdateData.marks_uploaded = true;
      nodeUpdateData.marks_upload_date = moment.now();
      nodeUpdateData.is_computed = true;

      await resultAllocationNodeService.updateResultAllocationNode(
        nodeId,
        nodeUpdateData,
        transaction
      );
    }
  } else if (assessment === 'each_question') {
    const questions = await findNodeQuestions(nodeId);

    const marksPerQuestion = [];

    // If the node has a parent
    if (node.parentNode) {
      for (const mark of formattedMarks) {
        if (!mark['STUDENT NAME']) {
          throw new Error(
            `One Of The Records Provided Has Been Uploaded Without A Student.`
          );
        }

        if (!mark['STUDENT NUMBER']) {
          throw new Error(
            `Student ${mark['STUDENT NAME']} has no student number.`
          );
        }

        if (!mark['REG. NUMBER']) {
          throw new Error(
            `Student ${mark['STUDENT NAME']} has no registration number.`
          );
        }

        data.student_programme_id = getStudentProgramme(
          mark['STUDENT NUMBER'],
          mark['REG. NUMBER'],
          mark['STUDENT NAME'],
          studentProgrammes
        );

        data.result_allocation_node_id = node.id;

        questions.forEach((qn) => {
          if (mark[`QUESTION ${qn.question}`]) {
            marksPerQuestion.push({
              question: `QUESTION ${qn.question}`,
              mark: parseFloat(mark[`QUESTION ${qn.question}`]),
            });
          }
        });

        const totalMark = sumBy(marksPerQuestion, 'mark');

        if (parseFloat(totalMark) > parseFloat(node.percentage_contribution)) {
          throw new Error(
            `Total Score Of Student ${mark['STUDENT NAME']} Has To Be Less Than Or Equal To ${node.percentage_contribution}.`
          );
        }

        data.marks = parseFloat(totalMark);

        data.question_marks = JSON.stringify(marksPerQuestion);

        const upload = await insertNewNodeMark(data, transaction);

        if (upload[1] === true) {
          uploadedMarks.push(upload[0].dataValues);
        }
      }

      nodeUpdateData.marks_uploaded = true;
      nodeUpdateData.marks_upload_date = moment.now();
      nodeUpdateData.is_computed = true;

      await resultAllocationNodeService.updateResultAllocationNode(
        nodeId,
        nodeUpdateData,
        transaction
      );

      if (!isEmpty(uploadedMarks)) {
        const parent = node.parentNode;

        if (parent) {
          // If the node has a parent then it could be having other siblings

          await handleUploadingASiblingNode(
            parent,
            node,
            uploadedMarks,
            user,
            transaction
          );
        }
      }
    } else {
      // the node has no parents meaning it is the final mark node
      for (const mark of formattedMarks) {
        if (!mark['STUDENT NAME']) {
          throw new Error(
            `One Of The Records Provided Has Been Uploaded Without A Student.`
          );
        }
        if (!mark['STUDENT NUMBER']) {
          throw new Error(
            `Student ${mark['STUDENT NAME']} has no student number.`
          );
        }

        if (!mark['REG. NUMBER']) {
          throw new Error(
            `Student ${mark['STUDENT NAME']} has no registration number.`
          );
        }

        data.student_programme_id = getStudentProgramme(
          mark['STUDENT NUMBER'],
          mark['REG. NUMBER'],
          mark['STUDENT NAME'],
          studentProgrammes
        );

        data.result_allocation_node_id = node.id;

        questions.forEach((qn) => {
          if (mark[`QUESTION ${qn.question}`]) {
            marksPerQuestion.push({
              question: `QUESTION ${qn.question}`,
              mark: parseFloat(mark[`QUESTION ${qn.question}`]),
            });
          }
        });

        const totalMark = sumBy(marksPerQuestion, 'mark');

        if (parseFloat(totalMark) > parseFloat(node.percentage_contribution)) {
          throw new Error(
            `Total Score Of Student ${mark['STUDENT NAME']} Has To Be Less Than Or Equal To ${node.percentage_contribution}.`
          );
        }

        data.marks = parseFloat(totalMark);

        data.question_marks = JSON.stringify(marksPerQuestion);

        if (!node.pass_mark) {
          throw new Error(
            `Please Provide a Pass Mark for The Final Mark Node ${node.node_name}`
          );
        }

        if (data.marks < parseFloat(node.pass_mark)) {
          data.has_passed = false;
        } else {
          data.has_passed = true;
        }

        const upload = await insertNewNodeMark(data, transaction);

        uploadedMarks.push(upload);
      }

      nodeUpdateData.marks_uploaded = true;
      nodeUpdateData.marks_upload_date = moment.now();
      nodeUpdateData.is_computed = true;

      await resultAllocationNodeService.updateResultAllocationNode(
        nodeId,
        nodeUpdateData,
        transaction
      );
    }
  } else {
    throw new Error(
      'This Template Was Not Tagged With A Valid Marks Assessment Method. Try Downloading A New One.'
    );
  }

  return uploadedMarks;
};

/**
 *
 * @param {*} data
 * @param {*} node
 * @param {*} formattedMarks
 * @param {*} uploadedMarks
 * @param {*} nodeId
 * @param {*} user
 * @param {*} studentProgrammes
 * @param {*} transaction
 */
const handleUploadToNodeWithChildren = async function (
  data,
  node,
  formattedMarks,
  nodeId,
  user,
  studentProgrammes,
  transaction
) {
  const uploadedMarks = [];
  const updateChildNodeData = {};
  const updateParentNodeData = {};

  for (const mark of formattedMarks) {
    const nodeMarks = [];

    if (!mark['STUDENT NAME']) {
      throw new Error(
        `One Of The Records Provided Has Been Uploaded Without A Student.`
      );
    }

    if (!mark['STUDENT NUMBER']) {
      throw new Error(`Student ${mark['STUDENT NAME']} has no student number.`);
    }

    if (!mark['REG. NUMBER']) {
      throw new Error(
        `Student ${mark['STUDENT NAME']} has no registration number.`
      );
    }

    data.student_programme_id = getStudentProgramme(
      mark['STUDENT NUMBER'],
      mark['REG. NUMBER'],
      mark['STUDENT NAME'],
      studentProgrammes
    );

    for (const child of node.childNodes) {
      if (
        !mark[
          `${child.node_name} MARK (OUT OF ${child.percentage_contribution})`
        ]
      ) {
        throw new Error(
          `Record With Student ${mark['STUDENT NAME']} Has No ${child.node_name} MARK (OUT OF ${child.percentage_contribution}).`
        );
      }

      if (
        parseFloat(
          mark[
            `${child.node_name} MARK (OUT OF ${child.percentage_contribution})`
          ]
        ) > parseFloat(child.percentage_contribution)
      ) {
        throw new Error(
          `${child.node_name} Score Of Student ${mark['STUDENT NAME']} Has To Be Less Than Or Equal To ${child.percentage_contribution}.`
        );
      }

      nodeMarks.push(
        parseFloat(
          mark[
            `${child.node_name} MARK (OUT OF ${child.percentage_contribution})`
          ]
        )
      );

      const createChildNodeMarkData = {
        result_allocation_node_id: child.id,
        student_programme_id: data.student_programme_id,
        marks: parseFloat(
          mark[
            `${child.node_name} MARK (OUT OF ${child.percentage_contribution})`
          ]
        ),

        created_by_id: user,
      };

      updateChildNodeData.marks_uploaded = true;
      updateChildNodeData.marks_upload_date = moment.now();
      updateChildNodeData.is_computed = true;

      await resultAllocationNodeService.updateResultAllocationNode(
        child.id,
        updateChildNodeData,
        transaction
      );

      await insertNewNodeMark(createChildNodeMarkData, transaction);
    }

    data.marks = await computedMark(
      node.marks_computation_method_id,
      nodeMarks,
      node.node_name
    );

    data.result_allocation_node_id = node.id;

    if (!node.parent_node_id) {
      if (!node.pass_mark) {
        throw new Error(
          `Please Provide a Pass Mark for The Final Mark Node ${node.node_name}`
        );
      }

      if (parseFloat(data.marks) < parseFloat(node.pass_mark)) {
        data.has_passed = false;
      } else {
        data.has_passed = true;
      }
    }

    const upload = await insertNewNodeMark(data, transaction);

    uploadedMarks.push(upload);
  }

  updateParentNodeData.marks_uploaded = true;
  updateParentNodeData.marks_upload_date = moment.now();
  updateParentNodeData.is_computed = true;

  await resultAllocationNodeService.updateResultAllocationNode(
    nodeId,
    updateParentNodeData,
    transaction
  );

  return uploadedMarks;
};

/**
 *
 * @param {*} stdNumber
 * @param {*} regNumber
 * @param {*} student
 * @param {*} studentProgrammes
 * @returns
 */
const getStudentProgramme = function (
  stdNumber,
  regNumber,
  student,
  studentProgrammes
) {
  try {
    const checkValue = studentProgrammes.find(
      (stdProg) =>
        trim(toUpper(stdProg.registration_number)) ===
          trim(toUpper(regNumber)) &&
        trim(toUpper(stdProg.student_number)) === trim(toUpper(stdNumber)) &&
        stdProg.is_current_programme === true
    );

    if (checkValue) return parseInt(checkValue.id, 10);
    throw new Error(
      `The Unable To Find A Current Programme For ${student} Matching Student number: ${stdNumber} and Registration Number: ${regNumber}.`
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} parentNode
 * @param {*} node
 * @param {*} uploadedMarks
 * @param {*} user
 * @param {*} transaction
 */
const handleUploadingASiblingNode = async function (
  parentNode,
  node,
  uploadedMarks,
  user,
  transaction
) {
  // only keep objects in array where obj.id !== node.id
  parentNode.childNodes = parentNode.childNodes.filter(function (obj) {
    return parseInt(obj.id, 10) !== parseInt(node.id, 10);
  });

  parentNode.childNodes.push({
    id: node.id,
    node_code: node.node_code,
    node_name: node.node_name,
    is_submitted: node.is_submitted,
    parent_node_id: parentNode.id,
    percentage_contribution: node.percentage_contribution,
    node_lecturer_id: node.node_lecturer_id,
    marks_uploaded: true,
    pass_mark: node.pass_mark,
    nodeMarks: uploadedMarks,
  });

  const childrenWithMarks = parentNode.childNodes.filter(
    (child) => child.marks_uploaded === true
  );

  if (
    parseInt(childrenWithMarks.length, 10) ===
    parseInt(parentNode.childNodes.length, 10)
  ) {
    const cleanStudents = uniqBy(
      flatten(parentNode.childNodes.map((node) => node.nodeMarks)),
      'student_programme_id'
    );

    const formattedTemplate = cleanStudents.map((student) => {
      const findStudentNodeMarks = parentNode.childNodes.map((childNode) => {
        const findMarks = childNode.nodeMarks.find(
          (mark) =>
            parseInt(mark.student_programme_id, 10) ===
            parseInt(student.student_programme_id, 10)
        );

        return findMarks ? findMarks.marks : 0;
      });

      student.nodeMarks = findStudentNodeMarks;

      delete student.id;
      delete student.marks;
      delete student.result_allocation_node_id;
      delete student.registration_course_unit_id;
      delete student.has_passed;

      return student;
    });

    const data = {};
    const updateParentNodeData = {};

    data.created_by_id = user;

    for (const eachStudent of formattedTemplate) {
      data.result_allocation_node_id = parentNode.id;

      data.student_programme_id = eachStudent.student_programme_id;

      data.marks = await computedMark(
        parentNode.marks_computation_method_id,
        eachStudent.nodeMarks,
        parentNode.node_name
      );

      if (!parentNode.parent_node_id) {
        if (parseFloat(data.marks) < parseFloat(parentNode.pass_mark)) {
          data.has_passed = false;
        } else {
          data.has_passed = true;
        }
      }

      await insertNewNodeMark(data, transaction);
    }

    updateParentNodeData.marks_uploaded = true;
    updateParentNodeData.marks_upload_date = moment.now();
    updateParentNodeData.is_computed = true;

    await resultAllocationNodeService.updateResultAllocationNode(
      parentNode.id,
      updateParentNodeData,
      transaction
    );
  }
};

/**
 *
 * @param {*} node
 * @param {*} user
 * @param {*} transaction
 */
const handleManualComputationOfNode = async function (node, user, transaction) {
  if (!isEmpty(node.childNodes)) {
    const parentNode = node;

    parentNode.childNodes.forEach((child) => {
      if (child.marks_uploaded === false) {
        throw new Error(`Please upload marks for ${child.node_name}`);
      }
    });

    const cleanStudents = uniqBy(
      flatten(parentNode.childNodes.map((node) => node.nodeMarks)),
      'student_programme_id'
    );

    const formattedTemplate = cleanStudents.map((student) => {
      const findStudentNodeMarks = parentNode.childNodes.map((childNode) => {
        const findMarks = childNode.nodeMarks.find(
          (mark) =>
            parseInt(mark.student_programme_id, 10) ===
            parseInt(student.student_programme_id, 10)
        );

        return findMarks ? findMarks.marks : 0;
      });

      student.nodeMarks = findStudentNodeMarks;

      delete student.id;
      delete student.marks;
      delete student.result_allocation_node_id;
      delete student.registration_course_unit_id;
      delete student.has_passed;

      return student;
    });

    if (!parentNode.parent_node_id && !parentNode.pass_mark) {
      throw new Error(
        `Please provide the pass mark for ${parentNode.node_name}`
      );
    }

    const data = {};
    const updateParentNodeData = {};
    const result = [];

    data.created_by_id = user;

    for (const eachStudent of formattedTemplate) {
      data.result_allocation_node_id = parentNode.id;

      data.student_programme_id = eachStudent.student_programme_id;

      data.marks = await computedMark(
        parentNode.marks_computation_method_id,
        eachStudent.nodeMarks,
        parentNode.node_name
      );

      if (parseFloat(data.marks) < parseFloat(parentNode.pass_mark)) {
        data.has_passed = false;
      } else {
        data.has_passed = true;
      }

      const res = await insertNewNodeMark(data, transaction);

      result.push(res);
    }

    updateParentNodeData.marks_uploaded = true;
    updateParentNodeData.marks_upload_date = moment.now();
    updateParentNodeData.is_computed = true;

    await resultAllocationNodeService.updateResultAllocationNode(
      parentNode.id,
      updateParentNodeData,
      transaction
    );

    return result;
  }
};

/**
 *
 * @param {*} computationMethodId
 * @param {*} arrayOfMarks
 * @returns
 */
const computedMark = async function (
  computationMethodId,
  arrayOfMarks,
  parentName
) {
  const metadataValues = await metadataValueService.findAllMetadataValues({
    include: ['metadata'],
  });

  const summationId = getMetadataValueId(
    metadataValues,
    'SUMMATION',
    'MARKS COMPUTATION METHODS'
  );

  const averageId = getMetadataValueId(
    metadataValues,
    'AVERAGE',
    'MARKS COMPUTATION METHODS'
  );

  const bestDoneId = getMetadataValueId(
    metadataValues,
    'BEST DONE',
    'MARKS COMPUTATION METHODS'
  );

  const data = {};

  if (parseInt(computationMethodId, 10) === parseInt(summationId, 10)) {
    data.marks = arrayOfMarks.reduce((a, b) => a + b, 0).toPrecision(4);
  } else if (parseInt(computationMethodId, 10) === parseInt(averageId, 10)) {
    const summation = arrayOfMarks.reduce((a, b) => a + b, 0);

    const average = summation / arrayOfMarks.length;

    data.marks = average.toPrecision(4);
  } else if (parseInt(computationMethodId, 10) === parseInt(bestDoneId, 10)) {
    let largest = 0;

    for (let i = 0; i <= largest; i++) {
      if (arrayOfMarks[i] > largest) {
        largest = arrayOfMarks[i];
      }
    }

    data.marks = largest;
  } else {
    throw new Error(
      `${parentName} should pick a marks computation method from one of SUMMATION, AVERAGE OR BEST DONE.`
    );
  }

  return data.marks;
};

/**
 *
 * @param {*} data
 * @param {*} transaction
 */
const insertNewNodeMark = async function (data, transaction) {
  const result = await resultAllocationNodeService.createNodeMarks(
    data,
    transaction
  );

  return result;
};

/**
 *
 * @param {*} node
 * @param {*} user
 * @param {*} transaction
 * @param {*} key
 */
const handleSubmittingNode = async function (node, user, transaction, key) {
  // Handle submitting by lecturers
  if (key === 'LECTURER') {
    const update = {};

    if (node.marks_uploaded === false) {
      throw new Error(`Please upload marks for this node.`);
    }

    if (!node.childNodes) {
      await approveNodeMarks(
        {
          result_allocation_node_id: node.id,
          approved_by_lecturer: false,
        },
        {
          approved_by_lecturer: true,
          date_lecturer_approved: moment.now(),
        },
        transaction
      );

      update.is_submitted = true;
      update.submitted_by_id = user;
      update.approved_by_lecturer = true;
      update.date_lecturer_approved = moment.now();

      const result =
        await resultAllocationNodeService.updateResultAllocationNode(
          node.id,
          update,
          transaction
        );

      return result[1][0];
    } else {
      node.childNodes.forEach((child) => {
        if (child.marks_uploaded === false) {
          throw new Error(`Please upload marks for ${child.node_name}`);
        }

        if (child.is_submitted === false) {
          throw new Error(
            `Please submit ${child.node_name} first before approving ${node.node_name}`
          );
        }
      });

      for (const eachChildNode of node.childNodes) {
        await approveNodeMarks(
          {
            result_allocation_node_id: eachChildNode.id,
            approved_by_lecturer: false,
          },
          {
            approved_by_lecturer: true,
            date_lecturer_approved: moment.now(),
          },
          transaction
        );
      }

      update.is_submitted = true;
      update.submitted_by_id = user;
      update.approved_by_lecturer = true;
      update.date_lecturer_approved = moment.now();

      const result =
        await resultAllocationNodeService.updateResultAllocationNode(
          node.id,
          update,
          transaction
        );

      return result[1][0];
    }
  }
  // Handle Approval by HOD
  else if (key === 'HOD') {
    const update = {};

    if (node.is_submitted === false) {
      throw new Error('This node was not submitted for approval yet.');
    }

    if (!node.childNodes) {
      await approveNodeMarks(
        {
          result_allocation_node_id: node.id,
          is_submitted: true,
          approved_by_lecturer: true,
        },
        {
          approved_by_head: true,
          date_head_approved: moment.now(),
          head_of_department_id: user,
        },
        transaction
      );

      update.approved_by_head = true;
      update.date_head_approved = moment.now();
      update.head_of_department_id = user;

      const action =
        await resultAllocationNodeService.updateResultAllocationNode(
          node.id,
          update,
          transaction
        );

      return action[1][0];
    } else {
      node.childNodes.forEach((child) => {
        if (child.is_submitted === false) {
          throw new Error(
            `Please request the lecturer to first submit ${child.node_name}`
          );
        }

        if (child.approved_by_head === false) {
          throw new Error(
            `Please approve ${child.node_name} first before approving ${node.node_name}`
          );
        }
      });

      for (const eachChildNode of node.childNodes) {
        await approveNodeMarks(
          {
            result_allocation_node_id: eachChildNode.id,
            is_submitted: true,
            approved_by_lecturer: true,
          },
          {
            approved_by_head: true,
            date_head_approved: moment.now(),
            head_of_department_id: user,
          },
          transaction
        );
      }

      update.approved_by_head = true;
      update.date_head_approved = moment.now();
      update.head_of_department_id = user;

      const action =
        await resultAllocationNodeService.updateResultAllocationNode(
          node.id,
          update,
          transaction
        );

      return action[1][0];
    }
  }
  // Handle approval by Registrar
  else if (key === 'REGISTRAR') {
    const update = {};

    if (node.approved_by_head === false) {
      throw new Error('This node was not approved by the head of department.');
    }

    if (!node.childNodes) {
      await approveNodeMarks(
        {
          result_allocation_node_id: node.id,
          approved_by_head: true,
        },
        {
          approved_by_registrar: true,
          date_registrar_approved: moment.now(),
          registrar_id: user,
        },
        transaction
      );

      update.approved_by_registrar = true;
      update.date_registrar_approved = moment.now();
      update.registrar_id = user;

      const result =
        await resultAllocationNodeService.updateResultAllocationNode(
          node.id,
          update,
          transaction
        );

      return result[1][0];
    } else {
      node.childNodes.forEach((child) => {
        if (child.approved_by_head === false) {
          throw new Error(
            `Please request the Head Of Department to first approve ${child.node_name}`
          );
        }

        if (child.approved_by_registrar === false) {
          throw new Error(
            `Please approve ${child.node_name} first before approving ${node.node_name}`
          );
        }
      });

      for (const eachChildNode of node.childNodes) {
        await approveNodeMarks(
          {
            result_allocation_node_id: eachChildNode.id,
            approved_by_head: true,
          },
          {
            approved_by_registrar: true,
            date_registrar_approved: moment.now(),
            registrar_id: user,
          },
          transaction
        );
      }

      update.approved_by_registrar = true;
      update.date_registrar_approved = moment.now();
      update.registrar_id = user;

      const result =
        await resultAllocationNodeService.updateResultAllocationNode(
          node.id,
          update,
          transaction
        );

      return result[1][0];
    }
  }
};

/**
 *
 *
 * @param {*} searchCriteriaData
 * @param {*} approverData
 */
const approveNodeMarks = async function (
  searchCriteriaData,
  approverData,
  transaction
) {
  const findMarks = await resultAllocationNodeService.findAllNodeMarks({
    where: {
      ...searchCriteriaData,
    },
    attributes: [
      'id',
      'result_allocation_node_id',
      'student_programme_id',
      'approved_by_lecturer',
      'approved_by_head',
      'approved_by_registrar',
      'marks',
    ],
    raw: true,
  });

  if (!isEmpty(findMarks)) {
    for (const eachMark of findMarks) {
      await resultAllocationNodeService.updateNodeMarks(
        eachMark.id,
        approverData,
        transaction
      );
    }
  } else {
    throw new Error('Unable to find any student marks uploaded to this node.');
  }
};

/**
 *
 * @param {*} finalMarkNode
 * @param {*} transaction
 */
const handlePublishingMarksToResultsTable = function (
  finalMarkNode,
  transaction
) {
  const data = {};
  const allThreeNodes = [];

  allThreeNodes.push(finalMarkNode);

  const courseWorkNode = finalMarkNode.childNodes.filter(
    (child) => child.node_code === 'CW' && child.node_name === 'COURSE WORK'
  );

  if (isEmpty(courseWorkNode)) {
    throw new Error('Unable to find the course work node.');
  }

  allThreeNodes.push(courseWorkNode[0]);

  const examNode = finalMarkNode.childNodes.filter(
    (child) => child.node_code === 'EX' && child.node_name === 'FINAL EXAM'
  );

  if (isEmpty(examNode)) {
    throw new Error('Unable to find the final exam node.');
  }

  allThreeNodes.push(examNode[0]);

  const cleanStudents = uniqBy(
    flatten(allThreeNodes.map((node) => node.nodeMarks)),
    'student_programme_id'
  );

  const formattedTemplate = cleanStudents.map((student) => {
    const findStudentNodeMarks = allThreeNodes.map((node) => {
      const findMarks = node.nodeMarks.find(
        (mark) => mark.student_programme_id === student.student_programme_id
      );

      if (findMarks) {
        return {
          id: node.id,
          node_name: node.node_name,
          node_code: node.node_code,
          pass_mark: node.pass_mark,
          marks: findMarks.marks,
        };
      } else {
        return {
          id: node.id,
          node_name: node.node_name,
          node_code: node.node_code,
          pass_mark: node.pass_mark,
          marks: 0,
        };
      }
    });

    student.nodeMarks = findStudentNodeMarks;
    delete student.id;
    delete student.marks;
    delete student.result_allocation_node_id;
    delete student.registration_course_unit_id;
    delete student.has_passed;

    return student;
  });

  data.academic_year_id =
    finalMarkNode.course.context.academicYear.academic_year_id;
  data.campus_id = finalMarkNode.course.context.campus_id;
  data.intake_id = finalMarkNode.course.context.intake_id;
  data.semester_id = finalMarkNode.course.context.semester.semester_id;
  data.study_year_id =
    finalMarkNode.course.courseUnit.courseUnitYear.programme_study_year_id;
  data.programme_version_course_unit_id =
    finalMarkNode.course.programme_version_course_unit_id;
  data.is_submitted = true;
  data.is_computed = true;
  data.is_published = true;
};

/**
 *
 * @param {*} nodeId
 * @param {*} userId
 */
const checkNodePermissions = async function (nodeId, userId) {
  const node = await resultAllocationNodeService
    .fetchResultAllocationNode({
      where: {
        id: nodeId,
      },
      ...getNodeAttributes(),
      nest: true,
    })
    .then(function (res) {
      if (res) {
        const result = res.toJSON();

        return result;
      }
    });

  if (!node) {
    throw new Error('Unable To Find This Node.');
  }

  if (!node.node_lecturer_id) {
    throw new Error('This Node Has Not Yet Been Assigned A Lecturer.');
  }

  if (parseInt(userId, 10) !== parseInt(node.nodeLecturer.lecturer_id, 10)) {
    throw new Error('You Are Not The Lecturer In Charge Of This Node.');
  }

  if (node.nodeLecturer.can_upload_marks === false) {
    throw new Error(
      'You Were Not Given The Rights To Upload Results During Course Assignment.'
    );
  }

  return node;
};

const findNodeQuestions = async function (nodeId) {
  const nodeQuestions = await nodeQuestionService.findAllNodeQuestions({
    where: {
      result_allocation_node_id: nodeId,
    },
    ...getNodeQuestionAttributes(),
    raw: true,
  });

  if (isEmpty(nodeQuestions)) {
    throw new Error(`This Node Was Not Allocated Questions To.`);
  }

  return nodeQuestions;
};

/**
 *
 */
const getNodeQuestionAttributes = function () {
  return {
    attributes: {
      exclude: [
        'created_at',
        'updated_at',
        'deleted_at',
        'createdById',
        'createApprovedById',
        'lastUpdatedById',
        'lastUpdateApprovedById',
        'deletedById',
        'deleteApprovedById',
        'deleteApprovedById',
      ],
    },
    include: [
      {
        association: 'node',
        attributes: ['id', 'node_code', 'node_name'],
      },
    ],
  };
};

/**
 *
 * @returns
 */
const getNodeAttributes = function () {
  return {
    attributes: [
      'id',
      'course_assignment_id',
      'node_code',
      'node_name',
      'parent_node_id',
      'marks_computation_method_id',
      'percentage_contribution',
      'node_lecturer_id',
      'is_submitted',
      'marks_uploaded',
      'pass_mark',
      'approved_by_lecturer',
      'approved_by_head',
      'approved_by_registrar',
    ],
    include: [
      {
        association: 'childNodes',
        attributes: [
          'id',
          'node_code',
          'node_name',
          'parent_node_id',
          'percentage_contribution',
          'node_lecturer_id',
          'is_submitted',
          'marks_uploaded',
          'pass_mark',
        ],
        include: [
          {
            association: 'nodeMarks',
            attributes: [
              'id',
              'result_allocation_node_id',
              'student_programme_id',
              'registration_course_unit_id',
              'grading_value_id',
              'marks',
              'has_passed',
            ],
          },
        ],
      },
      {
        association: 'parentNode',
        attributes: [
          'id',
          'course_assignment_id',
          'node_code',
          'node_name',
          'parent_node_id',
          'marks_computation_method_id',
          'percentage_contribution',
          'node_lecturer_id',
          'is_submitted',
          'marks_uploaded',
          'pass_mark',
          'approved_by_lecturer',
          'approved_by_head',
          'approved_by_registrar',
        ],
        include: [
          {
            association: 'childNodes',
            attributes: [
              'id',
              'node_code',
              'node_name',
              'is_submitted',
              'parent_node_id',
              'percentage_contribution',
              'node_lecturer_id',
              'marks_uploaded',
              'pass_mark',
            ],
            include: [
              {
                association: 'nodeMarks',
                attributes: [
                  'id',
                  'result_allocation_node_id',
                  'student_programme_id',
                  'registration_course_unit_id',
                  'marks',
                  'has_passed',
                ],
              },
            ],
          },
        ],
      },
      {
        association: 'nodeMarks',
        attributes: [
          'id',
          'result_allocation_node_id',
          'student_programme_id',
          'registration_course_unit_id',
          'grading_value_id',
          'marks',
          'has_passed',
        ],
      },
      {
        association: 'nodeLecturer',
        attributes: ['id', 'lecturer_id', 'can_upload_marks'],
      },
      {
        association: 'course',
        attributes: ['id', 'assignment_id', 'programme_version_course_unit_id'],
        include: [
          {
            association: 'context',
            attributes: [
              'id',
              'campus_id',
              'academic_year_id',
              'semester_id',
              'intake_id',
              'department_id',
              'programme_id',
              'programme_type_id',
              'programme_version_id',
            ],
            include: [
              {
                association: 'academicYear',
                attributes: ['id', 'academic_year_id'],
              },
              {
                association: 'semester',
                attributes: ['id', 'semester_id'],
              },
            ],
          },
          {
            association: 'courseUnit',
            attributes: [
              'id',
              'course_unit_year_id',
              'course_unit_semester_id',
            ],
            include: [
              {
                association: 'courseUnitYear',
                attributes: ['id', 'programme_study_year_id'],
              },
            ],
          },
        ],
      },
    ],
  };
};

module.exports = {
  handleUploadToNodeWithoutChildren,
  handleUploadToNodeWithChildren,
  handleManualComputationOfNode,
  handleSubmittingNode,
  handlePublishingMarksToResultsTable,
  checkNodePermissions,
};
