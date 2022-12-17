'use strict';

const { Model, Deferrable } = require('sequelize');

const PujabApplicant = require('./pujabApplicant.model');
const PujabRunningAdmission = require('./pujabRunningAdmission.model');

module.exports = (sequelize, DataTypes) => {
  class PujabApplicationView extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //
      this.applicant = this.belongsTo(models.PujabApplicant, {
        as: 'applicant',
        foreignKey: 'applicant_id',
      });

      this.pujabRunningAdmission = this.belongsTo(
        models.PujabRunningAdmission,
        {
          as: 'pujabRunningAdmission',
          foreignKey: 'pujab_running_admission_id',
        }
      );

      this.bioData = this.hasOne(models.PujabBioData, {
        as: 'bioData',
        foreignKey: 'pujab_application_id',
      });

      this.fatherInfo = this.hasOne(models.PujabFatherInfo, {
        as: 'fatherInfo',
        foreignKey: 'pujab_application_id',
      });

      this.motherInfo = this.hasOne(models.PujabMotherInfo, {
        as: 'motherInfo',
        foreignKey: 'pujab_application_id',
      });

      this.ordinaryLevel = this.hasOne(models.PujabOLevelData, {
        as: 'ordinaryLevel',
        foreignKey: 'pujab_application_id',
        hooks: true,
        constraints: true,
      });

      this.advancedLevel = this.hasOne(models.PujabALevelData, {
        as: 'advancedLevel',
        foreignKey: 'pujab_application_id',
      });

      this.previousAdmission = this.hasOne(
        models.PujabPreviousUniversityAdmission,
        {
          as: 'previousAdmission',
          foreignKey: 'pujab_application_id',
        }
      );

      this.disability = this.hasOne(models.PujabDisability, {
        as: 'disability',
        foreignKey: 'pujab_application_id',
      });

      this.programmeChoices = this.hasMany(models.PujabProgrammeChoice, {
        as: 'programmeChoices',
        foreignKey: 'pujab_application_id',
      });
    }
  }

  PujabApplicationView.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      applicant_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: PujabApplicant,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      pujab_running_admission_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: PujabRunningAdmission,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      academic_year_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      application_status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'IN-PROGRESS',
      },
      application_fee: {
        type: DataTypes.INTEGER,
      },
      admission_start_date: {
        type: DataTypes.DATE,
      },
      admission_end_date: {
        type: DataTypes.DATE,
      },
      academic_year: {
        type: DataTypes.STRING,
      },
      instructions: {
        type: DataTypes.TEXT,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
      },
      application_start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      application_completion_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      application_admission_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      form_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      payment_status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'PENDING',
      },
      amount_billed: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
      },
      currency_billed: {
        type: DataTypes.STRING,
        defaultValue: 'UGX',
      },
      amount_paid: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
      },
      balance: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      prn: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bank: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      search_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tax_payer_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      expiry_date: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      system_prn: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      payment_mode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      payment_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      generated_by: {
        type: DataTypes.STRING,
        defaultValue: 'APPLICANT',
      },
      has_disability: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true,
      },
      has_previous_admission: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true,
      },
      o_level_result: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true,
      },
      a_level_result: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true,
      },
      declared_by_applicant: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      date_of_declaration: {
        type: DataTypes.DATE,
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
      modelName: 'PujabApplicationView',
      tableName: 'applications_view',
      underscored: true,
      timestamps: true,
      schema: 'pujab_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return PujabApplicationView;
};
