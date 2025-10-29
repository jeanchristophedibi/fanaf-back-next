"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

export function ProfilePage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const handleSave = () => {
    // TODO: wire to API
    console.log("save profile", { firstName, lastName, email });
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Mon profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-600">Prénom</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Votre prénom" />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Nom</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Votre nom" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-600">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@domain.com" />
          </div>
          <div className="pt-2">
            <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700">Enregistrer</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
