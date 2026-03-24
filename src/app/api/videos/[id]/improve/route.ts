import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { optimizeDescription } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        descriptions: {
          orderBy: { version: 'desc' },
          take: 1
        }
      }
    });

    if (!video || video.descriptions.length === 0) {
      return NextResponse.json({ error: 'Video or description not found' }, { status: 404 });
    }

    const currentDesc = video.descriptions[0];
    
    // Call AI to optimize based on current performance
    const optimized = await optimizeDescription(
      currentDesc.content, 
      video.views, 
      video.ctr, 
      video.watchTime
    );

    // Save new version
    const newVersion = await prisma.descriptionVersion.create({
      data: {
        videoId: video.id,
        content: optimized.optimizedContent,
        seoScore: Math.max(currentDesc.seoScore, optimized.seoScore),
        version: currentDesc.version + 1,
        changelog: optimized.changelog
      }
    });

    return NextResponse.json(newVersion);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to optimize description' }, { status: 500 });
  }
}
