'use strict';

const { Model, Deferrable } = require('sequelize');

const { Programme } = require('@models/ProgrammeManager');
const { StudentProgramme, Student } = require('@models/StudentRecords');

module.exports = (sequelize, DataTypes) => {
  class CurrentStudentInvoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.student = this.belongsTo(models.Student, {
        as: 'student',
        foreignKey: 'student_id',
      });
      // student programme
      this.studentProgramme = this.belongsTo(models.StudentProgramme, {
        as: 'studentProgramme',
        foreignKey: 'student_programme_id',
      });
      this.programme = this.belongsTo(models.Programme, {
        as: 'programme',
        foreignKey: 'programme_id',
      });
    }
  }

  CurrentStudentInvoice.init(
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
      programme_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: Programme,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      programme_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      programme_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      current_study_year: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      student_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      registration_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      surname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      other_names: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      total_bill: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      tuition_bill: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0.0,
      },
      functional_bill: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      manual_bill: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      other_fees_bill: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      debit_notes: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      credit_notes: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      opening_balance: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      total_due: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      total_billed: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      total_paid: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      prepayments: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      date_from: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      date_to: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      last_generated_by: {
        type: DataTypes.STRING,
        allowNull: false,
      },
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
      modelName: 'CurrentStudentInvoice',
      tableName: 'current_student_invoice_summaries',
      underscored: true,
      timestamps: true,
      schema: 'enrollment_and_registration_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: [
            'student_programme_id',
            'programme_id',
            'student_id',
            'date_from',
            'date_to',
          ],
          name: 'unique_index',
        },
      ],
    }
  );

  return CurrentStudentInvoice;
};
