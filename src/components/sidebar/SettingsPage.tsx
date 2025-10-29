"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";

export function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSave = () => {
    // TODO: wire to API
    console.log("save settings", { notifications, darkMode });
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Paramètres du compte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm text-gray-800">Notifications email</Label>
              <p className="text-xs text-gray-500">Recevoir des mises à jour par email</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm text-gray-800">Mode sombre</Label>
              <p className="text-xs text-gray-500">Thème sombre de l'interface</p>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
          <div className="pt-2">
            <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700">Enregistrer</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
