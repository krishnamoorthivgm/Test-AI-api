import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy",
});

const useMock = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_api_key_here";

export async function generateInitialContent(topic: string) {
  if (useMock) {
    return getMockInitialContent(topic);
  }

  const prompt = `You are an expert YouTube Growth AI Assistant specialized in Need for Speed and supercar gameplay videos. 
Topic: ${topic}
Generate a highly engaging, viral, and SEO-optimized package. Return JSON exactly matching this structure:
{
  "titles": ["title 1", "title 2", "title 3"],
  "description": "2-3 paragraphs of high energy SEO description with keywords in the first 2 lines and hashtags at the end",
  "tags": ["tag1", "tag2"],
  "captionScript": ["caption1", "caption2"],
  "hook": "10-second powerful hook",
  "thumbnailIdea": "Description of the thumbnail",
  "ctaStrategy": "Details of the CTA strategy",
  "pinnedComment": "The pinned comment text",
  "shortsIdeas": ["short1", "short2"],
  "growthTips": ["tip1", "tip2"]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

export async function optimizeDescription(currentContent: string, views: number, ctr: number, watchTime: number) {
  if (useMock) {
    return getMockOptimizedContent(currentContent, ctr, watchTime);
  }

  let advice = "";
  if (ctr < 5.0) advice += "CTR is low. Improve the first 2 lines for higher curiosity and searchability. Add power words like INSANE, UNREAL, EXTREME. ";
  if (watchTime < 5.0) advice += "Watch Time is low. Improve engagement triggers and hooks throughout the description to encourage retention. ";

  const prompt = `You are an expert YouTube SEO optimizer for Need for Speed gameplay videos.
Current Description:
${currentContent}

Performance Data:
Views: ${views}
CTR: ${ctr}%
Watch Time: ${watchTime} min

Strategy: ${advice}

Return a JSON object exactly matching this structure:
{
  "optimizedContent": "The full rewritten description focusing on fixing the metrics...",
  "seoScore": 85,
  "changelog": "Added 'Bugatti top speed 420km/h' keyword for higher search visibility. Boosted curiosity in first line."
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

function getMockInitialContent(topic: string) {
  return {
    titles: [
      `The FASTEST ${topic} in Need for Speed! (UNREAL TOP SPEED) 🤯`,
      `I Pushed This ${topic} to the EXTREME Limit! (4K Ultra Graphics)`,
      `INSANE Top Speed Run! You Won't Believe How Fast This ${topic} Is 🔥`
    ],
    description: `The FASTEST ${topic} top speed run in Need for Speed! Watching this NFS gameplay in 4K Ultra Graphics is UNREAL.\n\nCan this ${topic} break the ultimate speed record? I pushed this hypercar to the absolute EXTREME limit in Need for Speed, dodging traffic and hitting top speed in stunning detail. If you love high-speed racing and epic close calls, watch till the very end!\n\nMake sure to SUBSCRIBE for more insane speed runs, LIKE if you want to see more supercars, and COMMENT down below what car I should drive next! 👇\n\n#NeedForSpeed #NFS #TopSpeed #RacingGames #NFSGameplay #Supercars #4K #UltraGraphics #Gaming`,
    tags: ["Need for Speed", "NFS gameplay", `${topic} top speed`, "fastest car in NFS", "supercar top speed run", "NFS 4K ultra graphics", "insane speed run", "racing game 2024", "extreme top speed gameplay", "No Limit racing"],
    captionScript: [
      `This ${topic} just broke the speed limit in Need for Speed… watch till the end! 😱`,
      `We are pushing this beast to the absolute limit. Look at that acceleration! 🚀`,
      `Traffic dodging at 250+ MPH! One mistake and it’s all over. ⚠️`,
      `Wait for the top speed 🔥 The engine sounds INSANE.`,
      `Hitting the nitro! Are we about to break the game? ⚡`
    ],
    hook: `This ${topic} just broke the speed limit in Need for Speed… and what happens at the end will shock you! Watch this.`,
    thumbnailIdea: `A highly saturated, 4K screenshot of the ${topic} drifting or hitting top speed with heavy motion blur on the background but the car in sharp focus. Glowing neon speedometer pinned in the red zone.`,
    ctaStrategy: `Early Video (0:30): Quickly pop up a graphic with a sound effect: 'Subscribe for more insane speed runs!'. Mid-Video: 'If you think we're going to crash, drop a LIKE right now!'`,
    pinnedComment: `What is your dream supercar to drive in real life? Let me know below! 👇 (P.S. If you're reading this, you are a legend! Hit subscribe!) 🔥🏎️`,
    shortsIdeas: [
      `Short 1 (The Near Miss): Clip a 15-second segment of dodging traffic at maximum speed. Caption: Is this the most stressful 15 seconds in Need for Speed? 😱`,
      `Short 2 (The Launch): Show the 0-100mph launch with raw, unedited engine sounds.`
    ],
    growthTips: [
      "Loop Endings on Shorts: Edit your Shorts so the final frame flows perfectly back into the first frame.",
      "Safe Editing for Monetization: Keep crashes visually spectacular but remove realistic impact sounds."
    ]
  };
}

function getMockOptimizedContent(current: string, ctr: number, watchTime: number) {
  let changelog = "Routine keyword bump.";
  let modified = current;
  if (ctr < 5.0) {
    changelog = "Added 'NFS Unbound best cars' and 'Top Speed' keywords to first sentence for higher CTR and curiosity.";
    modified = "[UPDATED 🔥] You won't believe this NFS Unbound best cars showcase! " + modified;
  }
  if (watchTime < 5.0) {
    changelog += " Added strong engagement hook midway through description to boost watch time.";
    modified += "\n\nWAIT FOR IT: At minute 3:45, an unbelievable near-miss happens that you HAVE to see to believe! Watch till the end!";
  }
  
  return {
    optimizedContent: modified,
    seoScore: Math.floor(Math.random() * 20) + 80, // 80-100
    changelog
  };
}
