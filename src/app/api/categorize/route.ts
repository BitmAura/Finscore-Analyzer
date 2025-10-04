import { NextRequest, NextResponse } from 'next/server';
import { categorizationRules } from '@/lib/categorizationRules';

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json();

    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Invalid description' }, { status: 400 });
    }

    const lowerCaseDescription = description.toLowerCase();

    for (const keyword in categorizationRules) {
      if (lowerCaseDescription.includes(keyword)) {
        return NextResponse.json({ category: categorizationRules[keyword] });
      }
    }

    return NextResponse.json({ category: 'Uncategorized' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
