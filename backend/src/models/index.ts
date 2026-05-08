import sequelize from '../config/database';
import { Account } from './Account';
import { User } from './User';
import { Admin } from './Admin';
import { Client } from './Client';
import { ServiceProvider } from './ServiceProvider';
import { InscriptionRequest } from './InscriptionRequest';
import { AuthorizedPerson } from './AuthorizedPerson';
import { Dependant } from './Dependant';
import { MedicalInfo } from './MedicalInfo';
import { DependantFile } from './DependantFile';
import { ServiceCategory } from './ServiceCategory';
import { Service } from './Service';
import { ServiceProviderService } from './ServiceProviderService';
import { Document } from './Document';
import { Specification } from './Specification';
import { BookingRequest } from './BookingRequest';
import { Booking } from './Booking';
import { Payment } from './Payment';
import { Task } from './Task';
import { File } from './File';
import { Report } from './Report';
import { Feedback } from './Feedback';
import { Notification } from './Notification';

// Account & User
Account.hasOne(User, { foreignKey: 'email', sourceKey: 'email', as: 'user' });
User.belongsTo(Account, { foreignKey: 'email', targetKey: 'email', as: 'account' });

// Role Associations
User.hasOne(Admin, { foreignKey: 'idU_A', as: 'admin' });
Admin.belongsTo(User, { foreignKey: 'idU_A', as: 'user' });

User.hasOne(Client, { foreignKey: 'idU_cl', as: 'client' });
Client.belongsTo(User, { foreignKey: 'idU_cl', as: 'user' });

User.hasOne(ServiceProvider, { foreignKey: 'idU_SP', as: 'provider' });
ServiceProvider.belongsTo(User, { foreignKey: 'idU_SP', as: 'user' });

// Inscription Request
ServiceProvider.hasMany(InscriptionRequest, { foreignKey: 'id_U_SP', as: 'inscriptionRequests' });
InscriptionRequest.belongsTo(ServiceProvider, { foreignKey: 'id_U_SP', as: 'provider' });

// Authorized Person
Client.hasMany(AuthorizedPerson, { foreignKey: 'id_U_CL', as: 'authorizedPersons' });
AuthorizedPerson.belongsTo(Client, { foreignKey: 'id_U_CL', as: 'client' });

// Dependant & Medical Info
Client.hasMany(Dependant, { foreignKey: 'id_U_CL', as: 'dependants' });
Dependant.belongsTo(Client, { foreignKey: 'id_U_CL', as: 'client' });

Dependant.hasOne(MedicalInfo, { foreignKey: 'id_dep', as: 'medicalInfo' });
MedicalInfo.belongsTo(Dependant, { foreignKey: 'id_dep', as: 'dependant' });

Dependant.hasMany(DependantFile, { foreignKey: 'id_dep', as: 'files' });
DependantFile.belongsTo(Dependant, { foreignKey: 'id_dep', as: 'dependant' });

// Service & Category
ServiceCategory.hasMany(Service, { foreignKey: 'id_C', as: 'services' });
Service.belongsTo(ServiceCategory, { foreignKey: 'id_C', as: 'category' });

// Service Provider & Service (Junction)
ServiceProvider.belongsToMany(Service, { 
  through: ServiceProviderService,
  foreignKey: 'idU_SP',
  otherKey: 'id_S',
  as: 'services'
});
Service.belongsToMany(ServiceProvider, {
  through: ServiceProviderService,
  foreignKey: 'id_S',
  otherKey: 'idU_SP',
  as: 'providers'
});

// Provider Availability (Fields are now in ServiceProvider model, keeping association if model exists)
// ServiceProvider.hasMany(ProviderAvailability, { foreignKey: 'service_provider_id', as: 'availabilities' });

// Document & Specification
ServiceProvider.hasMany(Document, { foreignKey: 'idU_SP', as: 'providerDocuments' });
Document.belongsTo(ServiceProvider, { foreignKey: 'idU_SP', as: 'provider' });

Client.hasMany(Document, { foreignKey: 'idU_CL', as: 'clientDocuments' });
Document.belongsTo(Client, { foreignKey: 'idU_CL', as: 'client' });

Document.hasMany(Specification, { foreignKey: 'id_DOC', as: 'specifications' });
Specification.belongsTo(Document, { foreignKey: 'id_DOC', as: 'document' });

// Booking Request
Client.hasMany(BookingRequest, { foreignKey: 'idU_cl', as: 'bookingRequests' });
BookingRequest.belongsTo(Client, { foreignKey: 'idU_cl', as: 'client' });

ServiceProvider.hasMany(BookingRequest, { foreignKey: 'idU_SP', as: 'providerBookingRequests' });
BookingRequest.belongsTo(ServiceProvider, { foreignKey: 'idU_SP', as: 'provider' });

Service.hasMany(BookingRequest, { foreignKey: 'service_id', as: 'bookingRequests' });
BookingRequest.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });

// Booking
Client.hasMany(Booking, { foreignKey: 'idU_cl', as: 'bookings' });
Booking.belongsTo(Client, { foreignKey: 'idU_cl', as: 'client' });

ServiceProvider.hasMany(Booking, { foreignKey: 'idU_SP', as: 'providerBookings' });
Booking.belongsTo(ServiceProvider, { foreignKey: 'idU_SP', as: 'provider' });

// Payment
Service.hasMany(Payment, { foreignKey: 'id_S', as: 'payments' });
Payment.belongsTo(Service, { foreignKey: 'id_S', as: 'service' });

// Task & File
Client.hasMany(Task, { foreignKey: 'idU_cl', as: 'tasks' });
Task.belongsTo(Client, { foreignKey: 'idU_cl', as: 'client' });

ServiceProvider.hasMany(Task, { foreignKey: 'idU_SP', as: 'providerTasks' });
Task.belongsTo(ServiceProvider, { foreignKey: 'idU_SP', as: 'provider' });

Task.hasMany(File, { foreignKey: 'idT', as: 'files' });
File.belongsTo(Task, { foreignKey: 'idT', as: 'task' });

// Report
Account.hasMany(Report, { foreignKey: 'id_reporter', as: 'sentReports' });
Account.hasMany(Report, { foreignKey: 'id_reported', as: 'receivedReports' });
Report.belongsTo(Account, { foreignKey: 'id_reporter', as: 'reporter' });
Report.belongsTo(Account, { foreignKey: 'id_reported', as: 'reported' });

// Feedback
Client.hasMany(Feedback, { foreignKey: 'idU_cl', as: 'feedbacks' });
Feedback.belongsTo(Client, { foreignKey: 'idU_cl', as: 'client' });

ServiceProvider.hasMany(Feedback, { foreignKey: 'idU_SP', as: 'providerFeedbacks' });
Feedback.belongsTo(ServiceProvider, { foreignKey: 'idU_SP', as: 'provider' });

// Notification
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export {
  sequelize,
  Account,
  User,
  Admin,
  Client,
  ServiceProvider,
  InscriptionRequest,
  AuthorizedPerson,
  Dependant,
  MedicalInfo,
  DependantFile,
  ServiceCategory,
  Service,
  ServiceProviderService,
  Document,
  Specification,
  BookingRequest,
  Booking,
  Payment,
  Task,
  File,
  Report,
  Feedback,
  Notification,
};
