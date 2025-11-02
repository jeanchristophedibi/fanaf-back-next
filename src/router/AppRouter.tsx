'use client';

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '../app/dashboard/agence/Dashboard';
import AdminFanafDashboard from '../app/dashboard/admin-fanaf/Dashboard';
import AdminAsaciDashboard from '../app/dashboard/admin-asaci/Dashboard';
import OperateurCaisseMain from '../app/dashboard/operateur-caisse/Main';
import OperateurBadgeMain from '../app/dashboard/operateur-badge/Main';
import AgentInscriptionMain from '../app/dashboard/agent-inscription/Main';
import { ProfileSelection } from './ProfileSelection';
import SignInForm from '../components/auth/SignInForm';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<SignInForm />} />
        <Route path="/signin" element={<SignInForm />} />
        <Route path="/profiles" element={<ProfileSelection />} />
        <Route path="/" element={<SignInForm />} />
        <Route path="/agence/*" element={<Dashboard userProfile="agence" onLogout={() => {}} />} />
        <Route path="/admin-fanaf/*" element={<AdminFanafDashboard />} />
        <Route path="/admin-asaci/*" element={<AdminAsaciDashboard />} />
        <Route path="/operateur-caisse/*" element={<OperateurCaisseMain />} />
        <Route path="/operateur-badge/*" element={<OperateurBadgeMain />} />
        <Route path="/agent-inscription/*" element={<AgentInscriptionMain />} />
      </Routes>
    </BrowserRouter>
  );
}

