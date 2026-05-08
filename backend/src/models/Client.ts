import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ClientAttributes {
  idU_cl: number;
}

interface ClientCreationAttributes extends ClientAttributes {}

export class Client extends Model<ClientAttributes, ClientCreationAttributes> implements ClientAttributes {
  public idU_cl!: number;
}

Client.init(
  {
    idU_cl: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'user',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'client',
    timestamps: false,
  }
);
