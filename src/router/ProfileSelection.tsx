import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Building2, Users, Wallet, IdCard, UserPlus, ShieldCheck, type LucideIcon } from 'lucide-react';

interface ProfileCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  path: string;
}

function ProfileCard({ icon: Icon, title, description, color, path }: ProfileCardProps) {
  const navigate = useNavigate();
  
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'orange':
        return {
          card: 'hover:border-orange-500',
          circle: 'bg-orange-100 group-hover:bg-orange-200',
          icon: 'text-orange-600',
          button: 'bg-orange-600 hover:bg-orange-700'
        };
      case 'amber':
        return {
          card: 'hover:border-amber-500',
          circle: 'bg-amber-100 group-hover:bg-amber-200',
          icon: 'text-amber-600',
          button: 'bg-amber-600 hover:bg-amber-700'
        };
      case 'blue':
        return {
          card: 'hover:border-blue-500',
          circle: 'bg-blue-100 group-hover:bg-blue-200',
          icon: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
      case 'indigo':
        return {
          card: 'hover:border-indigo-500',
          circle: 'bg-indigo-100 group-hover:bg-indigo-200',
          icon: 'text-indigo-600',
          button: 'bg-indigo-600 hover:bg-indigo-700'
        };
      case 'purple':
        return {
          card: 'hover:border-purple-500',
          circle: 'bg-purple-100 group-hover:bg-purple-200',
          icon: 'text-purple-600',
          button: 'bg-purple-600 hover:bg-purple-700'
        };
      case 'teal':
        return {
          card: 'hover:border-teal-500',
          circle: 'bg-teal-100 group-hover:bg-teal-200',
          icon: 'text-teal-600',
          button: 'bg-teal-600 hover:bg-teal-700'
        };
      default:
        return {
          card: 'hover:border-gray-500',
          circle: 'bg-gray-100 group-hover:bg-gray-200',
          icon: 'text-gray-600',
          button: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  const classes = getColorClasses(color);

  return (
    <Card className={`group cursor-pointer transition-all ${classes.card}`}>
      <div className="p-6 space-y-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${classes.circle}`}>
          <Icon className={`w-8 h-8 ${classes.icon}`} />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <Button 
          className={`w-full ${classes.button} text-white`}
          onClick={() => navigate(path)}
        >
          Accéder
        </Button>
      </div>
    </Card>
  );
}

export function ProfileSelection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="max-w-5xl w-full p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-600 to-orange-500 rounded-full mb-4">
            <span className="text-white text-3xl">F</span>
          </div>
          <h1 className="text-3xl text-gray-900 mb-2">FANAF 2026</h1>
          <p className="text-gray-600">Back-office de gestion de l'événement</p>
        </div>

        <div className="space-y-4">
          <p className="text-center text-gray-700 mb-6">
            Sélectionnez votre profil pour continuer
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ProfileCard
              icon={Building2}
              title="Agence de Communication"
              description="Gestion complète de l'événement"
              color="orange"
              path="/agence"
            />
            <ProfileCard
              icon={UserPlus}
              title="Agent d'inscription"
              description="Créer et gérer les inscriptions"
              color="amber"
              path="/agent-inscription"
            />
            <ProfileCard
              icon={Users}
              title="Admin FANAF"
              description="Accès aux données et statistiques"
              color="blue"
              path="/admin-fanaf"
            />
            <ProfileCard
              icon={ShieldCheck}
              title="Administrateur ASACI"
              description="Gestion des inscriptions et paiements"
              color="indigo"
              path="/admin-asaci"
            />
            <ProfileCard
              icon={Wallet}
              title="Opérateur Caisse"
              description="Gestion des paiements uniquement"
              color="purple"
              path="/operateur-caisse"
            />
            <ProfileCard
              icon={IdCard}
              title="Opérateur Badge"
              description="Génération des badges et documents"
              color="teal"
              path="/operateur-badge"
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            Événement du 9 au 11 février 2026
          </p>
        </div>
      </Card>
    </div>
  );
}
