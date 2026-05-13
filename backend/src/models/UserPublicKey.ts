import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserPublicKeyAttributes {
  user_id: number;
  public_key: string;
  created_at: Date;
  updated_at: Date;
}

interface UserPublicKeyCreationAttributes extends Optional<UserPublicKeyAttributes, 'created_at' | 'updated_at'> {}

export class UserPublicKey extends Model<UserPublicKeyAttributes, UserPublicKeyCreationAttributes> implements UserPublicKeyAttributes {
  public user_id!: number;
  public public_key!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

UserPublicKey.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'user',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    public_key: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'user_public_key',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);
