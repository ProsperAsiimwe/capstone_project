const models = require('@models');

// This Class is responsible for handling all database interactions for a nodeQuestion
class NodeQuestionService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all node Questions or filtered using options param
   */
  static async findAllNodeQuestions(options) {
    try {
      const results = await models.NodeQuestion.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single nodeQuestion object basing on the options
   */
  static async findOneNodeQuestion(options) {
    try {
      const nodeQuestion = await models.NodeQuestion.findOne({ ...options });

      return nodeQuestion;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single nodeQuestion object from data object
   *@
   */
  static async createNodeQuestion(data, transaction) {
    try {
      const newNodeQuestion = await models.NodeQuestion.findOrCreate({
        where: {
          result_allocation_node_id: data.result_allocation_node_id,
          question: data.question,
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return newNodeQuestion;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of nodeQuestion object to be updated
   * @returns {Promise}
   * @description updates a single nodeQuestion object
   *@
   */
  static async updateNodeQuestion(id, data) {
    try {
      const updated = await models.NodeQuestion.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * @param {string} id  id of nodeQuestion object to be deleted
   * @returns {Promise}
   * @description deletes a single nodeQuestion object
   *@
   */
  static async deleteNodeQuestion(id) {
    try {
      const deleted = await models.NodeQuestion.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = NodeQuestionService;
