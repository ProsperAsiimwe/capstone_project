'use strict';

const { MetadataValue } = require('@models/App');
const { Model, Deferrable } = require('sequelize');

const User = require('../UserAccess/user.model');
const NTCStudentModel = require('./NTCStudent.model');

module.exports = (sequelize, DataTypes) => {
  class NTCResult extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get the model
      this.academicYear = this.belongsTo(models.MetadataValue, {
        as: 'academicYear',
        foreignKey: 'academic_year_id',
      });
      // Get the model
      this.term = this.belongsTo(models.MetadataValue, {
        as: 'term',
        foreignKey: 'term_id',
      });
      // Get the model
      this.gradingValue = this.belongsTo(models.GradingValue, {
        as: 'gradingValue',
        foreignKey: 'grading_value_id',
      });
      // Get the model
      this.studyYear = this.belongsTo(models.MetadataValue, {
        as: 'studyYear',
        foreignKey: 'study_year_id',
      });

      this.subject = this.belongsTo(models.NTCSubject, {
        as: 'subject',
        foreignKey: 'subject_id',
      });
      // Get the model
      this.student = this.belongsTo(models.NTCStudent, {
        as: 'student',
        foreignKey: 'ntc_student_id',
      });

      // The User who Created this Record
      this.createdBy = this.belongsTo(models.User, {
        as: 'createdBy',
        foreignKey: 'created_by_id',
      });

      this.deletedBy = this.belongsTo(models.User, { as: 'deletedBy' });
    }
  }

  NTCResult.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      batch_no: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ntc_student_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: NTCStudentModel,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      academic_year_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      study_year_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      term_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      subject_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      cw_mark: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      ex_mark: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      total_mark: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      flag: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      is_submitted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_computed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      has_passed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      pass_mark: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      approved_by_senate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_first_sitting: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      is_retaken: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      retake_count: {
        type: DataTypes.INTEGER,
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
      deleted_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      submitted_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      submit_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      exam_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      computed_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      compute_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      published_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      publish_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
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
    },
    {
      sequelize,
      modelName: 'NTCResult',
      tableName: 'ntc_student_results',
      underscored: true,
      timestamps: true,
      schema: 'ntc_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return NTCResult;
};
