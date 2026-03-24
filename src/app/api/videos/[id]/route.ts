import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        descriptions: {
          orderBy: { version: 'desc' }
        }
      }
    });
    
    if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(video);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { views, ctr, watchTime } = body;

    const video = await prisma.video.update({
      where: { id },
      data: { views, ctr, watchTime }
    });

    return NextResponse.json(video);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update video stats' }, { status: 500 });
  }
}
