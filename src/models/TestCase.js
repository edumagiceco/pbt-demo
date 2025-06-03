'use strict';

module.exports = (sequelize, DataTypes) => {
    const TestCase = sequelize.define('TestCase', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        problemId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'problem_id',
            references: {
                model: 'problems',
                key: 'id'
            }
        },
        input: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        expectedOutput: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'expected_output'
        },
        isHidden: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_hidden'
        },
        points: {
            type: DataTypes.INTEGER,
            defaultValue: 10
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    }, {
        tableName: 'test_cases',
        timestamps: true,
        underscored: true
    });

    TestCase.associate = function(models) {
        TestCase.belongsTo(models.Problem, {
            foreignKey: 'problem_id'
        });
    };

    return TestCase;
};
