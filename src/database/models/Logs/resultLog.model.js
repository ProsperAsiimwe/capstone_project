'use strict';

const { Model, Deferrable } = require('sequelize');
const User = require('../UserAccess/user.model');

const uppercaseFirst = (str) => `${str[0].toUpperCase()}${str.substr(1)}`;

module.exports = (sequelize, DataTypes) => {
  class ResultLog extends Model {
    getRecord(options) {
      if (!this.record_type) return Promise.resolve(null);
      const mixinMethodName = `get${uppercaseFirst(this.record_type)}`;

      return this[mixinMethodName](options);
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // The User who Created this Record
      this.user = this.belongsTo(models.User, {
        as: 'user',
        foreignKey: 'user_id',
      });

      this.gradList = this.belongsTo(models.GraduationList, {
        as: 'gradList',
        foreignKey: 'record_id',
        constraints: false,
      });

      this.provisionalGradList = this.belongsTo(
        models.ProvisionalGraduationList,
        {
          as: 'provisionalGradList',
          foreignKey: 'record_id',
          constraints: false,
        }
      );

      this.result = this.belongsTo(models.Result, {
        as: 'result',
        foreignKey: 'record_id',
        constraints: false,
      });

      this.resultBatch = this.belongsTo(models.ResultBatch, {
        as: 'resultBatch',
        foreignKey: 'record_id',
        constraints: false,
      });

      this.node = this.belongsTo(models.ResultAllocationNode, {
        as: 'node',
        foreignKey: 'record_id',
        constraints: false,
      });

      this.nodeMark = this.belongsTo(models.NodeMark, {
        as: 'nodeMark',
        foreignKey: 'record_id',
        constraints: false,
      });

      this.nodeQuestion = this.belongsTo(models.NodeQuestion, {
        as: 'nodeQuestion',
        foreignKey: 'record_id',
        constraints: false,
      });

      this.semesterResult = this.belongsTo(models.StudentAcademicAssessment, {
        as: 'semesterResult',
        foreignKey: 'record_id',
        constraints: false,
      });
    }
  }

  ResultLog.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      record_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      record_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      permission: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      previous_data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      current_data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      operation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      area_accessed: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ip_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      user_agent: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      detailed_user_agent: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      action_status: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      //
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
      modelName: 'ResultLog',
      tableName: 'results_logs',
      underscored: true,
      timestamps: true,
      schema: 'app_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  ResultLog.addHook('afterFind', (findRecord) => {
    if (!Array.isArray(findRecord)) findRecord = [findRecord];
    for (const instance of findRecord) {
      if (
        instance.record_type === 'provisionalGraduationList' &&
        instance.provisionalGraduationList !== undefined
      ) {
        instance.record_id = instance.provisionalGraduationList;
      } else if (
        instance.record_type === 'graduationList' &&
        instance.graduationList !== undefined
      ) {
        instance.record_id = instance.graduationList;
      } else if (
        instance.record_type === 'result' &&
        instance.result !== undefined
      ) {
        instance.record_id = instance.result;
      } else if (
        instance.record_type === 'resultBatch' &&
        instance.resultBatch !== undefined
      ) {
        instance.record_id = instance.resultBatch;
      } else if (
        instance.record_type === 'node' &&
        instance.node !== undefined
      ) {
        instance.record_id = instance.node;
      } else if (
        instance.record_type === 'nodeMark' &&
        instance.nodeMark !== undefined
      ) {
        instance.record_id = instance.nodeMark;
      } else if (
        instance.record_type === 'nodeQuestion' &&
        instance.nodeQuestion !== undefined
      ) {
        instance.record_id = instance.nodeQuestion;
      } else if (
        instance.record_type === 'semesterResult' &&
        instance.semesterResult !== undefined
      ) {
        instance.record_id = instance.semesterResult;
      }
      // To prevent mistakes:
      delete instance.provisionalGraduationList;
      delete instance.dataValues.provisionalGraduationList;
      delete instance.graduationList;
      delete instance.dataValues.graduationList;
      delete instance.result;
      delete instance.dataValues.result;
      delete instance.resultBatch;
      delete instance.dataValues.resultBatch;
      delete instance.node;
      delete instance.dataValues.node;
      delete instance.nodeMark;
      delete instance.dataValues.nodeMark;
      delete instance.nodeQuestion;
      delete instance.dataValues.nodeQuestion;
      delete instance.semesterResult;
      delete instance.dataValues.semesterResult;
    }
  });

  return ResultLog;
};
