const { HttpResponse } = require('@helpers');
const { nodeQuestionService } = require('@services/index');
const {
  numericQuestionsHandler,
  alphabetQuestionsHandler,
  romanNumeralsQuestionsHandler,
} = require('../Helpers/nodeQuestionHelper');

const {
  checkNodePermissions,
} = require('../Helpers/resultAllocationNodeHelper');
const { isEmpty, trim } = require('lodash');
const model = require('@models');

const http = new HttpResponse();

class NodeQuestionController {
  /**
   * GET All nodeQuestions.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const { nodeId } = req.params;
      const nodeQuestions = await nodeQuestionService.findAllNodeQuestions({
        where: {
          result_allocation_node_id: nodeId,
        },
        ...getNodeQuestionAttributes(),
      });

      http.setSuccess(200, 'Node Questions Fetched Successfully', {
        data: nodeQuestions,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Fetch Node Questions', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New NodeQuestion Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createNodeQuestion(req, res) {
    try {
      const data = req.body;
      const { nodeId } = req.params;
      const user = req.user.id;

      await checkNodePermissions(nodeId, user);

      const questions = [];

      if (data.is_number_based === true) {
        if (
          data.is_alphabet_based === true ||
          data.is_roman_numeral_based === true ||
          data.is_custom_based === true
        ) {
          throw new Error(`Please only select one option.`);
        }

        if (!data.questions_from) {
          throw new Error(
            `Please provide the starting number of your questions.`
          );
        }

        if (!data.questions_to) {
          throw new Error(`Please provide the end number of your questions.`);
        }

        data.questions_from = trim(data.questions_from);
        data.questions_to = trim(data.questions_to);

        if (Number.isInteger(parseInt(data.questions_from, 10)) === false) {
          throw new Error('Please provide a valid integer greater than 0');
        }

        if (Number.isInteger(parseInt(data.questions_to, 10)) === false) {
          throw new Error('Please provide a valid integer greater than 0');
        }

        if (
          parseInt(data.questions_to, 10) <= parseInt(data.questions_from, 10)
        ) {
          throw new Error('Ending number must be greater than Starting number');
        }

        const generate = numericQuestionsHandler(data);

        generate.forEach((num) => {
          questions.push({
            ...num,
            result_allocation_node_id: nodeId,
            created_by_id: user,
          });
        });
      } else if (data.is_alphabet_based === true) {
        if (
          data.is_number_based === true ||
          data.is_roman_numeral_based === true ||
          data.is_custom_based === true
        ) {
          throw new Error(`Please only select one option.`);
        }

        if (!data.questions_from) {
          throw new Error(
            `Please provide the starting alphabetical letter of your questions.`
          );
        }

        if (!data.questions_to) {
          throw new Error(
            `Please provide the end alphabetical letter of your questions.`
          );
        }

        data.questions_from = trim(data.questions_from);
        data.questions_to = trim(data.questions_to);

        const generate = alphabetQuestionsHandler(data);

        generate.forEach((letter) => {
          questions.push({
            ...letter,
            result_allocation_node_id: nodeId,
            created_by_id: user,
          });
        });
      } else if (data.is_roman_numeral_based === true) {
        if (
          data.is_number_based === true ||
          data.is_alphabet_based === true ||
          data.is_custom_based === true
        ) {
          throw new Error(`Please only select one option.`);
        }

        if (!data.questions_from) {
          throw new Error(
            `Please provide the starting number of your questions.`
          );
        }

        if (!data.questions_to) {
          throw new Error(`Please provide the end number of your questions.`);
        }

        data.questions_from = trim(data.questions_from);
        data.questions_to = trim(data.questions_to);

        if (Number.isInteger(parseInt(data.questions_from, 10)) === false) {
          throw new Error('Please provide a valid integer greater than 0');
        }

        if (Number.isInteger(parseInt(data.questions_to, 10)) === false) {
          throw new Error('Please provide a valid integer greater than 0');
        }

        if (
          parseInt(data.questions_to, 10) <= parseInt(data.questions_from, 10)
        ) {
          throw new Error('Ending number must be greater than Starting number');
        }

        const generate = romanNumeralsQuestionsHandler(data);

        generate.forEach((rom) => {
          questions.push({
            ...rom,
            result_allocation_node_id: nodeId,
            created_by_id: user,
          });
        });
      } else if (data.is_custom_based === true) {
        if (
          data.is_number_based === true ||
          data.is_alphabet_based === true ||
          data.is_roman_numeral_based === true
        ) {
          throw new Error(`Please only select one option.`);
        }

        if (isEmpty(data.custom_questions)) {
          throw new Error(
            `Please provide the list of custom question numbers.`
          );
        }

        data.custom_questions.forEach((custom) => {
          questions.push({
            question: custom,
            result_allocation_node_id: nodeId,
            created_by_id: user,
          });
        });
      } else {
        throw new Error(`Unidentified Selection.`);
      }

      const nodeQuestions = [];

      await model.sequelize.transaction(async (transaction) => {
        for (const qn of questions) {
          const result = await nodeQuestionService.createNodeQuestion(
            qn,
            transaction
          );

          nodeQuestions.push(result);
        }
      });

      http.setSuccess(200, 'Node Questions Created Successfully', {
        data: nodeQuestions,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create This Node Question', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific NodeQuestion Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateNodeQuestion(req, res) {
    try {
      const { nodeQuestionId } = req.params;
      const user = req.user.id;
      const data = req.body;

      const fetch = await nodeQuestionService.findOneNodeQuestion({
        where: { id: nodeQuestionId },
        ...getNodeQuestionAttributes(),
      });

      if (!fetch) {
        throw new Error(`Unable To Find Node Question`);
      }

      await checkNodePermissions(fetch.result_allocation_node_id, user);

      const updateNodeQuestion = await nodeQuestionService.updateNodeQuestion(
        nodeQuestionId,
        data
      );
      const nodeQuestion = updateNodeQuestion[1][0];

      http.setSuccess(200, 'Node Question Updated Successfully', {
        data: nodeQuestion,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Node Question', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific NodeQuestion Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchNodeQuestion(req, res) {
    try {
      const { nodeQuestionId } = req.params;
      const nodeQuestion = await nodeQuestionService.findOneNodeQuestion({
        where: { id: nodeQuestionId },
        ...getNodeQuestionAttributes(),
      });

      http.setSuccess(200, 'Node Question Fetched Successfully', {
        nodeQuestion,
      });
      if (isEmpty(nodeQuestion))
        http.setError(404, 'Node Question Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Get This Node Question', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy NodeQuestion Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteNodeQuestion(req, res) {
    try {
      const { nodeQuestionId } = req.params;
      const user = req.user.id;

      const fetch = await nodeQuestionService.findOneNodeQuestion({
        where: { id: nodeQuestionId },
        ...getNodeQuestionAttributes(),
      });

      if (!fetch) {
        throw new Error(`Unable To Find Node Question`);
      }

      await checkNodePermissions(fetch.result_allocation_node_id, user);

      await nodeQuestionService.deleteNodeQuestion(nodeQuestionId);
      http.setSuccess(200, 'Node Question deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Node Question', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

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

module.exports = NodeQuestionController;
