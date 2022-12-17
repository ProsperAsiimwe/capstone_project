'use strict';

const { Model, Deferrable } = require('sequelize');
const moment = require('moment');
const Student = require('./students.model');
const StudentProgramme = require('./studentProgramme.model');
const MetadataValue = require('../App/metadataValue.model');
const User = require('../UserAccess/user.model');
const Programme = require('../ProgrammeManager/programme.model');
const ProgrammeVersion = require('../ProgrammeManager/programmeVersion.model');
const SubjectCombination = require('../ProgrammeManager/SubjectCombination.model');

module.exports = (sequelize, DataTypes) => {
  class StudentService extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get from model.
      this.student = this.belongsTo(models.Student, {
        as: 'student',
        foreignKey: 'student_id',
      });
      // Get from model.
      this.studentProgramme = this.belongsTo(models.StudentProgramme, {
        as: 'studentProgramme',
        foreignKey: 'student_programme_id',
      });
      // Get from model.
      this.academicYear = this.belongsTo(models.MetadataValue, {
        as: 'academicYear',
        foreignKey: 'academic_year_id',
      });
      // Get from model.
      this.semester = this.belongsTo(models.MetadataValue, {
        as: 'semester',
        foreignKey: 'semester_id',
      });
      // Get from model.
      this.studyYear = this.belongsTo(models.MetadataValue, {
        as: 'studyYear',
        foreignKey: 'study_year_id',
      });
      // Get from model.
      this.serviceType = this.belongsTo(models.MetadataValue, {
        as: 'serviceType',
        foreignKey: 'student_service_type_id',
      });
      // Get from model.
      this.oldProgramme = this.belongsTo(models.Programme, {
        as: 'oldProgramme',
        foreignKey: 'old_programme_id',
      });
      // Get from model.
      this.oldVersion = this.belongsTo(models.ProgrammeVersion, {
        as: 'oldVersion',
        foreignKey: 'old_programme_version_id',
      });
      // Get from model.
      this.newProgramme = this.belongsTo(models.Programme, {
        as: 'newProgramme',
        foreignKey: 'new_programme_id',
      });
      // Get from model.
      this.newVersion = this.belongsTo(models.ProgrammeVersion, {
        as: 'newVersion',
        foreignKey: 'new_programme_version_id',
      });
      // Get from model.
      this.oldProgrammeType = this.belongsTo(models.MetadataValue, {
        as: 'oldProgrammeType',
        foreignKey: 'old_programme_type_id',
      });
      // Get from model.
      this.newProgrammeType = this.belongsTo(models.MetadataValue, {
        as: 'newProgrammeType',
        foreignKey: 'new_programme_type_id',
      });
      // Get from model.
      this.oldCampus = this.belongsTo(models.MetadataValue, {
        as: 'oldCampus',
        foreignKey: 'old_campus_id',
      });
      // Get from model.
      this.newCampus = this.belongsTo(models.MetadataValue, {
        as: 'newCampus',
        foreignKey: 'new_campus_id',
      });
      // Get from model.
      this.oldSubjectComb = this.belongsTo(models.SubjectCombination, {
        as: 'oldSubjectComb',
        foreignKey: 'old_subject_comb_id',
      });
      // Get from model.
      this.newSubjectComb = this.belongsTo(models.SubjectCombination, {
        as: 'newSubjectComb',
        foreignKey: 'new_subject_comb_id',
      });
      // The User who Approved this Record
      this.approvedBy = this.belongsTo(models.User, {
        as: 'approvedBy',
        foreignKey: 'request_approved_by_id',
      });
    }
  }

  StudentService.init(
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
        allowNull: false,
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
      study_year_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      student_service_type_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      request_status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'PENDING',
      },
      request_approved_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      request_approval_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      requires_payment: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      system_prn: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ura_prn: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      search_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      paid: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      balance: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      tax_payer_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      payment_mode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      payment_bank_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tax_payer_bank_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      generated_by: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      expiry_date: {
        type: DataTypes.DATEONLY,
        get: function () {
          return moment
            .utc(this.getDataValue('expiry_date'))
            .format('YYYY.MM.DD');
        },
        allowNull: true,
      },
      is_used: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      payment_status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'PENDING',
      },
      payment_status_description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      currency_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      old_programme_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: Programme,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      old_programme_version_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: ProgrammeVersion,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      new_programme_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: Programme,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      new_programme_version_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: ProgrammeVersion,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      old_programme_type_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      new_programme_type_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      old_campus_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      new_campus_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      old_subject_comb_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: SubjectCombination,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      new_subject_comb_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: SubjectCombination,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },

      // Extra Record Details
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
      modelName: 'StudentService',
      tableName: 'student_services',
      underscored: true,
      timestamps: true,
      schema: 'students_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return StudentService;
};
