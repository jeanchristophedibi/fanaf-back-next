"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Eye } from "lucide-react";
import type { Organisation } from '../data/types';

interface SponsorDetailsDialogProps {
  sponsor: Organisation;
}

export function SponsorDetailsDialog({ sponsor }: SponsorDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{sponsor.nom}</DialogTitle>
          <DialogDescription>
            Informations détaillées sur le sponsor
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900">{sponsor.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type de sponsor</p>
              <Badge className={`bg-amber-100 text-amber-800 mt-1`}>
                {sponsor.secteurActivite || 'N/A'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date de création</p>
              <p className="text-gray-900">{sponsor.dateCreation ? new Date(sponsor.dateCreation).toLocaleDateString('fr-FR') : '-'}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

