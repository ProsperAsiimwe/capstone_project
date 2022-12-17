'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Get the roles from roles Table.
      this.roles = this.belongsToMany(models.Role, {
        through: models.UserRole,
        as: 'roles',
        foreignKey: 'user_id',
        otherKey: 'role_id',
      });

      // Use this to save data to UserRole table.
      this.userRoles = this.hasMany(models.UserRole, {
        as: 'userRoles',
        foreignKey: 'user_id',
      });
      // model
      this.userRoleBoundValues = this.hasMany(models.UserRoleBoundValues, {
        as: 'userRoleBoundValues',
        foreignKey: 'user_id',
      });
      // model
      this.boundCampuses = this.hasMany(models.UserBoundCampus, {
        as: 'boundCampuses',
        foreignKey: 'user_id',
      });
      // model
      this.boundProgrammes = this.hasMany(models.UserBoundProgramme, {
        as: 'boundProgrammes',
        foreignKey: 'user_id',
      });
      // model
      this.boundColleges = this.hasMany(models.UserBoundCollege, {
        as: 'boundColleges',
        foreignKey: 'user_id',
      });
      // model
      this.boundFaculties = this.hasMany(models.UserBoundFaculty, {
        as: 'boundFaculties',
        foreignKey: 'user_id',
      });
      // model
      this.boundDepartments = this.hasMany(models.UserBoundDepartment, {
        as: 'boundDepartments',
        foreignKey: 'user_id',
      });
      // model
      this.userDetails = this.hasOne(models.UserDetails, {
        as: 'userDetails',
        foreignKey: 'user_id',
      });

      // // bound level values
      // this.userBoundLevels = this.hasMany(models.UserBoundLevel, {
      //   as: 'userBoundLevels',
      //   foreignKey: 'user_id',
      //   constraints: false,
      // });

      // Get the admins Role Groups.
      this.roleGroups = this.belongsToMany(models.UserRoleGroup, {
        through: models.UserRoleGroupAdmin,
        as: 'roleGroups',
        foreignKey: 'user_id',
        otherKey: 'user_role_group_id',
      });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      surname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      other_names: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      has_temporary_access: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      access_until: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      staff_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      office: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      avatar: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      has_read_only_access: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      remember_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      email_verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      is_default_password: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      last_password_changed_at: {
        type: DataTypes.DATE,
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
      modelName: 'User',
      tableName: 'users',
      underscored: true,
      timestamps: true,
      schema: 'user_mgt',
      defaultScope: {
        attributes: { exclude: ['password'] },
      },
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return User;
};
