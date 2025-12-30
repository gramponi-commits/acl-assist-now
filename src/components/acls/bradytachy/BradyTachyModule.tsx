import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBradyTachyLogic } from '@/hooks/useBradyTachyLogic';
import { BradyTachyPatientSelector } from './BradyTachyPatientSelector';
import { BradycardiaScreen } from './BradycardiaScreen';
import { TachycardiaScreen } from './TachycardiaScreen';

interface BradyTachyModuleProps {
  onSwitchToArrest: (patientGroup: 'adult' | 'pediatric') => void;
  onExit: () => void;
}

export function BradyTachyModule({ onSwitchToArrest, onExit }: BradyTachyModuleProps) {
  const { t } = useTranslation();
  const { session, actions } = useBradyTachyLogic();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleSwitchToArrest = () => {
    const shouldSwitch = actions.switchToArrest();
    if (shouldSwitch) {
      // Pass patient group to parent
      onSwitchToArrest(session.decisionContext.patientGroup);
    }
  };

  const handleExit = () => {
    if (session.interventions.length > 0 && !session.endTime) {
      setShowExitConfirm(true);
    } else {
      onExit();
    }
  };

  const confirmExit = () => {
    actions.endSession('transferred');
    onExit();
  };

  // Render appropriate screen based on phase
  const renderContent = () => {
    switch (session.phase) {
      case 'patient_selection':
      case 'branch_selection':
        return (
          <BradyTachyPatientSelector
            session={session}
            actions={actions}
          />
        );

      case 'bradycardia_assessment':
      case 'bradycardia_treatment':
        return (
          <BradycardiaScreen
            session={session}
            actions={actions}
          />
        );

      case 'tachycardia_assessment':
      case 'tachycardia_sinus_vs_svt':
      case 'tachycardia_treatment':
        return (
          <TachycardiaScreen
            session={session}
            actions={actions}
          />
        );

      case 'session_ended':
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <h2 className="text-2xl font-bold">{t('bradyTachy.sessionEnded')}</h2>
            <div className="space-y-2">
              <Button onClick={actions.resetSession} size="lg">
                {t('actions.reset')}
              </Button>
              <Button onClick={onExit} variant="outline" size="lg">
                Exit
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Red "NO PULSE / START CPR" Button - Always at top */}
      {session.phase !== 'session_ended' && (
        <div className="p-4 border-b border-border bg-background sticky top-0 z-10">
          <Button
            onClick={handleSwitchToArrest}
            className={cn(
              'w-full h-16 text-xl font-bold',
              'bg-red-600 hover:bg-red-700 text-white',
              'shadow-lg transition-all',
              'flex items-center justify-center gap-3'
            )}
          >
            <AlertTriangle className="h-6 w-6" />
            {t('bradyTachy.noPulseButton')}
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold">Exit Session?</h3>
            <p className="text-sm text-muted-foreground">
              You have an active session. Are you sure you want to exit?
            </p>
            <div className="flex gap-2">
              <Button
                onClick={confirmExit}
                variant="destructive"
                className="flex-1"
              >
                Exit
              </Button>
              <Button
                onClick={() => setShowExitConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
