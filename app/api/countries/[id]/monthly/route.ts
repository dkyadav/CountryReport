import { NextResponse } from 'next/server';
import { getMonthlyData } from '@/lib/services/countryService';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const monthly = await getMonthlyData(id);
    if (!monthly) {
      return NextResponse.json({ error: 'Monthly data not found' }, { status: 404 });
    }
    return NextResponse.json(monthly);
  } catch (err) {
    console.error('[GET /api/countries/:id/monthly]', err);
    return NextResponse.json({ error: 'Failed to fetch monthly data' }, { status: 500 });
  }
}
