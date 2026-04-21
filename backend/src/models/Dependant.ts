import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface DependantAttributes {
  id_dependant: number;
  name?: string;
  date_of_birth?: Date;
  relationship?: string;
  client_id_fk: number;
}

interface DependantCreationAttributes extends Optional<DependantAttributes, 'id_dependant' | 'name' | 'date_of_birth' | 'relationship'> {}

export class Dependant extends Model<DependantAttributes, DependantCreationAttributes> implements DependantAttributes {
  public id_dependant!: number;
  public name?: string;
  public date_of_birth?: Date;
  public relationship?: string;
  public client_id_fk!: number;
}

Dependant.init(
  {
    id_dependant: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
    },
    relationship: {
      type: DataTypes.STRING(50),
    },
    client_id_fk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'client',
        key: 'id_client',
      },
    },
  },
  {
    sequelize,
    tableName: 'dependant',
    timestamps: false,
  }
);
