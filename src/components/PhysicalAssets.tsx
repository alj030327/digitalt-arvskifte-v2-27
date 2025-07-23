import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Home, Car, Diamond, Plus, Trash2, Package } from "lucide-react";

export interface PhysicalAsset {
  id: string;
  name: string;
  description: string;
  estimatedValue: number;
  category: string;
  distributionMethod: 'sell' | 'divide' | 'assign';
  assignedTo?: string; // beneficiary id if assigned to specific person
}

interface PhysicalAssetsProps {
  physicalAssets: PhysicalAsset[];
  setPhysicalAssets: (assets: PhysicalAsset[]) => void;
  beneficiaries: Array<{ id: string; name: string }>;
}

export const PhysicalAssets = ({ physicalAssets, setPhysicalAssets, beneficiaries }: PhysicalAssetsProps) => {
  const [newAsset, setNewAsset] = useState({
    name: "",
    description: "",
    estimatedValue: "",
    category: "",
    distributionMethod: "sell" as 'sell' | 'divide' | 'assign',
    assignedTo: ""
  });

  const assetCategories = [
    "Fastighet", "Fordon", "Smycken", "Konst", "Möbler", "Elektronik", "Verktyg", "Samlingar", "Övrigt"
  ];

  const handleAddAsset = () => {
    if (!newAsset.name || !newAsset.category || !newAsset.estimatedValue) {
      return;
    }

    const asset: PhysicalAsset = {
      id: Date.now().toString(),
      name: newAsset.name,
      description: newAsset.description,
      estimatedValue: parseFloat(newAsset.estimatedValue),
      category: newAsset.category,
      distributionMethod: newAsset.distributionMethod,
      assignedTo: newAsset.distributionMethod === 'assign' ? newAsset.assignedTo : undefined
    };

    setPhysicalAssets([...physicalAssets, asset]);
    setNewAsset({
      name: "",
      description: "",
      estimatedValue: "",
      category: "",
      distributionMethod: "sell" as 'sell' | 'divide' | 'assign',
      assignedTo: ""
    });
  };

  const handleRemoveAsset = (id: string) => {
    setPhysicalAssets(physicalAssets.filter(asset => asset.id !== id));
  };

  const updateDistributionMethod = (id: string, method: 'sell' | 'divide' | 'assign', assignedTo?: string) => {
    setPhysicalAssets(physicalAssets.map(asset => 
      asset.id === id 
        ? { ...asset, distributionMethod: method, assignedTo: method === 'assign' ? assignedTo : undefined }
        : asset
    ));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Fastighet': return <Home className="w-4 h-4" />;
      case 'Fordon': return <Car className="w-4 h-4" />;
      case 'Smycken': return <Diamond className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getDistributionLabel = (method: string) => {
    switch (method) {
      case 'sell': return 'Sälj och dela';
      case 'divide': return 'Dela fysiskt';
      case 'assign': return 'Tilldela specifik person';
      default: return method;
    }
  };

  const totalPhysicalValue = physicalAssets.reduce((sum, asset) => sum + asset.estimatedValue, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Fysiska tillgångar
        </CardTitle>
        <CardDescription>
          Registrera fysiska tillgångar som fastigheter, fordon, smycken och andra värdefulla föremål
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium">Lägg till fysisk tillgång</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assetName">Namn på tillgång</Label>
              <Input
                id="assetName"
                value={newAsset.name}
                onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                placeholder="T.ex. Villa Roslagsgatan 5"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <select
                className="w-full p-2 border border-border rounded-md bg-background"
                value={newAsset.category}
                onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
              >
                <option value="">Välj kategori</option>
                {assetCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estimatedValue">Uppskattat värde (SEK)</Label>
              <Input
                id="estimatedValue"
                type="number"
                value={newAsset.estimatedValue}
                onChange={(e) => setNewAsset({ ...newAsset, estimatedValue: e.target.value })}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="distributionMethod">Fördelningsmetod</Label>
              <select
                className="w-full p-2 border border-border rounded-md bg-background"
                value={newAsset.distributionMethod}
                onChange={(e) => setNewAsset({ ...newAsset, distributionMethod: e.target.value as any })}
              >
                <option value="sell">Sälj och dela värdet</option>
                <option value="divide">Dela fysiskt mellan arvingar</option>
                <option value="assign">Tilldela specifik person</option>
              </select>
            </div>
            
            {newAsset.distributionMethod === 'assign' && (
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Tilldela till</Label>
                <select
                  className="w-full p-2 border border-border rounded-md bg-background"
                  value={newAsset.assignedTo}
                  onChange={(e) => setNewAsset({ ...newAsset, assignedTo: e.target.value })}
                >
                  <option value="">Välj dödsbodelägare</option>
                  {beneficiaries.map((beneficiary) => (
                    <option key={beneficiary.id} value={beneficiary.id}>{beneficiary.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Beskrivning (valfritt)</Label>
              <Textarea
                id="description"
                value={newAsset.description}
                onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                placeholder="Ytterligare detaljer om tillgången..."
                rows={2}
              />
            </div>
          </div>
          
          <Button onClick={handleAddAsset} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Lägg till fysisk tillgång
          </Button>
        </div>

        {physicalAssets.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Registrerade fysiska tillgångar</h4>
            
            <div className="space-y-3">
              {physicalAssets.map((asset) => (
                <div key={asset.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(asset.category)}
                        <span className="font-medium">{asset.name}</span>
                        <Badge variant="secondary">{asset.category}</Badge>
                        <Badge variant="outline">{getDistributionLabel(asset.distributionMethod)}</Badge>
                      </div>
                      {asset.description && (
                        <p className="text-sm text-muted-foreground mb-2">{asset.description}</p>
                      )}
                      {asset.distributionMethod === 'assign' && asset.assignedTo && (
                        <p className="text-sm text-primary">
                          Tilldelas: {beneficiaries.find(b => b.id === asset.assignedTo)?.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold">
                          {asset.estimatedValue.toLocaleString('sv-SE')} SEK
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Uppskattat värde
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAsset(asset.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Fördelningsmetod:</Label>
                      <select
                        className="text-xs border border-border rounded px-2 py-1 bg-background"
                        value={asset.distributionMethod}
                        onChange={(e) => updateDistributionMethod(asset.id, e.target.value as any)}
                      >
                        <option value="sell">Sälj och dela</option>
                        <option value="divide">Dela fysiskt</option>
                        <option value="assign">Tilldela person</option>
                      </select>
                      {asset.distributionMethod === 'assign' && (
                        <select
                          className="text-xs border border-border rounded px-2 py-1 bg-background"
                          value={asset.assignedTo || ""}
                          onChange={(e) => updateDistributionMethod(asset.id, 'assign', e.target.value)}
                        >
                          <option value="">Välj person</option>
                          {beneficiaries.map((beneficiary) => (
                            <option key={beneficiary.id} value={beneficiary.id}>{beneficiary.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="font-medium">Totalt värde fysiska tillgångar:</span>
              <span className="font-bold text-primary">
                {totalPhysicalValue.toLocaleString('sv-SE')} SEK
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};