import sequelize from '../config/database';
import { Account } from './Account';
import { User } from './User';
import { Admin } from './Admin';
import { Client } from './Client';
import { ServiceProvider } from './ServiceProvider';
import { InscriptionRequest } from './InscriptionRequest';
import { DocCv } from './DocCv';
import { AuthorizedPerson } from './AuthorizedPerson';
import { Dependant } from './Dependant';
import { SpecificationsMedicalStat } from './SpecificationsMedicalStat';
import { ServiceCategory } from './ServiceCategory';
import { Service } from './Service';
import { ServiceProviderService } from './ServiceProviderService';
import { DocumentRequest } from './DocumentRequest';
import { BookingRequest } from './BookingRequest';
import { Booking } from './Booking';
import { Concerns } from './Concerns';
import { Payment } from './Payment';
import { Task } from './Task';
import { File } from './File';
import { Report } from './Report';
import { Feedback } from './Feedback';
import { Notification } from './Notification';
import { Conversation } from './Conversation';
import { Message } from './Message';
import { UserPublicKey } from './UserPublicKey';

// --- Associations ---

// 1. Account & User
Account.hasOne(User, { foreignKey: 'email', sourceKey: 'email', as: 'user' });
User.belongsTo(Account, { foreignKey: 'email', targetKey: 'email', as: 'account' });

// 2. User & Roles
User.hasOne(Admin, { foreignKey: 'idU_A', as: 'admin' });
Admin.belongsTo(User, { foreignKey: 'idU_A', as: 'user' });

User.hasOne(Client, { foreignKey: 'idU_CL', as: 'client' });
Client.belongsTo(User, { foreignKey: 'idU_CL', as: 'user' });

User.hasOne(ServiceProvider, { foreignKey: 'idU_SP', as: 'serviceProvider' });
ServiceProvider.belongsTo(User, { foreignKey: 'idU_SP', as: 'user' });

// 3. InscriptionRequest
Admin.hasMany(InscriptionRequest, { foreignKey: 'idU_A', as: 'handledRequests' });
InscriptionRequest.belongsTo(Admin, { foreignKey: 'idU_A', as: 'admin' });

// 4. DocCv
InscriptionRequest.hasMany(DocCv, { foreignKey: 'id_R', as: 'documents' });
DocCv.belongsTo(InscriptionRequest, { foreignKey: 'id_R', as: 'request' });

ServiceProvider.hasMany(DocCv, { foreignKey: 'idU_SP', as: 'cvDocuments' });
DocCv.belongsTo(ServiceProvider, { foreignKey: 'idU_SP', as: 'provider' });

// 5. AuthorizedPerson
Client.hasMany(AuthorizedPerson, { foreignKey: 'idU_CL', as: 'authorizedPersons' });
AuthorizedPerson.belongsTo(Client, { foreignKey: 'idU_CL', as: 'client' });

// 6. Dependant & SpecificationsMedicalStat
Client.hasMany(Dependant, { foreignKey: 'idU_CL', as: 'dependants' });
Dependant.belongsTo(Client, { foreignKey: 'idU_CL', as: 'client' });

Dependant.hasMany(SpecificationsMedicalStat, { foreignKey: 'id_dep', as: 'medicalStats' });
SpecificationsMedicalStat.belongsTo(Dependant, { foreignKey: 'id_dep', as: 'dependant' });

// 7. ServiceCategory & Service
ServiceCategory.hasMany(Service, { foreignKey: 'id_C', as: 'services' });
Service.belongsTo(ServiceCategory, { foreignKey: 'id_C', as: 'category' });

// 8. Providing (ServiceProvider <-> Service)
ServiceProvider.belongsToMany(Service, {
  through: ServiceProviderService,
  foreignKey: 'idU_SP',
  otherKey: 'id_S',
  as: 'services',
});
Service.belongsToMany(ServiceProvider, {
  through: ServiceProviderService,
  foreignKey: 'id_S',
  otherKey: 'idU_SP',
  as: 'providers',
});

// 9. DocumentRequest
Client.hasMany(DocumentRequest, { foreignKey: 'idU_CL', as: 'documentRequests' });
DocumentRequest.belongsTo(Client, { foreignKey: 'idU_CL', as: 'client' });

ServiceProvider.hasMany(DocumentRequest, { foreignKey: 'idU_SP', as: 'providerDocumentRequests' });
DocumentRequest.belongsTo(ServiceProvider, { foreignKey: 'idU_SP', as: 'provider' });

// 10. BookingRequest
Client.hasMany(BookingRequest, { foreignKey: 'idU_CL', as: 'sentBookingRequests' });
BookingRequest.belongsTo(Client, { foreignKey: 'idU_CL', as: 'client' });

ServiceProvider.hasMany(BookingRequest, { foreignKey: 'idU_SP', as: 'receivedBookingRequests' });
BookingRequest.belongsTo(ServiceProvider, { foreignKey: 'idU_SP', as: 'provider' });

Service.hasMany(BookingRequest, { foreignKey: 'id_S', as: 'bookingRequests' });
BookingRequest.belongsTo(Service, { foreignKey: 'id_S', as: 'service' });

// 11. Booking
Client.hasMany(Booking, { foreignKey: 'idU_CL', as: 'bookings' });
Booking.belongsTo(Client, { foreignKey: 'idU_CL', as: 'client' });

ServiceProvider.hasMany(Booking, { foreignKey: 'idU_SP', as: 'providerBookings' });
Booking.belongsTo(ServiceProvider, { foreignKey: 'idU_SP', as: 'provider' });

Service.hasMany(Booking, { foreignKey: 'id_S', as: 'bookings' });
Booking.belongsTo(Service, { foreignKey: 'id_S', as: 'service' });

// 12. Concerns (Linked to Booking via composite key)
// Note: Sequelize associations for composite keys are limited. Usually handled via manual queries or custom methods if needed.
// However, we can define the relationship to Dependant.
Dependant.hasMany(Concerns, { foreignKey: 'id_dep', as: 'concerns' });
Concerns.belongsTo(Dependant, { foreignKey: 'id_dep', as: 'dependant' });

// 13. Payment (Linked to Booking via composite key)
Booking.hasMany(Payment, { 
  foreignKey: 'idU_CL', 
  sourceKey: 'idU_CL',
  as: 'payments' 
});
// Payment.belongsTo(Booking, { foreignKey: 'idU_CL', targetKey: 'idU_CL' }); // Simplified

// 14. Task & File
Booking.hasMany(Task, { 
  foreignKey: 'idU_CL',
  sourceKey: 'idU_CL',
  as: 'tasks'
});
Task.hasMany(File, { foreignKey: 'idT', as: 'files' });
File.belongsTo(Task, { foreignKey: 'idT', as: 'task' });

// 15. Report
Account.hasMany(Report, { foreignKey: 'email1', as: 'sentReports' });
Report.belongsTo(Account, { foreignKey: 'email1', as: 'reporter' });

Account.hasMany(Report, { foreignKey: 'email2', as: 'receivedReports' });
Report.belongsTo(Account, { foreignKey: 'email2', as: 'reported' });

// 16. Feedback
Account.hasMany(Feedback, { foreignKey: 'email1', as: 'sentFeedbacks' });
Feedback.belongsTo(Account, { foreignKey: 'email1', as: 'reporter' });

Account.hasMany(Feedback, { foreignKey: 'email2', as: 'receivedFeedbacks' });
Feedback.belongsTo(Account, { foreignKey: 'email2', as: 'reported' });

// 17. Notification
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 18. Conversation & Message
Client.hasMany(Conversation, { foreignKey: 'idU_CL', as: 'conversations' });
Conversation.belongsTo(Client, { foreignKey: 'idU_CL', as: 'client' });

ServiceProvider.hasMany(Conversation, { foreignKey: 'idU_SP', as: 'providerConversations' });
Conversation.belongsTo(ServiceProvider, { foreignKey: 'idU_SP', as: 'provider' });

Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });

User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// 19. UserPublicKey
User.hasOne(UserPublicKey, { foreignKey: 'user_id', as: 'publicKey' });
UserPublicKey.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export {
  sequelize,
  Account,
  User,
  Admin,
  Client,
  ServiceProvider,
  InscriptionRequest,
  DocCv,
  AuthorizedPerson,
  Dependant,
  SpecificationsMedicalStat,
  ServiceCategory,
  Service,
  ServiceProviderService,
  DocumentRequest,
  BookingRequest,
  Booking,
  Concerns,
  Payment,
  Task,
  File,
  Report,
  Feedback,
  Notification,
  Conversation,
  Message,
  UserPublicKey,
};
