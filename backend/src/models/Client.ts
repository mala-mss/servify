import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface ClientAttributes {
  idU_CL: number;
}

interface ClientCreationAttributes extends ClientAttributes {}

export class Client extends Model<ClientAttributes, ClientCreationAttributes> implements ClientAttributes {
  public idU_CL!: number;
}

Client.init(
  {
    idU_CL: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'idU_CL',
      references: {
        model: 'user',
        key: 'IdU',
      },
    },
  },
  {
    sequelize,
    tableName: 'client',
    timestamps: false,
  }
);

export default Client;
