'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../ui/dialog';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { CheckCircle2, CreditCard, DollarSign } from 'lucide-react';
import type { ModePaiement, Participant } from '../../data/types';

interface FinalizePaiementDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  participant: Participant | null;
  getMontant: (p: Participant) => string;
  modesDisponibles: ModePaiement[];
  selectedMode: ModePaiement;
  setSelectedMode: (v: ModePaiement) => void;
  onConfirm: () => void;
}

export function FinalizePaiementDialog({
  open,
  onOpenChange,
  participant,
  getMontant,
  modesDisponibles,
  selectedMode,
  setSelectedMode,
  onConfirm,
}: FinalizePaiementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Finaliser le paiement</DialogTitle>
          <DialogDescription>
            {participant && (
              <>
                Participant : {participant.prenom} {participant.nom}
                <br />
                Montant : {getMontant(participant)}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label className="text-sm mb-3 block">Sélectionnez le mode de paiement :</Label>
          <RadioGroup value={selectedMode} onValueChange={(value) => setSelectedMode(value as ModePaiement)}>
            <div className="space-y-3">
              {modesDisponibles.map((mode) => (
                <div key={mode} className="flex items-center space-x-2">
                  <RadioGroupItem value={mode} id={mode} />
                  <Label htmlFor={mode} className="cursor-pointer flex items-center gap-2">
                    {mode === 'espèce' && <DollarSign className="w-4 h-4 text-green-600" />}
                    {mode === 'carte bancaire' && <CreditCard className="w-4 h-4 text-blue-600" />}
                    {mode === 'orange money' && <span className="w-4 h-4 rounded-full bg-orange-500" />}
                    {mode === 'wave' && <span className="w-4 h-4 rounded-full bg-blue-500" />}
                    <span className="capitalize">{mode}</span>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={onConfirm} className="bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Valider le paiement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


