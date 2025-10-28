import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Calendar, Users, Wallet, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  category: 'inscription' | 'networking' | 'finance' | 'general';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface NotificationPushProps {
  userProfile?: 'agence' | 'fanaf' | 'agent';
}

export function NotificationPush({ userProfile = 'agence' }: NotificationPushProps) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const baseNotifications: Notification[] = [
      {
        id: '1',
        type: 'info' as const,
        category: 'inscription' as const,
        title: 'Nouvelle inscription',
        message: 'Jean Dupont (Membre) vient de finaliser son inscription',
        timestamp: new Date(Date.now() - 5 * 60000),
        read: false,
      },
      {
        id: '3',
        type: 'warning' as const,
        category: 'networking' as const,
        title: 'Demande de rendez-vous',
        message: '3 nouvelles demandes de rendez-vous sponsor en attente',
        timestamp: new Date(Date.now() - 30 * 60000),
        read: false,
      },
    ];

    // Ajouter notification finance uniquement pour Admin FANAF
    if (userProfile === 'fanaf') {
      baseNotifications.splice(1, 0, {
        id: '2',
        type: 'success' as const,
        category: 'finance' as const,
        title: 'Paiement reçu',
        message: '400.000 FCFA encaissé via Orange Money',
        timestamp: new Date(Date.now() - 15 * 60000),
        read: false,
      });
    }

    // Ajouter notifications spécifiques pour Agent FANAF
    if (userProfile === 'agent') {
      baseNotifications.push({
        id: '4',
        type: 'warning' as const,
        category: 'finance' as const,
        title: 'Paiements en attente',
        message: '5 inscriptions en attente de finalisation de paiement',
        timestamp: new Date(Date.now() - 15 * 60000),
        read: false,
      });
    }

    return baseNotifications;
  });
  const [showPopup, setShowPopup] = useState(false);

  // Simuler l'arrivée de nouvelles notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const allNotifications = [
        {
          type: 'info' as const,
          category: 'inscription' as const,
          title: 'Nouvelle inscription VIP',
          message: 'Marie Lambert vient de s\'inscrire en tant que VIP',
        },
        {
          type: 'success' as const,
          category: 'finance' as const,
          title: 'Paiement confirmé',
          message: 'Virement bancaire de 350.000 FCFA reçu',
        },
        {
          type: 'warning' as const,
          category: 'networking' as const,
          title: 'Rendez-vous confirmé',
          message: 'Un rendez-vous vient d\'être confirmé',
        },
      ];

      // Filtrer les notifications finance si Admin Agence
      const randomNotifications = userProfile === 'agence' 
        ? allNotifications.filter(n => n.category !== 'finance')
        : allNotifications;

      // 20% de chance d'ajouter une notification toutes les 20 secondes
      if (Math.random() > 0.8 && randomNotifications.length > 0) {
        const random = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: random.type,
          category: random.category,
          title: random.title,
          message: random.message,
          timestamp: new Date(),
          read: false,
        };

        setNotifications(prev => [newNotification, ...prev]);
        setShowPopup(true);

        // Cacher automatiquement après 5 secondes
        setTimeout(() => setShowPopup(false), 5000);
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [userProfile]);

  const getIcon = (category: string) => {
    switch (category) {
      case 'inscription':
        return <Users className="w-4 h-4" />;
      case 'networking':
        return <Calendar className="w-4 h-4" />;
      case 'finance':
        return <Wallet className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return timestamp.toLocaleDateString('fr-FR');
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  // Filtrer les notifications finance si Admin Agence
  const visibleNotifications = userProfile === 'agence'
    ? notifications.filter(n => n.category !== 'finance')
    : notifications;

  const unreadCount = visibleNotifications.filter(n => !n.read).length;
  const latestNotification = visibleNotifications[0];

  return (
    <>
      {/* Popup de notification */}
      <AnimatePresence>
        {showPopup && latestNotification && !latestNotification.read && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -50, x: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-20 right-6 z-50 w-96"
          >
            <Card className={`${getTypeColor(latestNotification.type)} border shadow-xl`}>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getTypeIcon(latestNotification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getIcon(latestNotification.category)}
                        <p className="text-sm text-gray-900">
                          {latestNotification.title}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          setShowPopup(false);
                          markAsRead(latestNotification.id);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {latestNotification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatTimestamp(latestNotification.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge de notification sur l'icône Bell */}
      {unreadCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center"
        >
          <span className="text-xs text-white">{unreadCount}</span>
        </motion.div>
      )}
    </>
  );
}
