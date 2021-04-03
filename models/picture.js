'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const picture = loader.database.define(
  'pictures',
  {
    pictureId: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false
    },
    pictureTitle: {
      type: Sequelize.STRING,
      allowNull: false
    },
    statement: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    createdBy: {
      type: Sequelize.DECIMAL,
      allowNull: false
    },
    updatedAt: {
      type: Sequelize.DATE,
      timezone: "+09:00",
      allowNull: false
    },
    pictureUrl: {
      type: Sequelize.STRING,
      allowNull: false
    }
  },
  {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {
        fields: ['createdBy']
      }
    ]
  }
);

module.exports = picture;