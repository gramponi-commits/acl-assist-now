import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllSessions, deleteSession, StoredSession } from '@/lib/sessionStorage';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Heart, XCircle, Clock, Zap, Syringe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function SessionHistory() {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await getAllSessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('history.confirmDelete'))) return;
    
    try {
      await deleteSession(id);
      setSessions(sessions.filter(s => s.id !== id));
      toast.success('Session deleted');
    } catch (error) {
      toast.error('Failed to delete session');
    }
  };

  const formatDuration = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">{t('history.title')}</h1>
      </div>

      <ScrollArea className="h-[calc(100vh-73px)]">
        <div className="p-4 space-y-4 max-w-2xl mx-auto">
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {t('history.noSessions')}
              </h2>
              <p className="text-muted-foreground">
                {t('history.startNew')}
              </p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="bg-card rounded-lg border border-border p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(session.startTime)}
                    </div>
                    <div className={cn(
                      'inline-flex items-center gap-1.5 mt-1 px-2 py-1 rounded-full text-sm font-medium',
                      session.outcome === 'rosc' 
                        ? 'bg-acls-success/20 text-acls-success'
                        : session.outcome === 'deceased'
                        ? 'bg-destructive/20 text-destructive'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      {session.outcome === 'rosc' ? (
                        <Heart className="h-4 w-4" />
                      ) : session.outcome === 'deceased' ? (
                        <XCircle className="h-4 w-4" />
                      ) : null}
                      {session.outcome === 'rosc' 
                        ? t('history.rosc')
                        : session.outcome === 'deceased'
                        ? t('history.deceased')
                        : t('history.unknown')}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(session.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-muted-foreground">{t('codeEnded.duration')}</div>
                      <div className="font-semibold">{formatDuration(session.duration)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-acls-shockable" />
                    <div>
                      <div className="text-muted-foreground">{t('codeEnded.shocks')}</div>
                      <div className="font-semibold">{session.shockCount}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Syringe className="h-4 w-4 text-acls-warning" />
                    <div>
                      <div className="text-muted-foreground">Epi</div>
                      <div className="font-semibold">{session.epinephrineCount}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                  <span className="text-muted-foreground">{t('codeEnded.cprFraction')}</span>
                  <span className="font-semibold">{session.cprFraction.toFixed(1)}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function History(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}
