import { getAllCountries } from '@/lib/services/countryService';
import CompareClient from './CompareClient';

export default async function ComparePage() {
  const countries = await getAllCountries();
  return <CompareClient countries={countries} />;
}
