import React, { useState, useEffect } from 'react';
import { Bell, X, AlertCircle, Users, Plane, Info, CheckCircle, Wallet } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  getCurrentNotifications,
  subscribeToNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification,
  type TypeNotification,
  type PrioriteNotification 
} from './data/types';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationCenterProps {
  onNavigate?: (lien?: string) => void;
}

export function NotificationCenter({ onNavigate }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(getCurrentNotifications());
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);
  const nonLues = notifications.filter(n => !n.lu);
  
  // S'abonner aux nouvelles notifications
  useEffect(() => {
    const unsubscribe = subscribeToNotifications((newNotification) => {
      setNotifications(getCurrentNotifications());
      setLatestNotification(newNotification);
      
      // Afficher une popup pour la nouvelle notification
      setTimeout(() => setLatestNotification(null), 5000);
    });
    
    return unsubscribe;
  }, []);

  const getIconByType = (type: TypeNotification) => {
    switch (type) {
      case 'inscription':
        return <Users className="w-4 h-4" />;
      case 'rendez-vous':
        return <CheckCircle className="w-4 h-4" />;
      case 'vol':
        return <Plane className="w-4 h-4" />;
      case 'alerte':
        return <Wallet className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getColorByPriorite = (priorite: PrioriteNotification) => {
    switch (priorite) {
      case 'haute':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'moyenne':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'basse':
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const marquerCommeLu = (id: string) => {
    markNotificationAsRead(id);
    setNotifications(getCurrentNotifications());
  };

  const marquerToutCommeLu = () => {
    markAllNotificationsAsRead();
    setNotifications(getCurrentNotifications());
  };

  const handleNotificationClick = (notification: Notification) => {
    marquerCommeLu(notification.id);
    if (notification.lien && onNavigate) {
      onNavigate(notification.lien);
      setIsOpen(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'Il y a quelques minutes';
    if (hours < 24) return `Il y a ${hours}h`;
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <>
      {/* Popup de notification en bas à droite pour nouvelle notification */}
      <AnimatePresence>
        {latestNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 50, x: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 z-[100] w-96"
          >
            <div className={`bg-white rounded-lg shadow-2xl border-l-4 ${
              latestNotification.priorite === 'haute' ? 'border-red-500' :
              latestNotification.priorite === 'moyenne' ? 'border-orange-500' : 'border-blue-500'
            }`}>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${getColorByPriorite(latestNotification.priorite)}`}>
                    {getIconByType(latestNotification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm text-gray-900">
                        {latestNotification.titre}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 flex-shrink-0"
                        onClick={() => setLatestNotification(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {latestNotification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400">À l'instant</span>
                      {latestNotification.priorite === 'haute' && (
                        <Badge variant="outline" className="text-xs border-red-300 text-red-700">
                          Urgent
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    
      <div className="relative">
        {/* Bouton de notification */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Bell className="w-5 h-5 text-gray-600" />
          {nonLues.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center"
            >
              {nonLues.length > 9 ? '9+' : nonLues.length}
            </motion.span>
          )}
        </Button>

      {/* Panel de notifications */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-600" />
                  <h3 className="text-gray-900">Notifications</h3>
                  {nonLues.length > 0 && (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                      {nonLues.length} nouvelle{nonLues.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Actions */}
              {nonLues.length > 0 && (
                <div className="px-4 py-2 border-b bg-gray-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={marquerToutCommeLu}
                    className="text-sm text-orange-600 hover:text-orange-700"
                  >
                    Tout marquer comme lu
                  </Button>
                </div>
              )}

              {/* Liste des notifications */}
              <ScrollArea className="h-[500px]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Bell className="w-12 h-12 mb-2" />
                    <p>Aucune notification</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.lu ? 'bg-orange-50/30' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-3">
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${getColorByPriorite(
                              notification.priorite
                            )}`}
                          >
                            {getIconByType(notification.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4
                                className={`text-sm ${
                                  !notification.lu ? 'text-gray-900' : 'text-gray-700'
                                }`}
                              >
                                {notification.titre}
                              </h4>
                              {!notification.lu && (
                                <span className="flex-shrink-0 w-2 h-2 bg-orange-600 rounded-full mt-1" />
                              )}
                            </div>

                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>

                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-400">
                                {formatDate(notification.dateCreation)}
                              </span>
                              {notification.priorite === 'haute' && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-red-300 text-red-700"
                                >
                                  Urgent
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t bg-gray-50 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm text-orange-600 hover:text-orange-700"
                  >
                    Voir toutes les notifications
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
