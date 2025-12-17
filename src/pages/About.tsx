import { useTranslation } from 'react-i18next';
import { AlertTriangle, Gift, BookOpen, Shield, Info, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import developerHeadshot from '@/assets/developer-headshot.jpg';

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
            <img 
              src={developerHeadshot} 
              alt="Dr. Giacomo Ramponi" 
              className="h-6 w-6 rounded-full object-cover"
            />
            {t('about.developerTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <a 
            href="https://www.linkedin.com/in/g-r-078715203/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors"
          >
            {t('about.developerName')}
            <ExternalLink className="h-4 w-4" />
          </a>
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
          <a 
            href="https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/algorithms" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors"
          >
            {t('about.referencesAHA')}
            <ExternalLink className="h-4 w-4" />
          </a>
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
