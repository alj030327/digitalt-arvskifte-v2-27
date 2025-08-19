import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2 } from "lucide-react";

export interface EstateOwner {
  id: string;
  firstName: string;
  lastName: string;
  personalNumber: string;
  relationshipToDeceased: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface Step1Props {
  deceasedFirstName: string;
  setDeceasedFirstName: (value: string) => void;
  deceasedLastName: string;
  setDeceasedLastName: (value: string) => void;
  deceasedPersonalNumber: string;
  setDeceasedPersonalNumber: (value: string) => void;
  estateOwners: EstateOwner[];
  setEstateOwners: (owners: EstateOwner[]) => void;
  onNext: () => void;
  t: (key: string) => string;
}

export const Step1EstateOwners = ({ 
  deceasedFirstName,
  setDeceasedFirstName,
  deceasedLastName,
  setDeceasedLastName,
  deceasedPersonalNumber, 
  setDeceasedPersonalNumber, 
  estateOwners, 
  setEstateOwners, 
  onNext, 
  t 
}: Step1Props) => {
  const [newOwner, setNewOwner] = useState({
    firstName: "",
    lastName: "",
    personalNumber: "",
    relationshipToDeceased: "",
    address: "",
    phone: "",
    email: ""
  });

  const relationships = [
    "Make/Maka", "Barn", "Barnbarn", "Förälder", "Syskon", "Annan släkting", "Övrig"
  ];

  const formatPersonalNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 8) {
      return cleaned;
    }
    return cleaned.slice(0, 8) + "-" + cleaned.slice(8, 12);
  };

  const handleDeceasedNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPersonalNumber(e.target.value);
    setDeceasedPersonalNumber(formatted);
  };

  const handleOwnerNumberChange = (value: string) => {
    const formatted = formatPersonalNumber(value);
    setNewOwner({ ...newOwner, personalNumber: formatted });
  };

  const handleAddOwner = () => {
    if (!newOwner.firstName || !newOwner.lastName || !newOwner.personalNumber || !newOwner.relationshipToDeceased) {
      return;
    }

    const owner: EstateOwner = {
      id: Date.now().toString(),
      firstName: newOwner.firstName,
      lastName: newOwner.lastName,
      personalNumber: newOwner.personalNumber,
      relationshipToDeceased: newOwner.relationshipToDeceased,
      address: newOwner.address || undefined,
      phone: newOwner.phone || undefined,
      email: newOwner.email || undefined
    };

    setEstateOwners([...estateOwners, owner]);
    
    // Reset form
    setNewOwner({
      firstName: "",
      lastName: "",
      personalNumber: "",
      relationshipToDeceased: "",
      address: "",
      phone: "",
      email: ""
    });
  };

  const handleRemoveOwner = (id: string) => {
    setEstateOwners(estateOwners.filter(owner => owner.id !== id));
  };

  const canProceed = deceasedFirstName && deceasedLastName && deceasedPersonalNumber && estateOwners.length > 0;

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Dödsbodelägare</CardTitle>
           <CardDescription>
             Ange fullständigt namn och personnummer för den avlidne och lägg till alla dödsbodelägare
           </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Deceased person information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Den avlidne</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deceasedFirstName">Förnamn *</Label>
                <Input
                  id="deceasedFirstName"
                  value={deceasedFirstName}
                  onChange={(e) => setDeceasedFirstName(e.target.value)}
                  placeholder="Förnamn"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deceasedLastName">Efternamn *</Label>
                <Input
                  id="deceasedLastName"
                  value={deceasedLastName}
                  onChange={(e) => setDeceasedLastName(e.target.value)}
                  placeholder="Efternamn"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="deceased">Personnummer *</Label>
                <Input
                  id="deceased"
                  value={deceasedPersonalNumber}
                  onChange={handleDeceasedNumberChange}
                  placeholder="ÅÅÅÅMMDD-XXXX"
                  maxLength={13}
                />
              </div>
            </div>
          </div>

          {/* Add estate owner form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Lägg till dödsbodelägare</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Förnamn *</Label>
                <Input
                  id="firstName"
                  value={newOwner.firstName}
                  onChange={(e) => setNewOwner({ ...newOwner, firstName: e.target.value })}
                  placeholder="Förnamn"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Efternamn *</Label>
                <Input
                  id="lastName"
                  value={newOwner.lastName}
                  onChange={(e) => setNewOwner({ ...newOwner, lastName: e.target.value })}
                  placeholder="Efternamn"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="personalNumber">Personnummer *</Label>
                <Input
                  id="personalNumber"
                  value={newOwner.personalNumber}
                  onChange={(e) => handleOwnerNumberChange(e.target.value)}
                  placeholder="ÅÅÅÅMMDD-XXXX"
                  maxLength={13}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="relationship">Relation till avlidne *</Label>
                <select
                  className="w-full p-2 border border-border rounded-md bg-background"
                  value={newOwner.relationshipToDeceased}
                  onChange={(e) => setNewOwner({ ...newOwner, relationshipToDeceased: e.target.value })}
                >
                  <option value="">Välj relation</option>
                  {relationships.map((rel) => (
                    <option key={rel} value={rel}>{rel}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Adress (valfritt)</Label>
                <Input
                  id="address"
                  value={newOwner.address}
                  onChange={(e) => setNewOwner({ ...newOwner, address: e.target.value })}
                  placeholder="Gatuadress, postnummer, ort"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefonnummer (valfritt)</Label>
                <Input
                  id="phone"
                  value={newOwner.phone}
                  onChange={(e) => setNewOwner({ ...newOwner, phone: e.target.value })}
                  placeholder="070-123 45 67"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">E-post (valfritt)</Label>
                <Input
                  id="email"
                  type="email"
                  value={newOwner.email}
                  onChange={(e) => setNewOwner({ ...newOwner, email: e.target.value })}
                  placeholder="namn@exempel.se"
                />
              </div>
            </div>
            
            <Button onClick={handleAddOwner} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Lägg till dödsbodelägare
            </Button>
          </div>

          {/* List of estate owners */}
          {estateOwners.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Registrerade dödsbodelägare</h3>
              
              <div className="space-y-3">
                {estateOwners.map((owner) => (
                  <div key={owner.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{owner.firstName} {owner.lastName}</span>
                          <Badge variant="secondary">{owner.relationshipToDeceased}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Personnummer: {owner.personalNumber}
                        </p>
                        {owner.address && (
                          <p className="text-sm text-muted-foreground mb-1">
                            Adress: {owner.address}
                          </p>
                        )}
                        {owner.phone && (
                          <p className="text-sm text-muted-foreground mb-1">
                            Telefon: {owner.phone}
                          </p>
                        )}
                        {owner.email && (
                          <p className="text-sm text-muted-foreground">
                            E-post: {owner.email}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOwner(owner.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button 
              onClick={onNext}
              disabled={!canProceed}
              size="lg"
            >
              Fortsätt till tillgångar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};