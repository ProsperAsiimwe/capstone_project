'use strict';

const { Model, Deferrable } = require('sequelize');

const Event = require('../EventScheduler/event.model');
const MetadataValue = require('../App/metadataValue.model');
const User = require('../UserAccess/user.model');
const Student = require('../StudentRecords/students.model');

module.exports = (sequelize, DataTypes) => {
  class RevokeSurcharge extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.event = this.belongsTo(models.Event, {
        as: 'event',
        foreignKey: 'enrollment_event_id',
      });
      this.surchargeType = this.belongsTo(models.MetadataValue, {
        as: 'surchargeType',
        foreignKey: 'surcharge_type_id',
      });
      this.student = this.belongsTo(models.Student, {
        as: 'student',
        foreignKey: 'student_id',
      });
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
      this.lastUpdatedBy = this.belongsTo(models.User, {
        as: 'lastUpdatedBy',
        foreignKey: 'last_updated_by_id',
      });

      // The User who approved the last Update to this Record
      this.lastUpdateApprovedBy = this.belongsTo(models.User, {
        as: 'lastUpdateApprovedBy',
        foreignKey: 'last_update_approved_by_id',
      });

      // The User who Deleted this Record
      this.deletedBy = this.belongsTo(models.User, {
        as: 'deletedBy',
        foreignKey: 'deleted_by_id',
      });

      // The User who approved the Deletion to this Record
      this.deleteApprovedBy = this.belongsTo(models.User, {
        as: 'deleteApprovedBy',
        foreignKey: 'delete_approved_by_id',
      });
    }
  }

  RevokeSurcharge.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      enrollment_event_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: Event,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      surcharge_type_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      student_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: Student,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      total_amount_revoked: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      revoked_category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      approval_remarks: {
        type: DataTypes.STRING,
        allowNull: true,
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
      modelName: 'RevokeSurcharge',
      tableName: 'revoke_surcharges',
      underscored: true,
      timestamps: true,
      schema: 'enrollment_and_registration_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return RevokeSurcharge;
};