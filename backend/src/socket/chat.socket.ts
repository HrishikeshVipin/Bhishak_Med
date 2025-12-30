import { Server as SocketIOServer, Socket } from 'socket.io';
import prisma from '../config/database';
import { notificationService } from '../services/notification.service';

// Track active users in consultations
const consultationUsers = new Map<string, Map<string, { userType: 'doctor' | 'patient'; socketId: string }>>();

export const initializeChatSocket = (io: SocketIOServer) => {
  io.on('connection', (socket: Socket) => {
    console.log('✅ Client connected:', socket.id);

    // Track which consultation this socket is in
    let currentConsultation: string | null = null;
    let currentUserType: 'doctor' | 'patient' | null = null;

    // Join doctor's personal room for notifications
    socket.on('join-doctor-room', async (data: { doctorId: string }) => {
      try {
        const { doctorId } = data;
        const roomName = `doctor-${doctorId}`;
        socket.join(roomName);
        console.log(`👨‍⚕️ Doctor ${doctorId} joined their personal notification room: ${roomName}`);

        socket.emit('joined-doctor-room', {
          doctorId,
          message: 'Successfully joined doctor notification room',
        });
      } catch (error: any) {
        console.error('Join doctor room error:', error);
        socket.emit('error', {
          message: 'Failed to join doctor room',
          error: error.message,
        });
      }
    });

    // Join admin's personal room for notifications
    socket.on('join-admin-room', async (data: { adminId: string }) => {
      try {
        const { adminId } = data;
        const roomName = `admin-${adminId}`;
        socket.join(roomName);
        console.log(`👤 Admin ${adminId} joined their personal notification room: ${roomName}`);

        socket.emit('joined-admin-room', {
          adminId,
          message: 'Successfully joined admin notification room',
        });
      } catch (error: any) {
        console.error('Join admin room error:', error);
        socket.emit('error', {
          message: 'Failed to join admin room',
          error: error.message,
        });
      }
    });

    // Join patient's personal room for notifications
    socket.on('join-patient-room', async (data: { patientId: string }) => {
      try {
        const { patientId } = data;
        const roomName = `patient-${patientId}`;
        socket.join(roomName);
        console.log(`🧑‍⚕️ Patient ${patientId} joined their personal notification room: ${roomName}`);

        socket.emit('joined-patient-room', {
          patientId,
          message: 'Successfully joined patient notification room',
        });
      } catch (error: any) {
        console.error('Join patient room error:', error);
        socket.emit('error', {
          message: 'Failed to join patient room',
          error: error.message,
        });
      }
    });

    // Join consultation room
    socket.on('join-consultation', async (data: { consultationId: string; userType: 'doctor' | 'patient'; userName: string }) => {
      try {
        const { consultationId, userType, userName } = data;

        // Track this socket's consultation
        currentConsultation = consultationId;
        currentUserType = userType;

        // Join the room
        socket.join(consultationId);

        // Track user in consultation
        if (!consultationUsers.has(consultationId)) {
          consultationUsers.set(consultationId, new Map());
        }
        consultationUsers.get(consultationId)!.set(userType, { userType, socketId: socket.id });

        console.log(`👤 ${userName} (${userType}) joined consultation: ${consultationId}`);

        // Notify others in the room
        socket.to(consultationId).emit('user-joined', {
          userType,
          userName,
          timestamp: new Date().toISOString(),
        });

        // Send confirmation to the user who joined
        socket.emit('joined-consultation', {
          consultationId,
          message: `Successfully joined consultation`,
        });

        // Notify who else is already online in the consultation
        const usersInConsultation = consultationUsers.get(consultationId);
        if (usersInConsultation) {
          usersInConsultation.forEach((user, type) => {
            if (type !== userType) {
              // Tell the newly joined user that the other user is online
              socket.emit('user-status-changed', {
                userType: type,
                isOnline: true,
                timestamp: new Date().toISOString(),
              });
            }
          });
        }
      } catch (error: any) {
        console.error('Join consultation error:', error);
        socket.emit('error', {
          message: 'Failed to join consultation',
          error: error.message,
        });
      }
    });

    // User online status in consultation (presence tracking)
    socket.on('user-online-in-consultation', (data: { consultationId: string; userType: 'doctor' | 'patient' }) => {
      const { consultationId, userType } = data;
      console.log(`✅ ${userType} is online in consultation: ${consultationId}`);

      // Broadcast to others in the room
      socket.to(consultationId).emit('user-status-changed', {
        userType,
        isOnline: true,
        timestamp: new Date().toISOString(),
      });
    });

    // User offline status
    socket.on('user-offline-in-consultation', (data: { consultationId: string; userType: 'doctor' | 'patient' }) => {
      const { consultationId, userType } = data;
      console.log(`❌ ${userType} is offline in consultation: ${consultationId}`);

      socket.to(consultationId).emit('user-status-changed', {
        userType,
        isOnline: false,
        timestamp: new Date().toISOString(),
      });
    });

    // Video call initiation (doctor only)
    socket.on('initiate-video-call', (data: { consultationId: string; doctorName: string }) => {
      const { consultationId, doctorName } = data;
      console.log(`📹 Doctor ${doctorName} initiating video call in consultation: ${consultationId}`);

      // Notify patient in the room
      socket.to(consultationId).emit('incoming-video-call', {
        consultationId,
        doctorName,
        timestamp: new Date().toISOString(),
      });
    });

    // Video call accepted (patient)
    socket.on('accept-video-call', (data: { consultationId: string; patientName: string }) => {
      const { consultationId, patientName } = data;
      console.log(`✅ Patient ${patientName} accepted video call in consultation: ${consultationId}`);

      // Notify doctor that patient accepted
      socket.to(consultationId).emit('video-call-accepted', {
        consultationId,
        patientName,
        timestamp: new Date().toISOString(),
      });
    });

    // Video call declined (patient)
    socket.on('decline-video-call', (data: { consultationId: string; patientName: string; reason?: string }) => {
      const { consultationId, patientName, reason } = data;
      console.log(`❌ Patient ${patientName} declined video call in consultation: ${consultationId}`);

      // Notify doctor that patient declined
      socket.to(consultationId).emit('video-call-declined', {
        consultationId,
        patientName,
        reason: reason || 'Patient declined the call',
        timestamp: new Date().toISOString(),
      });
    });

    // Send message
    socket.on('send-message', async (data: {
      consultationId: string;
      senderType: 'doctor' | 'patient';
      senderName: string;
      message: string;
    }) => {
      try {
        const { consultationId, senderType, senderName, message } = data;

        // Get consultation with patient status
        const consultation = await prisma.consultation.findUnique({
          where: { id: consultationId },
          include: {
            patient: { select: { id: true, fullName: true, status: true } },
            doctor: { select: { id: true, fullName: true, email: true, emailNotifications: true, chatNotifications: true } },
          },
        });

        if (!consultation) {
          socket.emit('error', {
            message: 'Consultation not found',
          });
          return;
        }

        // Check waitlist message limit (10 messages max for waitlisted patients)
        if (consultation.patient.status === 'WAITLISTED') {
          const messageCount = await prisma.chatMessage.count({
            where: { consultationId },
          });

          const WAITLIST_MESSAGE_LIMIT = 10;

          if (messageCount >= WAITLIST_MESSAGE_LIMIT) {
            socket.emit('message-limit-reached', {
              message: `Message limit reached (${WAITLIST_MESSAGE_LIMIT} messages). Please wait for doctor to activate your account.`,
              limit: WAITLIST_MESSAGE_LIMIT,
              currentCount: messageCount,
            });
            return;
          }
        }

        // Save message to database
        const chatMessage = await prisma.chatMessage.create({
          data: {
            consultationId,
            senderType,
            message,
            isRead: false, // Default to unread
          },
        });

        // Update consultation tracking and send notifications
        if (consultation) {
          // Update consultation last message tracking
          await prisma.consultation.update({
            where: { id: consultationId },
            data: {
              lastMessageAt: new Date(),
              lastMessageSender: senderType,
              hasUnreadMessages: senderType === 'patient', // Set true if patient sent message
            },
          });

          // Notify doctor if patient sent message
          if (senderType === 'patient' && consultation.doctor.chatNotifications) {
            // Create in-app notification
            await notificationService.createNotification({
              recipientType: 'DOCTOR',
              recipientId: consultation.doctor.id,
              type: 'NEW_CHAT',
              title: `New message from ${consultation.patient.fullName}`,
              message: message.substring(0, 100),
              actionUrl: `/doctor/patients/${consultation.patient.id}/consult`,
              actionText: 'View Chat',
              metadata: {
                doctorName: consultation.doctor.fullName,
                patientName: consultation.patient.fullName,
                message,
              },
              sendEmail: consultation.doctor.emailNotifications,
              recipientEmail: consultation.doctor.email,
            });

            // Emit real-time unread notification
            io.to(`doctor-${consultation.doctor.id}`).emit('new-unread-message', {
              consultationId,
              patientName: consultation.patient.fullName,
              message,
              timestamp: chatMessage.createdAt,
            });
          }

          // Notify patient if doctor replied
          if (senderType === 'doctor') {
            io.to(`patient-${consultation.patient.id}`).emit('doctor-reply-notification', {
              consultationId,
              doctorName: consultation.doctor.fullName,
              message: message.substring(0, 100),
              timestamp: chatMessage.createdAt,
            });
          }
        }

        // Broadcast message to all users in the consultation room EXCEPT sender
        // Sender will see their own message via optimistic UI update

        // Debug: Check who's in the room
        const socketsInRoom = await io.in(consultationId).fetchSockets();
        console.log(`📊 Sockets in room ${consultationId}:`, socketsInRoom.length, 'sockets');
        console.log(`   Sender socket: ${socket.id}`);
        console.log(`   All sockets: ${socketsInRoom.map(s => s.id).join(', ')}`);

        socket.to(consultationId).emit('receive-message', {
          id: chatMessage.id,
          consultationId,
          senderType,
          senderName,
          message,
          createdAt: chatMessage.createdAt,
        });

        // Send confirmation back to sender with the saved message ID
        socket.emit('message-sent', {
          id: chatMessage.id,
          consultationId,
          senderType,
          senderName,
          message,
          createdAt: chatMessage.createdAt,
        });

        console.log(`💬 Message in ${consultationId} from ${senderName} (${senderType}): ${message.substring(0, 50)}...`);
      } catch (error: any) {
        console.error('Send message error:', error);
        socket.emit('error', {
          message: 'Failed to send message',
          error: error.message,
        });
      }
    });

    // Typing indicator
    socket.on('typing', (data: { consultationId: string; userType: 'doctor' | 'patient'; userName: string }) => {
      const { consultationId, userType, userName } = data;
      socket.to(consultationId).emit('user-typing', {
        userType,
        userName,
      });
    });

    // Stop typing indicator
    socket.on('stop-typing', (data: { consultationId: string }) => {
      const { consultationId } = data;
      socket.to(consultationId).emit('user-stop-typing');
    });

    // Leave consultation
    socket.on('leave-consultation', (data: { consultationId: string; userType: 'doctor' | 'patient'; userName: string }) => {
      const { consultationId, userType, userName } = data;
      socket.leave(consultationId);

      console.log(`👋 ${userName} (${userType}) left consultation: ${consultationId}`);

      // Notify others
      socket.to(consultationId).emit('user-left', {
        userType,
        userName,
        timestamp: new Date().toISOString(),
      });
    });

    // End consultation (doctor only)
    socket.on('end-consultation', async (data: { consultationId: string }) => {
      try {
        const { consultationId } = data;

        // Update consultation status
        await prisma.consultation.update({
          where: { id: consultationId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });

        // Notify all users in the room
        io.to(consultationId).emit('consultation-ended', {
          consultationId,
          timestamp: new Date().toISOString(),
        });

        console.log(`✅ Consultation ended: ${consultationId}`);
      } catch (error: any) {
        console.error('End consultation error:', error);
        socket.emit('error', {
          message: 'Failed to end consultation',
          error: error.message,
        });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);

      // If user was in a consultation, notify others they went offline
      if (currentConsultation && currentUserType) {
        console.log(`❌ ${currentUserType} disconnected from consultation: ${currentConsultation}`);

        // Remove from tracking
        const usersInConsultation = consultationUsers.get(currentConsultation);
        if (usersInConsultation) {
          usersInConsultation.delete(currentUserType);

          // Clean up empty consultations
          if (usersInConsultation.size === 0) {
            consultationUsers.delete(currentConsultation);
          }
        }

        // Notify others in the consultation
        socket.to(currentConsultation).emit('user-status-changed', {
          userType: currentUserType,
          isOnline: false,
          timestamp: new Date().toISOString(),
        });
      }
    });
  });
};
