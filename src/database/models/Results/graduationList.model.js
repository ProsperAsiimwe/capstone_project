'use strict';

const { Model, Deferrable } = require('sequelize');
const User = require('../UserAccess/user.model');
const ProvisionalGraduationList = require('./provisionalGraduationList.model');
const studyLevelDegreeClassAllocation = require('../InstitutionPolicy/studyLevelDegreeClassAllocation.model');
const moment = require('moment');

module.exports = (sequelize, DataTypes) => {
  class GraduationList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get the model
      this.provisional = this.belongsTo(models.ProvisionalGraduationList, {
        as: 'provisional',
        foreignKey: 'provisional_list_id',
      });
      // Get the model
      this.degreeClass = this.belongsTo(
        models.StudyLevelDegreeClassAllocation,
        {
          as: 'degreeClass',
          foreignKey: 'degree_class_id',
        }
      );

      // The User who Created this Record
      this.createdBy = this.belongsTo(models.User, {
        as: 'createdBy',
        foreignKey: 'created_by_id',
      });

      // The User who approved the newly created Record
      this.createApprovedBy = this.belongsTo(models.User, {
        as: 'createApprovedBy',
        foreignKey: 'create_approved_by_id',
      });

      // The User who Last Updated this Record
      this.lastUpdatedBy = this.belongsTo(models.User, { as: 'lastUpdatedBy' });

      // The User who approved the last Update to this Record
      this.lastUpdateApprovedBy = this.belongsTo(models.User, {
        as: 'lastUpdateApprovedBy',
      });

      // The User who Deleted this Record
      this.deletedBy = this.belongsTo(models.User, { as: 'deletedBy' });

      // The User who approved the Deletion to this Record
      this.deleteApprovedBy = this.belongsTo(models.User, {
        as: 'deleteApprovedBy',
      });
    }
  }

  GraduationList.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      provisional_list_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
        references: {
          key: 'id',
          model: ProvisionalGraduationList,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      degree_class_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: studyLevelDegreeClassAllocation,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      narration: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_graduated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      graduation_date: {
        type: DataTypes.DATEONLY,
        get: function () {
          if (this.getDataValue('graduation_date')) {
            return moment
              .utc(this.getDataValue('graduation_date'))
              .format('YYYY.MM.DD');
          }
        },
        allowNull: true,
      },
      graduation_congregation_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      graduation_year: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      completion_year: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      has_been_billed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      has_paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      // Record Details
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      create_approved_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      create_approval_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      create_approval_status: {
        type: DataTypes.STRING,
        defaultValue: 'PENDING',
      },
      last_updated_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      last_update_approved_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      last_update_approval_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      last_update_approval_status: {
        type: DataTypes.STRING,
        defaultValue: 'PENDING',
      },
      deleted_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      delete_approved_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      delete_approval_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      delete_approval_status: {
        type: DataTypes.STRING,
        defaultValue: 'PENDING',
      },
    },

    {
      sequelize,
      modelName: 'GraduationList',
      tableName: 'graduation_final_list',
      timestamps: true,
      underscored: true,
      schema: 'results_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return GraduationList;
};