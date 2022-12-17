const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class BuildingService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findAllRecords(options) {
    try {
      const records = await models.Building.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `building.service.js`,
        `findAllRecords`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async findOneRecord(options) {
    try {
      const record = await models.Building.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `building.service.js`,
        `findOneRecord`,
        `GET`
      );
    }
  }

  /** createBuildingRecord
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createBuilding(data, transaction) {
    try {
      const record = await models.Building.findOrCreate({
        where: {
          campus_id: data.campus_id,
          building_name: data.building_name.trim(),
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.Building.rooms,
          },
        ],
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `building.service.js`,
        `createBuilding`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async addRooms(data, transaction) {
    try {
      const result = await models.BuildingRoom.findOrCreate({
        where: {
          building_id: data.building_id,
          room_tag_id: data.room_tag_id,
          room_code: data.room_code.trim(),
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `building.service.js`,
        `addRooms`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of record object to be updated
   * @returns {Promise}
   * @description updates a single record object
   *@
   */
  static async updateBuilding(id, data) {
    try {
      const record = await models.Building.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `building.service.js`,
        `updateBuilding`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} data
   */
  static async updateRoom(id, data) {
    try {
      const record = await models.BuildingRoom.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `building.service.js`,
        `updateRoom`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of record object to be deleted
   * @returns {Promise}
   * @description deletes a single record object
   *@
   */
  static async deleteBuilding(id) {
    try {
      const deleted = await models.Building.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `building.service.js`,
        `deleteBuilding`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} id
   */
  static async deleteRoom(id) {
    try {
      const deleted = await models.BuildingRoom.destroy({
        where: {
          id,
        },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `building.service.js`,
        `deleteRoom`,
        `DELETE`
      );
    }
  }
}

module.exports = BuildingService;
