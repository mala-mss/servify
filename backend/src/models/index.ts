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
import { ProviderAvailability } from './ProviderAvailability';
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
User.hasOne(Admin, { foreignKey: 'user_id', as: 'admin' });
Admin.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(Client, { foreignKey: 'user_id', as: 'client' });
Client.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(ServiceProvider, { foreignKey: 'user_id', as: 'provider' });
ServiceProvider.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Inscription Request
ServiceProvider.hasMany(InscriptionRequest, { foreignKey: 'service_provider_id', as: 'inscriptionRequests' });
InscriptionRequest.belongsTo(ServiceProvider, { foreignKey: 'service_provider_id', as: 'provider' });

// Authorized Person
Client.hasMany(AuthorizedPerson, { foreignKey: 'client_id', as: 'authorizedPersons' });
AuthorizedPerson.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

// Dependant & Medical Info
Client.hasMany(Dependant, { foreignKey: 'client_id_fk', as: 'dependants' });
Dependant.belongsTo(Client, { foreignKey: 'client_id_fk', as: 'client' });

Dependant.hasOne(MedicalInfo, { foreignKey: 'dependent_id', as: 'medicalInfo' });
MedicalInfo.belongsTo(Dependant, { foreignKey: 'dependent_id', as: 'dependant' });

Dependant.hasMany(DependantFile, { foreignKey: 'dependant_id', as: 'files' });
DependantFile.belongsTo(Dependant, { foreignKey: 'dependant_id', as: 'dependant' });

// Service & Category
ServiceCategory.hasMany(Service, { foreignKey: 'category_id_fk', as: 'services' });
Service.belongsTo(ServiceCategory, { foreignKey: 'category_id_fk', as: 'category' });

// Service Provider & Service (Junction)
ServiceProvider.belongsToMany(Service, { 
  through: ServiceProviderService,
  foreignKey: 'service_provider_id',
  otherKey: 'service_id',
  as: 'services'
});
Service.belongsToMany(ServiceProvider, {
  through: ServiceProviderService,
  foreignKey: 'service_id',
  otherKey: 'service_provider_id',
  as: 'providers'
});

// Provider Availability
ServiceProvider.hasMany(ProviderAvailability, { foreignKey: 'service_provider_id', as: 'availabilities' });
ProviderAvailability.belongsTo(ServiceProvider, { foreignKey: 'service_provider_id', as: 'provider' });

// Document & Specification
ServiceProvider.hasMany(Document, { foreignKey: 'service_provider_id', as: 'providerDocuments' });
Document.belongsTo(ServiceProvider, { foreignKey: 'service_provider_id', as: 'provider' });

Client.hasMany(Document, { foreignKey: 'client_id', as: 'clientDocuments' });
Document.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

Document.hasMany(Specification, { foreignKey: 'document_id', as: 'specifications' });
Specification.belongsTo(Document, { foreignKey: 'document_id', as: 'document' });

// Booking Request
Client.hasMany(BookingRequest, { foreignKey: 'client_id_fk', as: 'bookingRequests' });
BookingRequest.belongsTo(Client, { foreignKey: 'client_id_fk', as: 'client' });

ServiceProvider.hasMany(BookingRequest, { foreignKey: 'service_provider_id_fk', as: 'providerBookingRequests' });
BookingRequest.belongsTo(ServiceProvider, { foreignKey: 'service_provider_id_fk', as: 'provider' });

Service.hasMany(BookingRequest, { foreignKey: 'service_id', as: 'bookingRequests' });
BookingRequest.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });

Document.hasMany(BookingRequest, { foreignKey: 'document_id', as: 'bookingRequests' });
BookingRequest.belongsTo(Document, { foreignKey: 'document_id', as: 'document' });

// Booking
Client.hasMany(Booking, { foreignKey: 'client_id', as: 'bookings' });
Booking.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

ServiceProvider.hasMany(Booking, { foreignKey: 'service_provider_id', as: 'providerBookings' });
Booking.belongsTo(ServiceProvider, { foreignKey: 'service_provider_id', as: 'provider' });

Service.hasMany(Booking, { foreignKey: 'service_id', as: 'bookings' });
Booking.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });

// Payment
Booking.hasMany(Payment, { foreignKey: 'booking_id', as: 'payments' });
Payment.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

// Task & File
Client.hasMany(Task, { foreignKey: 'client_id', as: 'tasks' });
Task.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

ServiceProvider.hasMany(Task, { foreignKey: 'service_provider_id', as: 'providerTasks' });
Task.belongsTo(ServiceProvider, { foreignKey: 'service_provider_id', as: 'provider' });

Task.hasMany(File, { foreignKey: 'task_id', as: 'files' });
File.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });

// Report
Account.hasMany(Report, { foreignKey: 'reporter_email', as: 'sentReports' });
Account.hasMany(Report, { foreignKey: 'reported_email', as: 'receivedReports' });
Report.belongsTo(Account, { foreignKey: 'reporter_email', as: 'reporter' });
Report.belongsTo(Account, { foreignKey: 'reported_email', as: 'reported' });

// Feedback
Booking.hasMany(Feedback, { foreignKey: 'booking_id', as: 'feedbacks' });
Feedback.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

Client.hasMany(Feedback, { foreignKey: 'client_id', as: 'feedbacks' });
Feedback.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

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
  ProviderAvailability,
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
