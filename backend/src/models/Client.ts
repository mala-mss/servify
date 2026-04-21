import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ClientAttributes {
  id_client: number;
  user_id: number;
}

interface ClientCreationAttributes extends Optional<ClientAttributes, 'id_client'> {}

export class Client extends Model<ClientAttributes, ClientCreationAttributes> implements ClientAttributes {
  public id_client!: number;
  public user_id!: number;
}

Client.init(
  {
    id_client: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
