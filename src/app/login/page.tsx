import LoginForm from '@/components/LoginForm';
import { getSettings } from '@/lib/settings';
import { getTranslations, type Language } from '@/lib/i18n';

export default async function LoginPage() {
  const settings = await getSettings();
  const lang = (settings.language || 'en') as Language;
  
  return <LoginForm language={lang} />;
}

