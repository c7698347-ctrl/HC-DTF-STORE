import { NextResponse } from 'next/server';
import { DEFAULT_CATEGORIES } from '@/lib/store';

export async function GET() {
  return NextResponse.json({
    success: true,
    categories: DEFAULT_CATEGORIES
  });
}
