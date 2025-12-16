import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PostROSCChecklist, PostROSCVitals } from '@/types/acls';
import { cn } from '@/lib/utils';
import { Heart, Thermometer, Activity, Droplet, Download, RotateCcw, Save, CheckCircle } from 'lucide-react';

interface PostROSCScreenProps {
  checklist: PostROSCChecklist;
  vitals: PostROSCVitals;
  onChecklistUpdate: (updates: Partial<PostROSCChecklist>) => void;
  onVitalsUpdate: (updates: Partial<PostROSCVitals>) => void;
  onExport: () => void;
  onNewCode: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

const CHECKLIST_ITEMS: { key: keyof PostROSCChecklist; label: string; section: string }[] = [
  { key: 'airwaySecured', label: 'Airway secured', section: 'Initial Stabilization' },
  { key: 'ventilationOptimized', label: 'Ventilation optimized', section: 'Initial Stabilization' },
  { key: 'hemodynamicsOptimized', label: 'Hemodynamics optimized', section: 'Initial Stabilization' },
  { key: 'twelveLeadECG', label: '12-lead ECG obtained', section: 'Diagnostics' },
  { key: 'labsOrdered', label: 'Labs ordered', section: 'Diagnostics' },
  { key: 'ctHeadOrdered', label: 'CT Head/Chest/Abd considered', section: 'Diagnostics' },
  { key: 'echoOrdered', label: 'Echocardiography ordered', section: 'Diagnostics' },
  { key: 'temperatureManagement', label: 'Temperature management initiated', section: 'Neuroprotection' },
  { key: 'neurologicalAssessment', label: 'Neurological assessment', section: 'Neuroprotection' },
  { key: 'eegOrdered', label: 'EEG ordered if comatose', section: 'Neuroprotection' },
];

function VitalInput({ 
  label, 
  value, 
  onChange, 
  unit, 
  target, 
  icon: Icon,
  isInRange 
}: { 
  label: string; 
  value: number | null; 
  onChange: (v: number | null) => void; 
  unit: string; 
  target: string;
  icon: React.ComponentType<{ className?: string }>;
  isInRange: boolean | null;
}) {
  return (
    <div className="bg-card rounded-lg p-3 border border-border">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)}
          className="h-10 text-lg font-mono"
          placeholder="—"
        />
        <span className="text-sm text-muted-foreground whitespace-nowrap">{unit}</span>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-muted-foreground">Target: {target}</span>
        {isInRange !== null && (
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded',
            isInRange ? 'bg-acls-success/20 text-acls-success' : 'bg-acls-critical/20 text-acls-critical'
          )}>
            {isInRange ? 'In Range' : 'Out of Range'}
          </span>
        )}
      </div>
    </div>
  );
}

export function PostROSCScreen({ 
  checklist, 
  vitals, 
  onChecklistUpdate, 
  onVitalsUpdate, 
  onExport, 
  onNewCode,
  onSave,
  isSaved = false 
}: PostROSCScreenProps) {
  const checkSpo2 = vitals.spo2 !== null ? vitals.spo2 >= 90 && vitals.spo2 <= 98 : null;
  const checkPaco2 = vitals.paco2 !== null ? vitals.paco2 >= 35 && vitals.paco2 <= 45 : null;
  const checkMap = vitals.map !== null ? vitals.map >= 65 : null;
  const checkTemp = vitals.temperature !== null ? vitals.temperature >= 32 && vitals.temperature <= 37.5 : null;
  const checkGlucose = vitals.glucose !== null ? vitals.glucose >= 70 && vitals.glucose <= 180 : null;

  const sections = CHECKLIST_ITEMS.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof CHECKLIST_ITEMS>);

  return (
    <div className="space-y-6 pb-6">
      {/* Vital Targets */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Vital Targets</h2>
        <div className="grid grid-cols-2 gap-3">
          <VitalInput
            label="SpO₂"
            value={vitals.spo2}
            onChange={(v) => onVitalsUpdate({ spo2: v })}
            unit="%"
            target="90-98%"
            icon={Droplet}
            isInRange={checkSpo2}
          />
          <VitalInput
            label="PaCO₂"
            value={vitals.paco2}
            onChange={(v) => onVitalsUpdate({ paco2: v })}
            unit="mmHg"
            target="35-45"
            icon={Activity}
            isInRange={checkPaco2}
          />
          <VitalInput
            label="MAP"
            value={vitals.map}
            onChange={(v) => onVitalsUpdate({ map: v })}
            unit="mmHg"
            target="≥65"
            icon={Heart}
            isInRange={checkMap}
          />
          <VitalInput
            label="Temp"
            value={vitals.temperature}
            onChange={(v) => onVitalsUpdate({ temperature: v })}
            unit="°C"
            target="32-37.5"
            icon={Thermometer}
            isInRange={checkTemp}
          />
          <div className="col-span-2">
            <VitalInput
              label="Glucose"
              value={vitals.glucose}
              onChange={(v) => onVitalsUpdate({ glucose: v })}
              unit="mg/dL"
              target="70-180"
              icon={Droplet}
              isInRange={checkGlucose}
            />
          </div>
        </div>
      </div>

      {/* Checklist by Section */}
      {Object.entries(sections).map(([section, items]) => (
        <div key={section}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">{section}</h3>
          <div className="space-y-2 bg-card rounded-lg p-3 border border-border">
            {items.map((item) => (
              <label
                key={item.key}
                className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  checked={checklist[item.key] as boolean}
                  onCheckedChange={(checked) => onChecklistUpdate({ [item.key]: checked })}
                />
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* Special Assessments */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Special Assessments</h3>
        <div className="space-y-3 bg-card rounded-lg p-3 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Following commands?</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={checklist.followingCommands === true ? 'default' : 'outline'}
                onClick={() => onChecklistUpdate({ followingCommands: true })}
              >
                Yes
              </Button>
              <Button
                size="sm"
                variant={checklist.followingCommands === false ? 'default' : 'outline'}
                onClick={() => onChecklistUpdate({ followingCommands: false })}
              >
                No
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">ST-elevation present?</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={checklist.stElevation === true ? 'destructive' : 'outline'}
                onClick={() => onChecklistUpdate({ stElevation: true })}
              >
                Yes
              </Button>
              <Button
                size="sm"
                variant={checklist.stElevation === false ? 'default' : 'outline'}
                onClick={() => onChecklistUpdate({ stElevation: false })}
              >
                No
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Cardiogenic shock?</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={checklist.cardiogenicShock === true ? 'destructive' : 'outline'}
                onClick={() => onChecklistUpdate({ cardiogenicShock: true })}
              >
                Yes
              </Button>
              <Button
                size="sm"
                variant={checklist.cardiogenicShock === false ? 'default' : 'outline'}
                onClick={() => onChecklistUpdate({ cardiogenicShock: false })}
              >
                No
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        {onSave && (
          <Button
            onClick={onSave}
            disabled={isSaved}
            className={cn(
              'w-full h-14 text-lg font-semibold gap-2',
              isSaved 
                ? 'bg-acls-success hover:bg-acls-success text-white' 
                : 'bg-primary hover:bg-primary/90'
            )}
          >
            {isSaved ? (
              <>
                <CheckCircle className="h-5 w-5" />
                Saved Locally
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Session Locally
              </>
            )}
          </Button>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onExport}
            variant="outline"
            className="h-12 gap-2"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button
            onClick={onNewCode}
            variant="outline"
            className="h-12 gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            New Code
          </Button>
        </div>
      </div>
    </div>
  );
}
