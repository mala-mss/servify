import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ReviewAttributes {
  id: string;
  clientId: string;
  providerId: string;
  jobId?: string;
  serviceId?: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'id' | 'jobId' | 'serviceId' | 'isVisible' | 'createdAt' | 'updatedAt'> {}

export class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
  public id!: string;
  public clientId!: string;
  public providerId!: string;
  public jobId?: string;
  public serviceId?: string;
  public rating!: number;
  public comment!: string;
  public isVisible!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Review.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    providerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    jobId: {
      type: DataTypes.UUID,
      references: {
        model: 'jobs',
        key: 'id',
      },
    },
    serviceId: {
      type: DataTypes.UUID,
      references: {
        model: 'services',
        key: 'id',
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isVisible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'reviews',
    timestamps: true,
  }
);
