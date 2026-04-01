import sequelize from '../config/database';
import { User } from './User';
import { Service } from './Service';
import { Booking } from './Booking';
import { Job } from './Job';
import { Review } from './Review';
import { Transaction } from './Transaction';
import { Schedule } from './Schedule';
import { Notification } from './Notification';

// User associations
User.hasMany(Service, { foreignKey: 'providerId', as: 'services' });
Service.belongsTo(User, { foreignKey: 'providerId', as: 'provider' });

User.hasMany(Booking, { foreignKey: 'clientId', as: 'clientBookings' });
User.hasMany(Booking, { foreignKey: 'providerId', as: 'providerBookings' });
Booking.belongsTo(User, { foreignKey: 'clientId', as: 'client' });
Booking.belongsTo(User, { foreignKey: 'providerId', as: 'provider' });

User.hasMany(Job, { foreignKey: 'clientId', as: 'clientJobs' });
User.hasMany(Job, { foreignKey: 'providerId', as: 'providerJobs' });
Job.belongsTo(User, { foreignKey: 'clientId', as: 'client' });
Job.belongsTo(User, { foreignKey: 'providerId', as: 'provider' });

User.hasMany(Review, { foreignKey: 'clientId', as: 'clientReviews' });
User.hasMany(Review, { foreignKey: 'providerId', as: 'providerReviews' });
Review.belongsTo(User, { foreignKey: 'clientId', as: 'client' });
Review.belongsTo(User, { foreignKey: 'providerId', as: 'provider' });

User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Schedule, { foreignKey: 'providerId', as: 'schedules' });
Schedule.belongsTo(User, { foreignKey: 'providerId', as: 'provider' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Service associations
Service.hasMany(Booking, { foreignKey: 'serviceId', as: 'bookings' });
Booking.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

Service.hasMany(Job, { foreignKey: 'serviceId', as: 'jobs' });
Job.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

Service.hasMany(Review, { foreignKey: 'serviceId', as: 'serviceReviews' });
Review.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

// Booking associations
Booking.hasOne(Job, { foreignKey: 'bookingId', as: 'job' });
Job.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

// Job associations
Job.hasMany(Transaction, { foreignKey: 'jobId', as: 'jobTransactions' });
Transaction.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

Job.hasMany(Review, { foreignKey: 'jobId', as: 'jobReviews' });
Review.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

export {
  sequelize,
  User,
  Service,
  Booking,
  Job,
  Review,
  Transaction,
  Schedule,
  Notification,
};
