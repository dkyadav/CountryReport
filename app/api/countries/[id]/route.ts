import { NextResponse } from 'next/server';
import { getCountryById } from '@/lib/services/countryService';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const country = await getCountryById(id);
    if (!country) {
      return NextResponse.json({ error: 'Country not found' }, { status: 404 });
    }
    return NextResponse.json(country);
  } catch (err) {
    console.error('[GET /api/countries/:id]', err);
    return NextResponse.json({ error: 'Failed to fetch country' }, { status: 500 });
  }
}
