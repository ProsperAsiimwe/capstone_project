const { HttpResponse } = require('@helpers');
const {
  buildingService,
  metadataService,
  metadataValueService,
} = require('@services/index');
const { isEmpty, now, toUpper, trim } = require('lodash');
const model = require('@models');
const XLSX = require('xlsx');
const formidable = require('formidable');
const excelJs = require('exceljs');
const fs = require('fs');
const { buildingsColumns, roomsColumns } = require('./templateColumns');
const {
  getMetadataValueId,
  getMetadataValues,
} = require('../Helpers/programmeHelper');

const http = new HttpResponse();

class BuildingController {
  /**
   * GET All records.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const records = await buildingService.findAllRecords({
        ...getBuildingAttributes(),
      });

      http.setSuccess(200, 'All Building Records Fetched Successfully', {
        data: records,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Building Records', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * buildingsByCampus
   * @param {*} req
   * @param {*} res
   */
  async buildingsByCampus(req, res) {
    try {
      const { campusId } = req.params;
      const records = await buildingService.findAllRecords({
        where: {
          campus_id: campusId,
        },
        ...getBuildingAttributes(),
      });

      http.setSuccess(200, 'All Building Records Fetched Successfully', {
        data: records,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Building Records', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New Record.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createBuilding(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;

      const buildingRooms = [];

      if (!isEmpty(data.rooms)) {
        data.rooms.forEach((room) => {
          buildingRooms.push({
            ...room,
            created_by_id: user,
          });
        });
      }

      data.rooms = buildingRooms;

      const building = await model.sequelize.transaction(
        async (transaction) => {
          const result = await insertNewBuilding(data, transaction);

          return result;
        }
      );

      http.setSuccess(200, 'Building Created successfully', {
        data: building,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable Create This Building Record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /** uploadBuildings
   *
   */
  uploadBuildings(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;
      const form = new formidable.IncomingForm();
      const uploadedBuildings = [];

      data.created_by_id = user;

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable to upload Buildings.', {
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
        const createBuilding = workbook.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[createBuilding]);
        const content = rows.filter(
          (templateHeaders) =>
            !isEmpty(templateHeaders.CAMPUS) &&
            !isEmpty(templateHeaders['BUILDING NAME'])
        );

        if (isEmpty(content)) {
          http.setError(
            400,
            'Unable to upload this Document, You are missing some required fields in the template.'
          );

          return http.send(res);
        }

        const metadataValues = await metadataValueService.findAllMetadataValues(
          {
            include: {
              association: 'metadata',
              attributes: ['id', 'metadata_name'],
            },
            attributes: ['id', 'metadata_value'],
          }
        );

        try {
          await model.sequelize.transaction(async (transaction) => {
            for (const eachUpload of content) {
              const uploadNameForErrorMsg = eachUpload['BUILDING NAME'];

              if (!eachUpload.CAMPUS) {
                throw new Error(
                  `Campus for ${uploadNameForErrorMsg} is required.`
                );
              }
              data.campus_id = getMetadataValueId(
                metadataValues,
                eachUpload.CAMPUS,
                'CAMPUSES',
                uploadNameForErrorMsg
              );

              if (!eachUpload['BUILDING NAME']) {
                throw new Error(
                  `Building Name For ${uploadNameForErrorMsg} is required.`
                );
              }
              data.building_name = eachUpload['BUILDING NAME'];

              if (eachUpload['BUILDING DESCRIPTION']) {
                data.building_description = eachUpload['BUILDING DESCRIPTION'];
              }

              const upload = await insertNewBuilding(data, transaction);

              uploadedBuildings.push(upload);
            }
          });
          http.setSuccess(200, 'Buildings uploaded successfully.', {
            data: uploadedBuildings,
          });

          return http.send(res);
        } catch (error) {
          http.setError(400, 'Unable to upload Buildings.', {
            error: { message: error.message },
          });

          return http.send(res);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable to upload buildings.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /** uploadRooms
   *
   */
  uploadRooms(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;

      const form = new formidable.IncomingForm();

      const uploadedRooms = [];

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable to upload Rooms.', {
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

        const createBuilding = workbook.SheetNames[0];

        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[createBuilding]);

        const content = rows.filter(
          (templateHeaders) =>
            !isEmpty(templateHeaders.BUILDING) &&
            !isEmpty(templateHeaders['ROOM CODE'])
        );

        if (isEmpty(content)) {
          http.setError(
            400,
            'Unable to upload this Document, You are missing some required fields in the template.'
          );

          return http.send(res);
        }

        const metadataValues = await metadataValueService.findAllMetadataValues(
          {
            include: {
              association: 'metadata',
              attributes: ['id', 'metadata_name'],
            },
            attributes: ['id', 'metadata_value'],
          }
        );

        const buildings = await buildingService.findAllRecords({
          attributes: ['id', 'building_name'],
          raw: true,
        });

        const getBuilding = (value, upload) => {
          const checkValue = buildings.find(
            (building) => toUpper(building.building_name) === toUpper(value)
          );

          if (checkValue) return parseInt(checkValue.id, 10);
          throw new Error(
            `Cannot find ${value} in the list of buildings for the upload ${upload}`
          );
        };

        try {
          await model.sequelize.transaction(async (transaction) => {
            for (const eachUpload of content) {
              const uploadNameForErrorMsg = eachUpload['ROOM CODE'];

              if (!eachUpload.BUILDING) {
                throw new Error(
                  `Building for ${uploadNameForErrorMsg} is required.`
                );
              }
              data.building_id = getBuilding(
                eachUpload.BUILDING,
                uploadNameForErrorMsg
              );

              if (!eachUpload['ROOM TAG']) {
                throw new Error(
                  `Room Tag For ${uploadNameForErrorMsg} is required.`
                );
              }
              data.room_tag_id = getMetadataValueId(
                metadataValues,
                eachUpload['ROOM TAG'],
                'ROOM TAGS',
                uploadNameForErrorMsg
              );

              if (!eachUpload['ROOM CODE']) {
                throw new Error(
                  `Room Code For ${uploadNameForErrorMsg} is required.`
                );
              }
              data.room_code = trim(eachUpload['ROOM CODE']);

              if (!eachUpload['ROOM CAPACITY']) {
                throw new Error(
                  `Room Capacity For ${uploadNameForErrorMsg} is required.`
                );
              }
              data.room_capacity = parseInt(eachUpload['ROOM CAPACITY'], 10);

              const upload = await insertNewRoom(data, transaction);

              uploadedRooms.push(upload);
            }
          });
          http.setSuccess(200, 'Rooms uploaded successfully.', {
            data: uploadedRooms,
          });

          return http.send(res);
        } catch (error) {
          http.setError(400, 'Unable to upload Rooms.', {
            error: { message: error.message },
          });

          return http.send(res);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable to upload Rooms.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * addCourseUnits
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async addRooms(req, res) {
    try {
      const { buildingId } = req.params;
      const data = req.body;
      const user = req.user.id;

      const buildingRooms = [];

      if (!isEmpty(data.rooms)) {
        data.rooms.forEach((room) => {
          buildingRooms.push({
            building_id: buildingId,
            ...room,
            created_by_id: user,
          });
        });
      }
      const finalResult = [];

      await model.sequelize.transaction(async (transaction) => {
        for (const eachObject of buildingRooms) {
          const result = await insertNewRoom(eachObject, transaction);

          finalResult.push(result);
        }
      });

      http.setSuccess(200, 'Rooms Added To Building Record Successfully.', {
        data: finalResult,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Add Rooms To This Building Record.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Record.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateBuilding(req, res) {
    try {
      const { buildingId } = req.params;
      const data = req.body;

      const result = await buildingService.updateBuilding(buildingId, data);
      const response = result[1][0];

      http.setSuccess(200, 'Building Record Updated Successfully', {
        data: response,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Building Record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Record.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateRoom(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const result = await buildingService.updateRoom(id, data);
      const response = result[1][0];

      http.setSuccess(200, 'Room Record Updated Successfully', {
        data: response,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Room Record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Record Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteBuilding(req, res) {
    try {
      const { id } = req.params;

      await buildingService.deleteBuilding(id);
      http.setSuccess(200, 'Building Record Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Cannot delete this Building.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Record Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteRoom(req, res) {
    try {
      const { id } = req.params;

      await buildingService.deleteRoom(id);
      http.setSuccess(200, 'Room Record Deleted Successfully.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Cannot delete this Room Record.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * downloadBuildingsTemplate
   * @param {*} req
   * @param {*} res
   */
  async downloadBuildingsTemplate(req, res) {
    try {
      const { user } = req;

      const workbook = new excelJs.Workbook();

      const createBuildingSheet = workbook.addWorksheet('CREATE BUILDINGS');
      const campusSheet = workbook.addWorksheet('Sheet2');

      createBuildingSheet.properties.defaultColWidth = buildingsColumns.length;
      createBuildingSheet.columns = buildingsColumns;
      campusSheet.state = 'veryHidden';
      const metadata = await metadataService.findAllMetadata({
        attributes: ['metadata_name'],
        include: [
          { association: 'metadataValues', attributes: ['metadata_value'] },
        ],
        raw: true,
        nest: true,
      });

      campusSheet.addRows(getMetadataValues(metadata, 'CAMPUSES'));

      // Add some data validations
      createBuildingSheet.dataValidations.add('A2:A1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=Sheet2!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-buildings-upload-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'BUILDINGS-UPLOAD-TEMPLATE.xlsx',
        (error) => {
          if (error) {
            throw new Error(error.message);
          }
        }
      );
    } catch (error) {
      http.setError(400, 'Unable to download this template.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * downloadRoomsTemplate
   * @param {*} req
   * @param {*} res
   */
  async downloadRoomsTemplate(req, res) {
    try {
      const { user } = req;
      const { campusId } = req.params;

      const workbook = new excelJs.Workbook();

      const createRoomsSheet = workbook.addWorksheet('CREATE ROOMS');
      const buildingSheet = workbook.addWorksheet('Sheet2');
      const roomTagsSheet = workbook.addWorksheet('Sheet3');

      createRoomsSheet.properties.defaultColWidth = roomsColumns.length;
      createRoomsSheet.columns = roomsColumns;
      buildingSheet.state = 'veryHidden';
      roomTagsSheet.state = 'veryHidden';

      const buildings = await buildingService.findAllRecords({
        where: {
          campus_id: campusId,
        },
        attributes: ['building_name'],
        raw: true,
      });
      const metadata = await metadataService.findAllMetadata({
        attributes: ['metadata_name'],
        include: [
          { association: 'metadataValues', attributes: ['metadata_value'] },
        ],
        raw: true,
        nest: true,
      });

      if (isEmpty(buildings)) {
        throw new Error('There are no buildings set up for this campus.');
      }

      buildingSheet.addRows(
        buildings.map((building) => [building.building_name])
      );
      roomTagsSheet.addRows(getMetadataValues(metadata, 'ROOM TAGS'));

      // Add some data validations
      createRoomsSheet.dataValidations.add('A2:A1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=Sheet2!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createRoomsSheet.dataValidations.add('B2:B1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=Sheet3!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      const minNumber = 1;
      const maxNumber = 5000;

      createRoomsSheet.dataValidations.add('D2:D1000', {
        type: 'whole',
        allowBlank: false,
        formulae: [minNumber, maxNumber],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: `The value must be a number between ${minNumber} and ${maxNumber}`,
        prompt: `The value must be a number between ${minNumber} and ${maxNumber}`,
      });

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-rooms-upload-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(template, 'ROOMS-UPLOAD-TEMPLATE.xlsx', (error) => {
        if (error) {
          throw new Error(error.message);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable to download this template.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const insertNewBuilding = async function (data, transaction) {
  try {
    const result = await buildingService.createBuilding(data, transaction);

    return result[0];
  } catch (error) {
    throw new Error(error.message);
  }
};

const insertNewRoom = async function (data, transaction) {
  try {
    const result = await buildingService.addRooms(data, transaction);

    return result[0];
  } catch (error) {
    throw new Error(error.message);
  }
};

const getBuildingAttributes = function () {
  return {
    attributes: {
      exclude: [
        'updated_at',
        'createdById',
        'createApprovedById',
        'lastUpdatedById',
        'lastUpdateApprovedById',
        'deletedById',
        'deleteApprovedById',
        'deleteApprovedById',
        'delete_approval_status',
        'delete_approval_date',
        'delete_approved_by_id',
        'last_update_approval_status',
        'last_update_approval_date',
        'last_update_approved_by_id',
        'last_updated_by_id',
        'create_approval_status',
        'create_approval_date',
        'create_approved_by_id',
      ],
    },
    include: [
      {
        association: 'campus',
        attributes: ['metadata_value'],
      },
      {
        association: 'rooms',
        attributes: {
          exclude: [
            'updated_at',
            'createdById',
            'createApprovedById',
            'lastUpdatedById',
            'lastUpdateApprovedById',
            'deletedById',
            'deleteApprovedById',
            'deleteApprovedById',
            'delete_approval_status',
            'delete_approval_date',
            'delete_approved_by_id',
            'last_update_approval_status',
            'last_update_approval_date',
            'last_update_approved_by_id',
            'last_updated_by_id',
            'create_approval_status',
            'create_approval_date',
            'create_approved_by_id',
          ],
        },
        include: [
          {
            association: 'roomTag',
            attributes: ['metadata_value'],
          },
        ],
      },
    ],
  };
};

module.exports = BuildingController;
