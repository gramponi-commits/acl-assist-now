import { useTranslation } from 'react-i18next';
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

export function HsAndTsChecklist({ hsAndTs, onUpdate }: HsAndTsChecklistProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const checkedCount = Object.values(hsAndTs).filter(Boolean).length;

  const HS_ITEMS: { key: keyof HsAndTs; labelKey: string; descKey: string }[] = [
    { key: 'hypovolemia', labelKey: 'hsTs.hypovolemia', descKey: 'hsTs.hypovolemiaDesc' },
    { key: 'hypoxia', labelKey: 'hsTs.hypoxia', descKey: 'hsTs.hypoxiaDesc' },
    { key: 'hydrogenIon', labelKey: 'hsTs.hydrogenIon', descKey: 'hsTs.hydrogenIonDesc' },
    { key: 'hypoHyperkalemia', labelKey: 'hsTs.hypoHyperkalemia', descKey: 'hsTs.hypoHyperkalemiaDesc' },
    { key: 'hypothermia', labelKey: 'hsTs.hypothermia', descKey: 'hsTs.hypothermiaDesc' },
  ];

  const TS_ITEMS: { key: keyof HsAndTs; labelKey: string; descKey: string }[] = [
    { key: 'tensionPneumothorax', labelKey: 'hsTs.tensionPneumo', descKey: 'hsTs.tensionPneumoDesc' },
    { key: 'tamponade', labelKey: 'hsTs.tamponade', descKey: 'hsTs.tamponadeDesc' },
    { key: 'toxins', labelKey: 'hsTs.toxins', descKey: 'hsTs.toxinsDesc' },
    { key: 'thrombosisPulmonary', labelKey: 'hsTs.thrombosisPulm', descKey: 'hsTs.thrombosisPulmDesc' },
    { key: 'thrombosisCoronary', labelKey: 'hsTs.thrombosisCoro', descKey: 'hsTs.thrombosisCoroDesc' },
  ];

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
              <div className="font-semibold text-foreground">{t('hsTs.title')}</div>
              <div className="text-sm text-muted-foreground">
                {checkedCount > 0 ? t('hsTs.itemsChecked', { count: checkedCount }) : t('hsTs.tapToReview')}
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
            <h3 className="text-sm font-bold text-acls-shockable mb-3">{t('hsTs.hs')}</h3>
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
                    <div className="font-medium text-foreground">{t(item.labelKey)}</div>
                    <div className="text-xs text-muted-foreground">{t(item.descKey)}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* T's */}
          <div>
            <h3 className="text-sm font-bold text-acls-non-shockable mb-3">{t('hsTs.ts')}</h3>
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
                    <div className="font-medium text-foreground">{t(item.labelKey)}</div>
                    <div className="text-xs text-muted-foreground">{t(item.descKey)}</div>
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
