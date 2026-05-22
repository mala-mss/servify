import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface ConcernsAttributes {
  id_dep: number;
  idU_CL: number;
  idU_SP: number;
  date: string;
  time: string;
}

export class Concerns extends Model<ConcernsAttributes> implements ConcernsAttributes {
  public id_dep!: number;
  public idU_CL!: number;
  public idU_SP!: number;
  public date!: string;
  public time!: string;
}

Concerns.init(
  {
    id_dep: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'id_dep',
      references: {
        model: 'dependant',
        key: 'id_dep',
      },
    },
    idU_CL: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'idU_CL',
    },
    idU_SP: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'idU_SP',
    },
    date: {
      type: DataTypes.DATEONLY,
      primaryKey: true,
      field: 'date',
    },
    time: {
      type: DataTypes.TIME,
      primaryKey: true,
      field: 'time',
    },
  },
  {
    sequelize,
    tableName: 'concerns',
    timestamps: false,
  }
);
