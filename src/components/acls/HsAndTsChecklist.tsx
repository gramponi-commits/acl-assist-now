import { Checkbox } from '@/components/ui/checkbox';
import { HsAndTs } from '@/types/acls';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface HsAndTsChecklistProps {
  hsAndTs: HsAndTs;
  onUpdate: (updates: Partial<HsAndTs>) => void;
}

const HS_ITEMS: { key: keyof HsAndTs; label: string; description: string }[] = [
  { key: 'hypovolemia', label: 'Hypovolemia', description: 'Volume resuscitation, blood products' },
  { key: 'hypoxia', label: 'Hypoxia', description: 'Oxygenation, secure airway' },
  { key: 'hydrogenIon', label: 'Hydrogen Ion (Acidosis)', description: 'Consider bicarb, ventilation' },
  { key: 'hypoHyperkalemia', label: 'Hypo/Hyperkalemia', description: 'Check K+, calcium, D50/insulin' },
  { key: 'hypothermia', label: 'Hypothermia', description: 'Warm fluids, rewarming' },
];

const TS_ITEMS: { key: keyof HsAndTs; label: string; description: string }[] = [
  { key: 'tensionPneumothorax', label: 'Tension Pneumothorax', description: 'Needle decompression, chest tube' },
  { key: 'tamponade', label: 'Tamponade (Cardiac)', description: 'Pericardiocentesis, echo' },
  { key: 'toxins', label: 'Toxins', description: 'Antidotes, decontamination' },
  { key: 'thrombosisPulmonary', label: 'Thrombosis (Pulmonary)', description: 'Thrombolytics, ECMO consideration' },
  { key: 'thrombosisCoronary', label: 'Thrombosis (Coronary)', description: 'PCI, thrombolytics' },
];

export function HsAndTsChecklist({ hsAndTs, onUpdate }: HsAndTsChecklistProps) {
  const [isOpen, setIsOpen] = useState(false);
  const checkedCount = Object.values(hsAndTs).filter(Boolean).length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className={cn(
          'flex items-center justify-between p-4 rounded-lg border-2 transition-all',
          'bg-acls-warning/10 border-acls-warning hover:bg-acls-warning/20'
        )}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-acls-warning" />
            <div className="text-left">
              <div className="font-semibold text-foreground">H's & T's - Reversible Causes</div>
              <div className="text-sm text-muted-foreground">
                {checkedCount > 0 ? `${checkedCount} item(s) checked` : 'Tap to review'}
              </div>
            </div>
          </div>
          <ChevronDown className={cn(
            'h-5 w-5 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )} />
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="mt-3 space-y-4 p-4 bg-card rounded-lg border border-border">
          {/* H's */}
          <div>
            <h3 className="text-sm font-bold text-acls-shockable mb-3">H's</h3>
            <div className="space-y-3">
              {HS_ITEMS.map((item) => (
                <label
                  key={item.key}
                  className="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={hsAndTs[item.key]}
                    onCheckedChange={(checked) => onUpdate({ [item.key]: checked })}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* T's */}
          <div>
            <h3 className="text-sm font-bold text-acls-non-shockable mb-3">T's</h3>
            <div className="space-y-3">
              {TS_ITEMS.map((item) => (
                <label
                  key={item.key}
                  className="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={hsAndTs[item.key]}
                    onCheckedChange={(checked) => onUpdate({ [item.key]: checked })}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
