export const dynamic = 'force-dynamic';

import { getAllCountries } from '@/lib/services/countryService';
import InrCompareClient from './InrCompareClient';

export default async function InrComparePage() {
  const countries = await getAllCountries();
  return <InrCompareClient countries={countries} />;
}
