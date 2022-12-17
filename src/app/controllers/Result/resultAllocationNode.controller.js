const { HttpResponse } = require('@helpers');
const {
  resultAllocationNodeService,
  studentService,
  nodeQuestionService,
} = require('@services/index');
const { toUpper, trim, now, isEmpty, sumBy } = require('lodash');
const model = require('@models');
const XLSX = require('xlsx');
const formidable = require('formidable');
const excelJs = require('exceljs');
const fs = require('fs');
const {
  nodeUploadTemplateColumns,
  nodeIdentityColumns,
} = require('./templateColumns');
const {
  handleUploadToNodeWithoutChildren,
  handleUploadToNodeWithChildren,
  handleManualComputationOfNode,
  handleSubmittingNode,
} = require('../Helpers/resultAllocationNodeHelper');

const http = new HttpResponse();

class ResultAllocationNodeController {
  /**
   * GET All ResultAllocationNodes.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const result =
        await resultAllocationNodeService.findAllResultAllocationNodes({
          ...getNodeAttributes(),
        });

      http.setSuccess(200, 'Result Allocation Nodes Fetched Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Result Allocation Nodes.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async createResultAllocationNode(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;

      const findParentNode = await resultAllocationNodeService
        .fetchResultAllocationNode({
          where: {
            id: data.parent_node_id,
          },
          attributes: [
            'id',
            'parent_node_id',
            'node_name',
            'marks_computation_method_id',
            'grading_id',
            'percentage_contribution',
            'node_lecturer_id',
            'pass_mark',
          ],
          include: [
            {
              association: 'childNodes',
              attributes: [
                'id',
                'node_name',
                'percentage_contribution',
                'node_lecturer_id',
                'pass_mark',
              ],
            },
          ],
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!findParentNode) {
        throw new Error('Unable To Find Parent Node.');
      }

      if (!findParentNode.parent_node_id) {
        throw new Error(
          'You Cannot Add Any More Nodes To The Final Mark Node.'
        );
      }

      const finalMarkNode =
        await resultAllocationNodeService.parentNodeFunction({
          child_node_id: data.parent_node_id,
        });

      const checkCoordinatorRights = finalMarkNode.lecturers.filter(
        (lecturer) =>
          parseInt(lecturer.lecturer_id, 10) === parseInt(user, 10) &&
          lecturer.is_course_coordinator === true
      );

      if (isEmpty(checkCoordinatorRights)) {
        throw new Error(
          'You need to be a coordinator in order to create a node.'
        );
      }

      data.grading_id = findParentNode.grading_id;

      if (!data.marks_computation_method_id) {
        data.marks_computation_method_id =
          findParentNode.marks_computation_method_id;
      }

      if (!isEmpty(findParentNode.childNodes)) {
        const usedAllocation = sumBy(
          findParentNode.childNodes,
          'percentage_contribution'
        );

        if (
          parseInt(usedAllocation, 10) ===
          parseInt(findParentNode.percentage_contribution, 10)
        ) {
          throw new Error(
            `Maximum Percentage Allocation Reached By Parent (MAX: ${findParentNode.percentage_contribution}).`
          );
        }

        const newCombined = data.percentage_contribution + usedAllocation;

        const remainingSpace =
          findParentNode.percentage_contribution - usedAllocation;

        if (newCombined > findParentNode.percentage_contribution) {
          throw new Error(
            `The percentage contribution you are trying to allocate to this node must be less than or equal to ${remainingSpace}.`
          );
        }
      } else {
        if (
          data.percentage_contribution > findParentNode.percentage_contribution
        ) {
          throw new Error(
            `The percentage contribution you are trying to allocate to this node must be less than or equal to ${findParentNode.percentage_contribution}.`
          );
        }
      }

      const checkLecturerExists = finalMarkNode.lecturers.filter(
        (lecturer) =>
          parseInt(lecturer.id, 10) === parseInt(data.node_lecturer_id, 10)
      );

      if (isEmpty(checkLecturerExists)) {
        throw new Error(
          'You need to place the node in control of a lecturer with upload rights.'
        );
      }

      data.node_code = data.node_code ? toUpper(trim(data.node_code)) : null;
      data.node_name = toUpper(trim(data.node_name));

      const result = await model.sequelize.transaction(async (transaction) => {
        const response =
          await resultAllocationNodeService.createResultAllocationNode(
            data,
            transaction
          );

        return response;
      });

      http.setSuccess(200, 'Result Allocation Node Created Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create Result Allocation Node.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async uploadNodeResults(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      const { nodeId } = req.params;

      let assessment = '';

      data.created_by_id = user;

      const node = await checkNodePermissions(nodeId, user);

      if (!node.marks_computation_method_id) {
        throw new Error(
          `Please First Provide A Marks Computation Method For ${node.node_name} On The System.`
        );
      }

      if (node.marks_uploaded === true) {
        throw new Error(
          `${node.node_name} has already had marks uploaded to it.`
        );
      }

      const form = new formidable.IncomingForm();

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable To Upload Marks To This Node.', {
            error: { err },
          });

          return http.send(res);
        }

        const file = files[Object.keys(files)[0]];

        if (!file) {
          http.setError(400, 'Please Select A File To Upload.');

          return http.send(res);
        }

        const workbook = XLSX.readFile(file.filepath, { cellDates: true });

        const myTemplate = workbook.SheetNames[0];

        const identityTemplate = workbook.SheetNames[1];

        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[myTemplate]);

        const identityRows = XLSX.utils.sheet_to_json(
          workbook.Sheets[identityTemplate]
        );

        const formattedMarks = rows.filter(
          (templateHeaders) => !isEmpty(templateHeaders['STUDENT NAME'])
        );

        const identitySheetData = identityRows.filter(
          (templateHeaders) =>
            !isEmpty(templateHeaders.NODE) &&
            !isEmpty(templateHeaders.ASSESSMENT)
        );

        if (isEmpty(formattedMarks)) {
          http.setError(
            400,
            'Unable to upload this Document, You are missing some required fields in the template.'
          );

          return http.send(res);
        }

        if (isEmpty(identitySheetData)) {
          http.setError(
            400,
            'Unable to upload this Document, You are missing some required fields in the identity sheet.'
          );

          return http.send(res);
        }

        const studentProgrammes = await studentService.findAllStudentProgrammes(
          {
            attributes: [
              'id',
              'student_id',
              'programme_id',
              'registration_number',
              'student_number',
              'is_current_programme',
            ],
            raw: true,
          }
        );

        try {
          if (
            parseInt(nodeId, 10) !== parseInt(identitySheetData[0].NODE, 10)
          ) {
            throw new Error(
              'The Template You Are Using To Upload Results To This Node Was Not Downloaded For It.'
            );
          }

          assessment = trim(identitySheetData[0].ASSESSMENT);

          const result = await model.sequelize.transaction(
            async (transaction) => {
              if (isEmpty(node.childNodes)) {
                // Handle Uploading To A Node Without Children

                const response = await handleUploadToNodeWithoutChildren(
                  data,
                  node,
                  formattedMarks,
                  nodeId,
                  user,
                  studentProgrammes,
                  assessment,
                  transaction
                );

                return response;
              } else {
                // Handle Uploading To A Node With Children

                if (assessment === 'total_mark') {
                  const response = await handleUploadToNodeWithChildren(
                    data,
                    node,
                    formattedMarks,
                    nodeId,
                    user,
                    studentProgrammes,
                    transaction
                  );

                  return response;
                } else if (assessment === 'each_question') {
                  throw new Error(
                    `You Cannot Assign Marks To A Parent Node With The Marks Assessment Method You Have Chosen.`
                  );
                } else {
                  throw new Error(
                    'Please Provide A Valid Marks Assessment Method You Have Used When Assigning Marks To Students On This Node.'
                  );
                }
              }
            }
          );

          http.setSuccess(200, 'Marks Uploaded Successfully.', {
            data: result,
          });

          return http.send(res);
        } catch (error) {
          http.setError(400, 'Unable To Upload Marks.', {
            error: { message: error.message },
          });

          return http.send(res);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable To Upload This Template.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async downloadNodeResultsUploadTemplate(req, res) {
    try {
      const { user } = req;
      const { nodeId } = req.params;
      const { assessment } = req.query;

      const node = await checkNodePermissions(nodeId, user.id);

      const workbook = new excelJs.Workbook();

      const createNodeResultsUploadSheet = workbook.addWorksheet(
        'UPLOAD NODE RESULTS'
      );
      const nodeIdentitySheet = workbook.addWorksheet('Sheet2');

      nodeIdentitySheet.properties.defaultColWidth = nodeIdentityColumns.length;

      if (assessment === 'each_question') {
        if (!isEmpty(node.childNodes)) {
          throw new Error(
            `You Cannot Assign Marks To A Parent Node With The Marks Assessment Method You Have Chosen.`
          );
        } else {
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

          nodeQuestions.forEach((qn) => {
            const newColumn = {
              header: `QUESTION ${qn.question}`,
              key: `${qn.question}`,
              width: 20,
              style: { alignment: { horizontal: 'left' } },
            };

            nodeUploadTemplateColumns.push(newColumn);
          });

          createNodeResultsUploadSheet.properties.defaultColWidth =
            nodeUploadTemplateColumns.length;
          createNodeResultsUploadSheet.columns = removeDuplicateObjects(
            nodeUploadTemplateColumns,
            (item) => item.header
          );
        }
      } else if (assessment === 'total_mark') {
        if (isEmpty(node.childNodes)) {
          const newColumn = {
            header: `${node.node_name} MARK (OUT OF ${node.percentage_contribution})`,
            key: 'out-of',
            width: 40,
            style: { alignment: { horizontal: 'left' } },
          };

          nodeUploadTemplateColumns.push(newColumn);

          createNodeResultsUploadSheet.properties.defaultColWidth =
            nodeUploadTemplateColumns.length;
          createNodeResultsUploadSheet.columns = removeDuplicateObjects(
            nodeUploadTemplateColumns,
            (item) => item.header
          );
        } else {
          node.childNodes.forEach((child) => {
            const newColumn = {
              header: `${child.node_name} MARK (OUT OF ${child.percentage_contribution})`,
              key: `${child.node_name}`,
              width: 40,
              style: { alignment: { horizontal: 'left' } },
            };

            nodeUploadTemplateColumns.push(newColumn);
          });

          createNodeResultsUploadSheet.properties.defaultColWidth =
            nodeUploadTemplateColumns.length;
          createNodeResultsUploadSheet.columns = removeDuplicateObjects(
            nodeUploadTemplateColumns,
            (item) => item.header
          );
        }
      } else {
        throw new Error(
          'Please Provide A Valid Marks Assessment Method You Wish To Use When Assigning Marks To Students On This Node.'
        );
      }

      nodeIdentitySheet.columns = nodeIdentityColumns;

      nodeIdentitySheet.properties.defaultColWidth = nodeIdentityColumns.length;

      nodeIdentitySheet.state = 'veryHidden';

      const finalMarkNode =
        await resultAllocationNodeService.parentNodeFunction({
          child_node_id: nodeId,
        });

      const data = {
        course_unit_id: finalMarkNode.course_unit_id,
        academic_year_id: finalMarkNode.academic_year_id,
        semester_id: finalMarkNode.semester_id,
        intake_id: finalMarkNode.intake_id,
        campus_id: finalMarkNode.campus_id,
        programme_type_id: finalMarkNode.programme_type_id,
        programme_version_id: finalMarkNode.programme_version_id,
      };

      const students =
        await resultAllocationNodeService.studentsByCourseRegistration(data);

      if (isEmpty(students)) {
        throw new Error(
          `Unable To Find Students That Registered For The Course Matching ${node.node_name}'s Course Assignment Context.`
        );
      }

      const sorted = sortArrayAlphabetically(students[0].students);
      const studentNameColumn = createNodeResultsUploadSheet.getColumn('name');
      const studentNumberColumn = createNodeResultsUploadSheet.getColumn(2);
      const regNumberColumn = createNodeResultsUploadSheet.getColumn(3);

      const nodeIdColumn = nodeIdentitySheet.getColumn('node');

      const nodeAssessmentColumn = nodeIdentitySheet.getColumn('ass');

      studentNameColumn.values = [
        'STUDENT NAME',
        ...sorted.map((student) => {
          return `${student.surname} ${student.other_names}`;
        }),
      ];

      studentNumberColumn.values = [
        'STUDENT NUMBER',
        ...sorted.map((student) => student.student_number),
      ];

      regNumberColumn.values = [
        'REG. NUMBER',
        ...sorted.map((student) => student.registration_number),
      ];

      nodeIdColumn.values = ['NODE', nodeId];

      nodeAssessmentColumn.values = ['ASSESSMENT', assessment];

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-node-upload-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'NODE-MARKS-UPLOAD-TEMPLATE.xlsx',
        (error) => {
          if (error) {
            throw new Error(error.message);
          }
        }
      );
    } catch (error) {
      http.setError(400, 'Unable To Download This Template.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async manuallyComputeNode(req, res) {
    try {
      const { nodeId } = req.params;
      const user = req.user.id;

      const node = await checkNodePermissions(nodeId, user);

      const result = await model.sequelize.transaction(async (transaction) => {
        const response = await handleManualComputationOfNode(
          node,
          user,
          transaction
        );

        return response;
      });

      http.setSuccess(200, 'Result Node Computed Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Compute Result Node.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async submitNodeByLecturer(req, res) {
    try {
      const { nodeId } = req.params;
      const user = req.user.id;

      const node = await checkNodePermissions(nodeId, user);

      const key = 'LECTURER';

      const result = await model.sequelize.transaction(async (transaction) => {
        const response = await handleSubmittingNode(
          node,
          user,
          transaction,
          key
        );

        return response;
      });

      http.setSuccess(
        200,
        'Results Submitted To Head Of Department For Approval.',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Submit Results To Head Of Department For Approval.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   *
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async approveNodeByHeadOfDepartment(req, res) {
    try {
      const { nodeId } = req.params;
      const user = req.user.id;

      const key = 'HOD';

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

      const result = await model.sequelize.transaction(async (transaction) => {
        const response = await handleSubmittingNode(
          node,
          user,
          transaction,
          key
        );

        return response;
      });

      http.setSuccess(200, 'Results Submitted To Registrar For Approval.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Submit Results To Registrar For Approval.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   *
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async approveNodeByRegistrar(req, res) {
    try {
      const { nodeId } = req.params;
      const user = req.user.id;

      const key = 'REGISTRAR';

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

      const result = await model.sequelize.transaction(async (transaction) => {
        const response = await handleSubmittingNode(
          node,
          user,
          transaction,
          key
        );

        return response;
      });

      http.setSuccess(200, 'Results Submitted To Registrar For Approval.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Submit Results To Registrar For Approval.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * Get Specific ResultAllocationNode Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchResultAllocationNode(req, res) {
    try {
      const { id } = req.params;
      const result =
        await resultAllocationNodeService.fetchResultAllocationNode({
          where: { id },
        });

      http.setSuccess(200, 'Result Allocation Node Fetched successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Result Allocation Node.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific ResultAllocationNode Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchResultAllocationNodeByAssinmentCourseUnit(req, res) {
    try {
      const { assignmentCourseUnitId } = req.params;

      const result =
        await resultAllocationNodeService.fetchResultAllocationNode({
          where: {
            assignment_course_id: assignmentCourseUnitId,
          },
          ...getNodeAttributes(),
        });

      http.setSuccess(200, 'Result Allocation Node Fetched successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Result Allocation Node.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async updateResultAllocationNode(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const update =
        await resultAllocationNodeService.updateResultAllocationNode(id, data);

      const result = update[1][0];

      http.setSuccess(200, 'Result Allocation Node updated successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Result Allocation Node.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteResultAllocationNode(req, res) {
    try {
      const { id } = req.params;

      await resultAllocationNodeService.deleteResultAllocationNode(id);
      http.setSuccess(200, 'Result Allocation Node Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Result Allocation Node.', {
        error: error.message,
      });

      return http.send(res);
    }
  }
}

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
      'You Were Not Given The Rights To Upload Results At Course Assignment.'
    );
  }

  return node;
};

/**
 *
 * @param {*} array
 */
const sortArrayAlphabetically = function (array) {
  const sortedArray = array.sort(function (a, b) {
    return a.surname.localeCompare(b.surname);
  });

  return sortedArray;
};

/**
 *
 * @param {*} arrayOfItems
 */
const removeDuplicateObjects = function (data, key) {
  return [...new Map(data.map((item) => [key(item), item])).values()];
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
                attributes: ['id', 'metadata_value'],
              },
              {
                association: 'semester',
                attributes: ['id', 'metadata_value'],
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

module.exports = ResultAllocationNodeController;
