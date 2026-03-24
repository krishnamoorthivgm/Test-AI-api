import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateInitialContent } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      include: {
        descriptions: {
          orderBy: { version: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, url } = body;

    if (!title || !url) {
      return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 });
    }

    // Generate initial content via AI
    const content = await generateInitialContent(title);
    
    // Save to database
    const video = await prisma.video.create({
      data: {
        title,
        url,
        metadata: JSON.stringify(content),
        descriptions: {
          create: {
            content: content.description,
            seoScore: 70, // Base initial score
            version: 1,
            changelog: 'Initial AI generation based on title'
          }
        }
      },
      include: {
        descriptions: true
      }
    });

    return NextResponse.json({ video, generatedContent: content });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
  }
}
