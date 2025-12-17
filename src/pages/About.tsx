import { useTranslation } from 'react-i18next';
import { AlertTriangle, User, Gift, BookOpen, Shield, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Info className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">{t('about.title')}</h1>
      </div>

      {/* Disclaimer - Prominent Warning */}
      <Alert variant="destructive" className="mb-6 border-2">
        <AlertTriangle className="h-5 w-5" />
        <AlertDescription className="ml-2">
          <p className="font-bold text-base mb-2">{t('about.disclaimerTitle')}</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>{t('about.disclaimerEducational')}</li>
            <li>{t('about.disclaimerNotReal')}</li>
            <li>{t('about.disclaimerResponsibility')}</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Developer Credits */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            {t('about.developerTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('about.developerName')}</p>
        </CardContent>
      </Card>

      {/* Usage Info */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gift className="h-5 w-5 text-primary" />
            {t('about.usageTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              {t('about.usageFree')}
            </li>
            <li className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              {t('about.usageLocalData')}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              {t('about.usageOffline')}
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* References */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-primary" />
            {t('about.referencesTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('about.referencesAHA')}</p>
        </CardContent>
      </Card>

      {/* Version */}
      <p className="text-center text-xs text-muted-foreground mt-6">
        {t('about.version')} 1.0.0
      </p>
    </div>
  );
};

export default About;
