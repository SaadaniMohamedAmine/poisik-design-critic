import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale) {
    const cookieStore = await cookies();
    locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';
  }

  return {
    locale,
    messages: (
      await (locale === 'fr'
        ? import('../messages/fr.json')
        : import('../messages/en.json'))
    ).default,
  };
});
