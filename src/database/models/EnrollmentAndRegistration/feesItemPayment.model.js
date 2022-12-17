// fees_item_payment_transactions

'use strict';

const { Model, Deferrable } = require('sequelize');

const FeesElement = require('../FeesManager/feesElement.model');

const Student = require('../StudentRecords/students.model');

const StudentProgramme = require('../StudentRecords/studentProgramme.model');
const MetadataValue = require('../App/metadataValue.model');

module.exports = (sequelize, DataTypes) => {
  class FeesItemPayment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // student

      this.student = this.belongsTo(models.Student, {
        as: 'student',
        foreignKey: 'student_id',
      });

      // StudentProgramme
      this.studentProgramme = this.belongsTo(models.StudentProgramme, {
        as: 'studentProgramme',
        foreignKey: 'student_programme_id',
      });

      // fees element
      this.feesElement = this.belongsTo(models.FeesElement, {
        as: 'feesElement',
        foreignKey: 'fees_element_id',
      });
      // MetadataValue
      this.academicYear = this.belongsTo(models.MetadataValue, {
        as: 'academicYear',
        foreignKey: 'academic_year_id',
      });

      // MetadataValue
      this.studyYear = this.belongsTo(models.MetadataValue, {
        as: 'studyYear',
        foreignKey: 'study_year_id',
      });
      this.semester = this.belongsTo(models.MetadataValue, {
        as: 'semester',
        foreignKey: 'semester_id',
      });
    }
  }

  FeesItemPayment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      student_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: Student,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      student_programme_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: StudentProgramme,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      academic_year_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      study_year_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      semester_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      fees_element_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: FeesElement,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      payment_reference_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      ura_prn: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      system_prn: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      payment_date: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      invoice_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      transaction_origin: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
    },
    {
      sequelize,
      modelName: 'FeesItemPayment',
      tableName: 'fees_item_payment_transactions',
      underscored: true,
      timestamps: true,
      schema: 'enrollment_and_registration_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return FeesItemPayment;
};
