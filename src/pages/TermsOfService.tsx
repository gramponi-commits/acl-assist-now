import { useTranslation } from 'react-i18next';
import { ScrollText, AlertTriangle, Shield, Smartphone, Scale, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

const TermsOfService = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <ScrollText className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">{t('tos.title')}</h1>
      </div>

      {/* Critical Warning */}
      <Alert variant="destructive" className="mb-6 border-2">
        <AlertTriangle className="h-5 w-5" />
        <AlertDescription className="ml-2">
          <p className="font-bold text-base mb-2">{t('tos.criticalWarningTitle')}</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>{t('tos.criticalWarning1')}</li>
            <li>{t('tos.criticalWarning2')}</li>
            <li>{t('tos.criticalWarning3')}</li>
          </ul>
        </AlertDescription>
      </Alert>

      <p className="text-muted-foreground mb-6 text-sm">
        {t('tos.lastUpdated')}: January 2025
      </p>

      {/* Background Section */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t('tos.backgroundTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>{t('tos.backgroundP1')}</p>
          <p className="font-semibold text-destructive">{t('tos.backgroundP2')}</p>
          <p>{t('tos.backgroundP3')}</p>
        </CardContent>
      </Card>

      {/* Acceptance of Terms */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t('tos.acceptanceTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>{t('tos.acceptanceP1')}</p>
        </CardContent>
      </Card>

      {/* Intended Use */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            {t('tos.intendedUseTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>{t('tos.intendedUseP1')}</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>{t('tos.intendedUseList1')}</li>
            <li>{t('tos.intendedUseList2')}</li>
            <li>{t('tos.intendedUseList3')}</li>
            <li>{t('tos.intendedUseList4')}</li>
          </ul>
          <p className="font-semibold text-destructive">{t('tos.intendedUseWarning')}</p>
        </CardContent>
      </Card>

      {/* No Medical Advice */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t('tos.noMedicalAdviceTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>{t('tos.noMedicalAdviceP1')}</p>
          <p>{t('tos.noMedicalAdviceP2')}</p>
        </CardContent>
      </Card>

      {/* Data and Privacy */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t('tos.dataPrivacyTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>{t('tos.dataPrivacyP1')}</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>{t('tos.dataPrivacyList1')}</li>
            <li>{t('tos.dataPrivacyList2')}</li>
            <li>{t('tos.dataPrivacyList3')}</li>
          </ul>
          <p className="font-semibold">{t('tos.dataPrivacyWarning')}</p>
        </CardContent>
      </Card>

      {/* App Store Terms */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="h-5 w-5 text-primary" />
            {t('tos.appStoreTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-4">
          <div>
            <h4 className="font-semibold mb-2">{t('tos.androidTitle')}</h4>
            <p>{t('tos.androidP1')}</p>
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold mb-2">{t('tos.appleTitle')}</h4>
            <p>{t('tos.appleP1')}</p>
          </div>
        </CardContent>
      </Card>

      {/* License */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t('tos.licenseTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>{t('tos.licenseP1')}</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>{t('tos.licenseList1')}</li>
            <li>{t('tos.licenseList2')}</li>
            <li>{t('tos.licenseList3')}</li>
            <li>{t('tos.licenseList4')}</li>
          </ul>
        </CardContent>
      </Card>

      {/* Intellectual Property */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t('tos.intellectualPropertyTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>{t('tos.intellectualPropertyP1')}</p>
          <p>{t('tos.intellectualPropertyP2')}</p>
        </CardContent>
      </Card>

      {/* Disclaimers */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Scale className="h-5 w-5 text-primary" />
            {t('tos.disclaimersTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p className="uppercase font-semibold">{t('tos.disclaimersP1')}</p>
          <p>{t('tos.disclaimersP2')}</p>
          <p>{t('tos.disclaimersP3')}</p>
          <p className="uppercase">{t('tos.disclaimersP4')}</p>
        </CardContent>
      </Card>

      {/* Limitation of Liability */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t('tos.limitationTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p className="uppercase">{t('tos.limitationP1')}</p>
          <p>{t('tos.limitationP2')}</p>
        </CardContent>
      </Card>

      {/* Indemnification */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t('tos.indemnificationTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>{t('tos.indemnificationP1')}</p>
        </CardContent>
      </Card>

      {/* Changes to Terms */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t('tos.changesTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>{t('tos.changesP1')}</p>
        </CardContent>
      </Card>

      {/* Termination */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t('tos.terminationTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>{t('tos.terminationP1')}</p>
        </CardContent>
      </Card>

      {/* Governing Law */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t('tos.governingLawTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>{t('tos.governingLawP1')}</p>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-primary" />
            {t('tos.contactTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>{t('tos.contactP1')}</p>
          <p className="mt-2">
            <a
              href="https://github.com/gramponi-commits/acl-assist-now/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              GitHub Issues
            </a>
          </p>
        </CardContent>
      </Card>

      {/* Final Notice */}
      <Alert className="mb-6 border-primary">
        <AlertTriangle className="h-5 w-5" />
        <AlertDescription className="ml-2 text-sm">
          {t('tos.finalNotice')}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default TermsOfService;
