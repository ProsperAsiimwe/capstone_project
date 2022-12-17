'use strict';

const { Model, Deferrable } = require('sequelize');
const User = require('../UserAccess/user.model');
const MetadataValue = require('../App/metadataValue.model');
const AssignmentCourse = require('../courseAssignment/assignmentCourse.model');
const AssignmentCourseLecturer = require('../courseAssignment/assignmentCourseLecturer.model');
const Grading = require('../ProgrammeManager/grading.model');

module.exports = (sequelize, DataTypes) => {
  class ResultAllocationNode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Belongs to model
      this.course = this.belongsTo(models.AssignmentCourse, {
        as: 'course',
        foreignKey: 'course_assignment_id',
      });
      // Belongs to model
      this.nodeLecturer = this.belongsTo(models.AssignmentCourseLecturer, {
        as: 'nodeLecturer',
        foreignKey: 'node_lecturer_id',
      });
      // Belongs to model
      this.parentNode = this.belongsTo(models.ResultAllocationNode, {
        as: 'parentNode',
        foreignKey: 'parent_node_id',
      });
      // Has Many Child Nodes
      this.childNodes = this.hasMany(models.ResultAllocationNode, {
        as: 'childNodes',
        foreignKey: 'parent_node_id',
      });
      // Has NODE MARKS
      this.nodeMarks = this.hasMany(models.NodeMark, {
        as: 'nodeMarks',
        foreignKey: 'result_allocation_node_id',
      });
      // Belongs to model
      this.grading = this.belongsTo(models.Grading, {
        as: 'grading',
        foreignKey: 'grading_id',
      });
      // Belongs to model
      this.algorithm = this.belongsTo(models.MetadataValue, {
        as: 'algorithm',
        foreignKey: 'marks_computation_method_id',
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

  ResultAllocationNode.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      course_assignment_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: AssignmentCourse,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      node_lecturer_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: AssignmentCourseLecturer,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      parent_node_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: ResultAllocationNode,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      grading_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: Grading,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      marks_computation_method_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      node_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      node_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      percentage_contribution: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      pass_mark: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      is_upload_node: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      marks_uploaded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      marks_upload_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_submitted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      is_computed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      approved_by_lecturer: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      date_lecturer_approved: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      approved_by_head: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      head_of_department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      date_head_approved: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      approved_by_registrar: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      registrar_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      date_registrar_approved: {
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
      modelName: 'ResultAllocationNode',
      tableName: 'result_allocation_nodes',
      timestamps: true,
      underscored: true,
      schema: 'results_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return ResultAllocationNode;
};
