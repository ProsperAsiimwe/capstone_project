'use strict';

const { Model, Deferrable } = require('sequelize');

const User = require('../UserAccess/user.model');
const MetadataValue = require('../App/metadataValue.model');

module.exports = (sequelize, DataTypes) => {
  class EVotingElectivePosition extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.academicYear = this.belongsTo(models.MetadataValue, {
        as: 'academicYear',
        foreignKey: 'academic_year_id',
      });

      this.semester = this.belongsTo(models.MetadataValue, {
        as: 'semester',
        foreignKey: 'semester_id',
      });

      this.votingColleges = this.hasMany(models.EVotingCollege, {
        as: 'votingColleges',
        foreignKey: 'elective_position_id',
      });

      this.votingFaculties = this.hasMany(models.EVotingFaculty, {
        as: 'votingFaculties',
        foreignKey: 'elective_position_id',
      });

      this.votingDepartments = this.hasMany(models.EVotingDepartment, {
        as: 'votingDepartments',
        foreignKey: 'elective_position_id',
      });

      this.votingProgrammes = this.hasMany(models.EVotingProgramme, {
        as: 'votingProgrammes',
        foreignKey: 'elective_position_id',
      });

      // The User who Created this Record
      this.createdBy = this.belongsTo(models.User, {
        as: 'createdBy',
        foreignKey: 'user_id',
      });

      // The User who approvedBy this Record
      this.approvedBy = this.belongsTo(models.User, {
        as: 'approvedBy',
        foreignKey: 'approved_by',
      });
    }
  }

  EVotingElectivePosition.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      position_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      position_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      max_number_of_candidates: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      start_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      end_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      all_colleges: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      all_faculties: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      all_departments: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      all_programmes: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      voter_fees_completion: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      voter_is_enrolled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      voter_is_registered: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      voter_maximum_retakes: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      voter_minimum_cgpa: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      voter_study_years: {
        type: DataTypes.JSON,
        defaultValue: 0,
      },
      voter_campuses: {
        type: DataTypes.JSON,
        defaultValue: 0,
      },
      voter_entry_years: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      voter_intakes: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      voter_halls_of_attachment: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      voter_halls_of_residence: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      voter_all_halls_of_attachment: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      voter_all_halls_of_residence: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      candidate_fees_completion: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      candidate_is_enrolled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      candidate_is_registered: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      candidate_maximum_retakes: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      candidate_minimum_cgpa: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      candidate_study_years: {
        type: DataTypes.JSON,
        defaultValue: 0,
      },
      candidate_campuses: {
        type: DataTypes.JSON,
        defaultValue: 0,
      },
      candidate_entry_years: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      candidate_intakes: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      candidate_halls_of_attachment: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      candidate_halls_of_residence: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      candidate_all_halls_of_attachment: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      candidate_all_halls_of_residence: {
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
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      is_approved: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      approved_on: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'EVotingElectivePosition',
      tableName: 'elective_positions',
      underscored: true,
      timestamps: true,
      schema: 'e_voting_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return EVotingElectivePosition;
};
