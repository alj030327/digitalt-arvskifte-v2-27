import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, Target, ArrowRight, X } from "lucide-react";

interface Asset {
  id: string;
  bank: string;
  accountType: string;
  assetType: string;
  accountNumber: string;
  amount: number;
}

interface Beneficiary {
  id: string;
  name: string;
}

interface AssetAllocation {
  assetId: string;
  beneficiaryId: string;
  beneficiaryName: string;
  amount?: number; // Optional: specific amount, otherwise full asset
}

interface SpecificAssetAllocationProps {
  assets: Asset[];
  beneficiaries: Beneficiary[];
  allocations: AssetAllocation[];
  setAllocations: (allocations: AssetAllocation[]) => void;
}

export const SpecificAssetAllocation = ({
  assets,
  beneficiaries,
  allocations,
  setAllocations,
}: SpecificAssetAllocationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const addAllocation = (assetId: string, beneficiaryId: string) => {
    const asset = assets.find(a => a.id === assetId);
    const beneficiary = beneficiaries.find(b => b.id === beneficiaryId);
    
    if (!asset || !beneficiary) return;

    // Remove existing allocation for this asset
    const filteredAllocations = allocations.filter(a => a.assetId !== assetId);
    
    const newAllocation: AssetAllocation = {
      assetId,
      beneficiaryId,
      beneficiaryName: beneficiary.name,
    };

    setAllocations([...filteredAllocations, newAllocation]);
  };

  const removeAllocation = (assetId: string) => {
    setAllocations(allocations.filter(a => a.assetId !== assetId));
  };

  const getAssetById = (assetId: string) => {
    return assets.find(a => a.id === assetId);
  };

  const getAllocatedAssetIds = () => {
    return allocations.map(a => a.assetId);
  };

  const getUnallocatedAssets = () => {
    return assets.filter(asset => !getAllocatedAssetIds().includes(asset.id));
  };

  if (beneficiaries.length === 0 || assets.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-muted-foreground" />
                <CardTitle className="text-lg">Specifik tillgångsfördelning</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  Valfritt
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {allocations.length > 0 && (
                  <Badge variant="outline">
                    {allocations.length} tilldelning{allocations.length !== 1 ? 'ar' : ''}
                  </Badge>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tilldela specifika konton eller tillgångar direkt till enskilda dödsbodelägare. 
              Detta är kompletterande till den procentuella fördelningen ovan.
            </p>

            {/* Current allocations */}
            {allocations.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Aktuella tilldelningar</h4>
                {allocations.map((allocation) => {
                  const asset = getAssetById(allocation.assetId);
                  if (!asset) return null;

                  return (
                    <div key={allocation.assetId} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-sm">
                          <div className="font-medium">
                            {asset.bank} - {asset.accountType}
                          </div>
                          <div className="text-muted-foreground">
                            {asset.accountNumber} • {asset.amount.toLocaleString('sv-SE')} SEK
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <Badge variant="outline">
                          {allocation.beneficiaryName}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAllocation(allocation.assetId)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add new allocation */}
            {getUnallocatedAssets().length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Lägg till tilldelning</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getUnallocatedAssets().map((asset) => (
                    <div key={asset.id} className="p-3 border border-border rounded-lg">
                      <div className="space-y-2">
                        <div className="text-sm">
                          <div className="font-medium">
                            {asset.bank} - {asset.accountType}
                          </div>
                          <div className="text-muted-foreground">
                            {asset.accountNumber}
                          </div>
                          <div className="text-sm font-medium">
                            {asset.amount.toLocaleString('sv-SE')} SEK
                          </div>
                        </div>
                        <Select onValueChange={(beneficiaryId) => addAllocation(asset.id, beneficiaryId)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Tilldela till..." />
                          </SelectTrigger>
                          <SelectContent>
                            {beneficiaries.map((beneficiary) => (
                              <SelectItem key={beneficiary.id} value={beneficiary.id}>
                                {beneficiary.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {getUnallocatedAssets().length === 0 && allocations.length > 0 && (
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Alla tillgångar har tilldelats specifika dödsbodelägare
                </p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};