import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { optimizeDescription } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Simulated Cron: fetch videos with low CTR or watch time to auto-improve them
    const videos = await prisma.video.findMany({
      where: {
        OR: [
          { ctr: { lt: 5.0 } },
          { watchTime: { lt: 5.0 } }
        ]
      },
      include: {
        descriptions: {
          orderBy: { version: 'desc' },
          take: 1
        }
      }
    });

    if (videos.length === 0) {
      return NextResponse.json({ message: 'No videos needed improvement' });
    }

    const updates = [];
    for (const video of videos) {
      if (!video.descriptions || video.descriptions.length === 0) continue;
      
      const currentDesc = video.descriptions[0];
      const optimized = await optimizeDescription(
        currentDesc.content,
        video.views,
        video.ctr,
        video.watchTime
      );

      const newVersion = await prisma.descriptionVersion.create({
        data: {
          videoId: video.id,
          content: optimized.optimizedContent,
          seoScore: Math.max(currentDesc.seoScore, optimized.seoScore),
          version: currentDesc.version + 1,
          changelog: optimized.changelog
        }
      });
      updates.push(newVersion);
    }

    return NextResponse.json({ message: `Updated ${updates.length} videos`, updates });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to run cron job' }, { status: 500 });
  }
}
