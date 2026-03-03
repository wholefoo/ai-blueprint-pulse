import PDFDocument from "pdfkit";

const NAVY = "#1B2A4A";
const DARK_NAVY = "#0F1A2E";
const ACCENT_BLUE = "#2563EB";
const LIGHT_GRAY = "#F8FAFC";
const MEDIUM_GRAY = "#64748B";
const TEXT_COLOR = "#1E293B";

interface ChapterSection {
  heading: string;
  body: string[];
  bullets?: string[];
  tip?: string;
  checklist?: string[];
  table?: { headers: string[]; rows: string[][] };
}

interface Chapter {
  number: number;
  title: string;
  sections: ChapterSection[];
}

function addPageNumber(doc: PDFKit.PDFDocument, pageNum: number) {
  doc.save();
  doc.fontSize(8).fillColor(MEDIUM_GRAY)
    .text(`AI Blueprint Pulse  |  YouTube Success Guide`, 72, doc.page.height - 50, { align: "left", width: 250 })
    .text(`Page ${pageNum}`, 0, doc.page.height - 50, { align: "right", width: doc.page.width - 72 * 2 });
  doc.restore();
}

function addSectionHeading(doc: PDFKit.PDFDocument, text: string) {
  if (doc.y > doc.page.height - 150) doc.addPage();
  doc.moveDown(0.8);
  doc.fontSize(14).fillColor(ACCENT_BLUE).font("Helvetica-Bold").text(text);
  doc.moveDown(0.3);
  doc.moveTo(72, doc.y).lineTo(250, doc.y).strokeColor(ACCENT_BLUE).lineWidth(1).stroke();
  doc.moveDown(0.5);
}

function addBody(doc: PDFKit.PDFDocument, paragraphs: string[]) {
  doc.font("Helvetica").fontSize(10.5).fillColor(TEXT_COLOR);
  for (const p of paragraphs) {
    if (doc.y > doc.page.height - 100) doc.addPage();
    doc.text(p, { align: "justify", lineGap: 3 });
    doc.moveDown(0.5);
  }
}

function addBullets(doc: PDFKit.PDFDocument, items: string[]) {
  doc.font("Helvetica").fontSize(10.5).fillColor(TEXT_COLOR);
  for (const item of items) {
    if (doc.y > doc.page.height - 100) doc.addPage();
    doc.text(`  -  ${item}`, { indent: 15, lineGap: 2 });
    doc.moveDown(0.2);
  }
  doc.moveDown(0.3);
}

function addChecklist(doc: PDFKit.PDFDocument, items: string[]) {
  doc.font("Helvetica").fontSize(10.5).fillColor(TEXT_COLOR);
  for (const item of items) {
    if (doc.y > doc.page.height - 100) doc.addPage();
    doc.text(`  [ ]  ${item}`, { indent: 15, lineGap: 2 });
    doc.moveDown(0.2);
  }
  doc.moveDown(0.3);
}

function addTip(doc: PDFKit.PDFDocument, tip: string) {
  if (doc.y > doc.page.height - 120) doc.addPage();
  const startY = doc.y;
  doc.rect(72, startY, doc.page.width - 144, 0).fill(LIGHT_GRAY);
  doc.font("Helvetica-Bold").fontSize(10).fillColor(ACCENT_BLUE).text("PRO TIP:", 88, startY + 10, { continued: true });
  doc.font("Helvetica").fontSize(10).fillColor(TEXT_COLOR).text(` ${tip}`, { lineGap: 2 });
  const endY = doc.y + 10;
  doc.rect(72, startY, doc.page.width - 144, endY - startY).fill(LIGHT_GRAY);
  doc.font("Helvetica-Bold").fontSize(10).fillColor(ACCENT_BLUE).text("PRO TIP:", 88, startY + 10, { continued: true });
  doc.font("Helvetica").fontSize(10).fillColor(TEXT_COLOR).text(` ${tip}`, { lineGap: 2, width: doc.page.width - 144 - 32 });
  doc.y = endY;
  doc.moveDown(0.5);
}

function addTable(doc: PDFKit.PDFDocument, table: { headers: string[]; rows: string[][] }) {
  if (doc.y > doc.page.height - 200) doc.addPage();
  const colCount = table.headers.length;
  const tableWidth = doc.page.width - 144;
  const colWidth = tableWidth / colCount;
  const startX = 72;
  let y = doc.y;

  doc.rect(startX, y, tableWidth, 22).fill(NAVY);
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#FFFFFF");
  for (let i = 0; i < colCount; i++) {
    doc.text(table.headers[i], startX + i * colWidth + 6, y + 6, { width: colWidth - 12 });
  }
  y += 22;

  doc.font("Helvetica").fontSize(9).fillColor(TEXT_COLOR);
  for (let r = 0; r < table.rows.length; r++) {
    if (y > doc.page.height - 80) { doc.addPage(); y = 72; }
    if (r % 2 === 0) doc.rect(startX, y, tableWidth, 20).fill("#F1F5F9");
    doc.fillColor(TEXT_COLOR);
    for (let c = 0; c < colCount; c++) {
      doc.text(table.rows[r][c] || "", startX + c * colWidth + 6, y + 5, { width: colWidth - 12 });
    }
    y += 20;
  }
  doc.y = y;
  doc.moveDown(0.5);
}

function getYouTubeGuideChapters(): Chapter[] {
  return [
    {
      number: 1,
      title: "The YouTube Opportunity: Why Now Is the Time",
      sections: [
        {
          heading: "The Platform That Changed Everything",
          body: [
            "YouTube is the world's second-largest search engine and the most powerful video platform on the planet. With over 2.7 billion monthly active users, it represents an unprecedented opportunity for businesses, entrepreneurs, and creators to build audiences, generate revenue, and establish authority in virtually any niche.",
            "Unlike social media platforms where content disappears within hours, YouTube videos continue generating views, leads, and revenue for years after publication. A well-optimized video from 2020 can still rank on the first page of both YouTube and Google search results today, delivering passive traffic and income long after the initial effort.",
            "The shift toward video content consumption has accelerated dramatically. Studies show that 82% of all internet traffic now comes from video, and YouTube captures the lion's share of that attention. For businesses, this means that video is no longer optional — it's the primary way consumers discover, evaluate, and choose products and services."
          ],
          tip: "YouTube is often called 'the world's second-largest search engine.' Treat it like one. Every video you upload is an opportunity to rank for search terms your ideal customers are already searching for."
        },
        {
          heading: "YouTube by the Numbers",
          body: [
            "Understanding the scale of YouTube helps frame the opportunity correctly. These statistics demonstrate why YouTube should be central to any digital strategy:"
          ],
          bullets: [
            "2.7 billion monthly active users worldwide across 100+ countries",
            "1 billion hours of video watched daily on the platform",
            "500+ hours of video uploaded every single minute",
            "70% of viewers say YouTube makes them more aware of new brands",
            "YouTube is the #2 most visited website globally (after Google)",
            "90% of people say they discover new brands or products on YouTube",
            "The average mobile viewing session is over 40 minutes",
            "YouTube Shorts now receive 70 billion daily views worldwide",
            "Creators earned over $70 billion from YouTube in the past three years",
            "YouTube reaches more 18-49 year-olds than any cable TV network in the US"
          ]
        },
        {
          heading: "The Business Case for YouTube",
          body: [
            "For businesses, YouTube offers several distinct advantages over other marketing channels. First, it provides compounding returns — unlike paid advertising where results stop the moment you stop spending, YouTube content continues working for you indefinitely. Second, it builds trust at scale. Video allows potential customers to see your face, hear your voice, and evaluate your expertise before ever making contact.",
            "Third, YouTube integrates seamlessly with Google's search ecosystem. Videos frequently appear in Google search results, giving you two opportunities to rank for any given keyword. Fourth, the platform provides robust analytics that help you understand exactly who your audience is, what they want, and how they engage with your content.",
            "The cost of entry has never been lower. A smartphone, basic lighting, and free editing software are all you need to get started. What matters most is your expertise, your ability to solve problems, and your consistency in showing up for your audience."
          ]
        },
        {
          heading: "Who This Guide Is For",
          body: [
            "This guide is designed for entrepreneurs, business owners, marketers, and aspiring creators who want to leverage YouTube as a serious business tool. Whether you're starting from zero subscribers or looking to optimize an existing channel, the strategies in this guide will help you build a sustainable YouTube presence that generates real business results.",
            "We'll cover everything from channel setup and content strategy to advanced growth tactics and monetization methods. Each chapter builds on the previous one, creating a comprehensive roadmap you can follow at your own pace. The techniques described here are based on proven methodologies used by channels ranging from small niche creators to channels with millions of subscribers."
          ]
        }
      ]
    },
    {
      number: 2,
      title: "Channel Setup and Optimization",
      sections: [
        {
          heading: "Creating Your Channel Foundation",
          body: [
            "Your YouTube channel is your digital storefront. Before uploading a single video, you need to establish a professional foundation that communicates credibility and makes it easy for viewers to understand what you offer and why they should subscribe.",
            "Start by choosing a channel name that is memorable, searchable, and aligned with your brand. Avoid overly clever names that don't communicate what your channel is about. If you're building a personal brand, your name works perfectly. If you're building a business channel, make sure the name includes relevant keywords when possible.",
            "Your channel handle (the @username) should be clean, easy to type, and consistent with your other social media profiles. This is how people will tag and find you, so simplicity matters."
          ]
        },
        {
          heading: "Channel Art and Branding",
          body: [
            "Visual branding creates an immediate impression of professionalism and quality. Your channel banner (2560 x 1440 pixels) should clearly communicate three things: who you are, what content you create, and when you upload. Use high-contrast colors, readable fonts, and include a clear value proposition.",
            "Your profile picture (800 x 800 pixels) should be a high-quality headshot or logo that's recognizable even at small sizes. If you're a personal brand, a professional photo of your face with a clean background works best. If you're a company, use your logo but ensure it's legible at thumbnail size.",
            "Create a consistent color palette and visual style that carries across your thumbnails, channel art, and video content. This visual consistency helps viewers instantly recognize your content in their subscription feed and search results."
          ],
          checklist: [
            "Channel banner designed at 2560 x 1440 pixels with value proposition",
            "Professional profile picture at 800 x 800 pixels",
            "Channel handle (@username) claimed and consistent across platforms",
            "Color palette defined (primary, secondary, accent colors)",
            "Font choices selected for thumbnails and on-screen text",
            "Watermark image uploaded for video branding"
          ]
        },
        {
          heading: "Channel Description and About Section",
          body: [
            "Your channel description is prime real estate for YouTube SEO. Write a compelling description that includes your most important keywords naturally within the first two lines (these are visible without clicking 'more'). Explain what viewers will learn or gain by subscribing, mention your upload schedule, and include links to your website and social profiles.",
            "Structure your about section with a clear hierarchy: lead with your value proposition, follow with your credentials or unique angle, then provide practical information about your upload schedule and content categories. End with a call-to-action encouraging subscription."
          ],
          tip: "Include your primary keyword phrase within the first 48 characters of your channel description. YouTube uses this text for channel-level SEO, and it appears in search results."
        },
        {
          heading: "Channel Keywords and Settings",
          body: [
            "Navigate to YouTube Studio > Settings > Channel > Basic info to add channel keywords. These are broad terms that help YouTube understand your channel's overall topic. Include 7-10 relevant keywords that describe your niche, audience, and content type.",
            "Set your channel's default upload settings to save time on every video: default description template (with links and social profiles), default tags, default category, default language, and default visibility. This ensures consistency and saves significant time as you scale your content production.",
            "Enable all relevant channel features including custom thumbnails, cards, end screens, and community posts. Verify your channel to unlock longer video uploads and external link capabilities."
          ],
          table: {
            headers: ["Setting", "Where to Find It", "Recommended Action"],
            rows: [
              ["Channel keywords", "Studio > Settings > Channel", "Add 7-10 niche keywords"],
              ["Default description", "Studio > Settings > Upload defaults", "Create template with links"],
              ["Default tags", "Studio > Settings > Upload defaults", "Add 5-8 broad niche tags"],
              ["Branding watermark", "Studio > Customization > Branding", "Upload subscribe button image"],
              ["Featured sections", "Studio > Customization > Layout", "Organize by content series"],
              ["Channel trailer", "Studio > Customization > Layout", "Create 60-90 second intro video"],
              ["Contact email", "Studio > Customization > Basic info", "Add business inquiry email"]
            ]
          }
        },
        {
          heading: "Channel Sections and Organization",
          body: [
            "Organize your channel page using sections that guide new visitors through your best content. Your channel layout should include: a channel trailer for non-subscribers, a featured video for returning subscribers, and organized playlists that group your content by topic or series.",
            "Create playlists strategically — they serve double duty as both content organization and SEO assets. Each playlist has its own title, description, and metadata that can rank in YouTube search. Name your playlists with keyword-rich titles that reflect what viewers are searching for.",
            "Pin your best-performing or most representative content to the top of your channel. First impressions matter, and new visitors will judge your entire channel based on the first few videos they see."
          ]
        }
      ]
    },
    {
      number: 3,
      title: "Content Strategy That Drives Growth",
      sections: [
        {
          heading: "Understanding the Three Content Pillars",
          body: [
            "Successful YouTube channels don't rely on random content — they build strategic content pillars that work together to attract, engage, and retain their audience. Every video you create should fall into one of three categories: Discovery content, Community content, or Sales content.",
            "Discovery content is designed to reach new viewers through search and suggested videos. These are typically how-to tutorials, listicles, and answer-based videos that target specific keywords. They have broad appeal and serve as the top of your content funnel.",
            "Community content strengthens relationships with existing subscribers. This includes behind-the-scenes videos, vlogs, Q&A sessions, and opinion pieces. These videos may not get the most views, but they build loyalty and keep your core audience engaged.",
            "Sales content directly promotes your products, services, or offers. This includes product demonstrations, case studies, testimonials, and launch videos. The key is balancing promotional content with value-driven content — a good rule of thumb is the 80/20 ratio: 80% value, 20% promotion."
          ],
          table: {
            headers: ["Content Type", "Purpose", "Examples", "Frequency"],
            rows: [
              ["Discovery", "Attract new viewers", "Tutorials, how-tos, listicles", "60% of uploads"],
              ["Community", "Retain subscribers", "Q&A, behind-scenes, opinions", "25% of uploads"],
              ["Sales", "Drive conversions", "Demos, case studies, launches", "15% of uploads"]
            ]
          }
        },
        {
          heading: "Keyword Research for YouTube",
          body: [
            "YouTube keyword research is fundamentally different from traditional SEO keyword research. While Google prioritizes text-based content, YouTube prioritizes engagement signals. The best YouTube keywords are those with sufficient search volume, manageable competition, and high engagement potential.",
            "Start with YouTube's own search suggest feature. Type your topic into the YouTube search bar and note the autocomplete suggestions — these are real searches that real people are performing. Use tools like TubeBuddy, VidIQ, or Keywords Everywhere to estimate search volume and competition for each suggestion.",
            "Look for keywords that have a 'video intent' — topics where people naturally prefer video over text. Tutorial-style queries ('how to'), review queries ('best X for Y'), and visual topics tend to perform exceptionally well on YouTube. Also research your competitors' most-viewed videos to identify proven topics in your niche."
          ],
          bullets: [
            "Use YouTube search suggest to find real search queries",
            "Check competitor channels for their top-performing video topics",
            "Target long-tail keywords with specific search intent",
            "Validate demand using Google Trends (filter by YouTube Search)",
            "Look for keywords with video results in Google search (indicates video intent)",
            "Prioritize keywords where existing results have low quality or are outdated",
            "Create a keyword spreadsheet tracking search volume, competition, and priority"
          ]
        },
        {
          heading: "Content Calendar and Batch Production",
          body: [
            "Consistency is the single most important factor in YouTube growth. Creating a content calendar ensures you never run out of ideas and can plan your production efficiently. Map out at least 4-8 weeks of content in advance, including titles, target keywords, and key talking points for each video.",
            "Batch production dramatically improves efficiency. Instead of filming one video at a time, dedicate full days to specific production tasks. Film 3-4 videos in a single recording session, then batch-edit them over the following days. This approach reduces setup time, maintains energy consistency across videos, and creates a content buffer that protects against schedule disruptions.",
            "Your upload frequency should be sustainable — it's better to upload one excellent video per week consistently than to upload daily for a month and then burn out. Most successful channels in the business/education space publish 1-2 videos per week."
          ],
          checklist: [
            "Create a 30-day content calendar with specific topics and keywords",
            "Batch-record at least 2-3 videos per recording session",
            "Schedule uploads at least one week in advance",
            "Plan seasonal and trending content at least 4 weeks ahead",
            "Build a 2-week content buffer for consistency during busy periods",
            "Review and update your content calendar every Sunday",
            "Track which content types perform best and adjust ratios accordingly"
          ]
        },
        {
          heading: "Scripting and Video Structure",
          body: [
            "The first 30 seconds of your video determine whether viewers stay or click away. Your hook must immediately communicate what the viewer will learn or gain, why it matters to them, and why they should trust you to deliver on that promise. Avoid lengthy introductions, unnecessary disclaimers, or asking for likes and subscribes before delivering value.",
            "Structure your videos using the PPP framework: Promise (tell them what they'll learn), Proof (deliver the content with evidence), and Payoff (summarize the value and provide a clear next step). This structure keeps viewers engaged because they always know what's coming and feel the content is progressing toward a clear conclusion.",
            "Write scripts or detailed outlines for every video. Even experienced creators benefit from scripting because it eliminates rambling, ensures you cover all key points, and makes editing significantly faster. Your script doesn't need to be word-for-word — bullet points with key phrases and transitions work well for a natural delivery style."
          ],
          tip: "The YouTube algorithm measures 'audience retention' — the percentage of your video that viewers actually watch. Structure your content to maintain curiosity throughout by using pattern interrupts, visual changes, and open loops that keep viewers watching to the end."
        },
        {
          heading: "Video Formats That Perform",
          body: [
            "Certain video formats consistently outperform others on YouTube. Understanding these formats helps you choose the right structure for each topic:",
            "Tutorials and How-To videos are the backbone of most business channels. They directly answer search queries, provide clear value, and establish your expertise. Structure them with clear steps, visual demonstrations, and a summary of key takeaways.",
            "Listicles (Top 10, 5 Best, 7 Mistakes) generate high click-through rates because they promise specific, digestible content. The numbered format creates a natural structure and gives viewers a clear reason to watch to the end.",
            "Case Studies and Results videos provide social proof and demonstrate real-world application of your strategies. Show specific results, explain the process, and be transparent about challenges and failures.",
            "Reaction and Commentary videos leverage existing trending content to reach new audiences. They work especially well for news, industry updates, and competitive analysis.",
            "YouTube Shorts (vertical, under 60 seconds) are YouTube's fastest-growing format. Use them to repurpose highlights from long-form content, share quick tips, and reach audiences who prefer short-form content."
          ]
        }
      ]
    },
    {
      number: 4,
      title: "Video Production Essentials",
      sections: [
        {
          heading: "Equipment: Start Simple, Upgrade Strategically",
          body: [
            "One of the biggest myths about YouTube is that you need expensive equipment to succeed. The truth is that content quality matters far more than production quality in the early stages. Many channels that now generate six or seven figures in revenue started with nothing more than a smartphone and natural lighting.",
            "That said, there is a minimum production quality threshold below which viewers will click away. Audio quality is the number one technical factor that affects viewer retention. Invest in a decent microphone before anything else — a $60 lavalier mic or USB condenser mic will dramatically improve your sound quality.",
            "For video, any modern smartphone shoots in 4K and produces excellent quality. If you want to step up, a mirrorless camera like the Sony ZV-1 or Canon M50 provides a significant quality improvement with autofocus that keeps you sharp as you move and talk."
          ],
          table: {
            headers: ["Equipment", "Budget Option", "Mid-Range", "Professional"],
            rows: [
              ["Camera", "Smartphone ($0)", "Sony ZV-1 ($750)", "Sony A7IV ($2,500)"],
              ["Microphone", "Lav mic ($25)", "Blue Yeti ($100)", "Rode NT1 ($270)"],
              ["Lighting", "Window light ($0)", "Ring light ($40)", "Key light kit ($200)"],
              ["Tripod", "Phone mount ($15)", "Tripod ($60)", "Fluid head ($300)"],
              ["Editing", "CapCut (free)", "DaVinci Resolve (free)", "Adobe Premiere ($22/mo)"],
              ["Background", "Clean wall ($0)", "Backdrop ($30)", "Set design ($500+)"],
              ["Teleprompter", "Notes app ($0)", "Phone app ($10)", "Dedicated unit ($200)"]
            ]
          }
        },
        {
          heading: "Lighting Fundamentals",
          body: [
            "Good lighting is the most cost-effective way to improve your video quality. The key principle is simple: position your primary light source in front of you, slightly above eye level, and to one side. This creates dimension in your face and eliminates the flat, amateur look of direct overhead lighting.",
            "Natural window light is your best free option. Position yourself facing a window during daylight hours, with the camera between you and the window. Use a white sheet or foam board on the opposite side of your face to fill in shadows. This simple setup produces professional-looking results at zero cost.",
            "If you're investing in lighting, a three-point lighting setup provides the most professional results: a key light (main light at 45 degrees), a fill light (softer light on the opposite side), and a back light (behind you, creating separation from the background). LED panels offer the best combination of quality, adjustability, and affordability."
          ],
          tip: "Color temperature matters. Set all your lights to the same color temperature (5600K for daylight, 3200K for warm indoor light) and adjust your camera's white balance to match. Mixing color temperatures creates an unprofessional look that's difficult to fix in post-production."
        },
        {
          heading: "Audio Recording Best Practices",
          body: [
            "Poor audio will cause viewers to leave faster than poor video. Your goal is clean, clear audio with minimal background noise. Here are the essential principles:",
            "Get the microphone as close to your mouth as possible. A $25 lavalier mic clipped to your shirt will sound better than a $500 condenser mic placed across the room. Proximity is the most important factor in audio quality.",
            "Record in a quiet environment with minimal echo. Hard surfaces (walls, windows, desks) create reflections that make your audio sound hollow. Soft surfaces (curtains, carpet, furniture, acoustic panels) absorb sound and create a warmer, more professional tone.",
            "Always do a test recording before your main session. Check for background noise (air conditioning, refrigerator, traffic), check audio levels (aim for peaks around -6dB to -12dB), and listen with headphones to catch any issues your ears might miss in the moment."
          ],
          checklist: [
            "Position microphone within 6-12 inches of your mouth",
            "Test record and listen back with headphones before each session",
            "Turn off HVAC, fans, and appliances that create background noise",
            "Add soft surfaces to your recording space to reduce echo",
            "Set audio levels to peak between -12dB and -6dB",
            "Record 10 seconds of room tone (silence) for noise removal in editing",
            "Use a pop filter or foam windscreen to eliminate plosive sounds",
            "Keep a backup audio recorder running (phone app) as insurance"
          ]
        },
        {
          heading: "On-Camera Presence and Delivery",
          body: [
            "Your on-camera energy needs to be approximately 20% higher than your normal conversational energy. What feels natural in person often comes across as flat and disengaged on camera. Practice speaking with slightly more volume, enthusiasm, and facial expression than you normally would.",
            "Look directly into the camera lens, not at yourself on the screen. This creates the illusion of eye contact with the viewer and builds a personal connection. If you struggle with this, place a small sticker or marker near the lens to remind yourself where to look.",
            "Use hand gestures and body movement to maintain visual interest. Static talking-head videos where the presenter doesn't move feel monotonous. Lean toward the camera for emphasis, use your hands to illustrate points, and vary your seated position to create subtle visual changes.",
            "Speak in short, clear sentences. Long, complex sentences are harder for viewers to follow and create more editing challenges. Pause between key points to let information land. It's perfectly fine to pause, breathe, and restart a sentence — these moments can be cleaned up in editing."
          ]
        },
        {
          heading: "Editing for Engagement",
          body: [
            "Editing is where good content becomes great content. The primary goal of editing is to remove everything that doesn't serve the viewer — eliminate dead air, rambling tangents, verbal fillers (um, uh, like), and any moments where the video loses momentum.",
            "Jump cuts (cutting between different parts of the same shot) are the standard editing style for YouTube. They keep the pace fast and allow you to deliver a tightly scripted video while maintaining a natural feel. Cut out pauses, mistakes, and transitions to maintain momentum.",
            "Add visual elements to reinforce your points: text overlays for key statistics, screenshots and demonstrations, B-roll footage for visual variety, and zoom effects to create emphasis. These visual changes function as pattern interrupts that reset viewer attention and prevent fatigue.",
            "Music and sound effects add production value, but use them judiciously. Background music should be barely noticeable — if viewers can clearly hear it, it's too loud. YouTube's Audio Library provides free, copyright-safe music and sound effects for any project."
          ],
          bullets: [
            "Cut out all dead space, filler words, and tangential content",
            "Add text overlays for key points, statistics, and important terms",
            "Include B-roll or screen recordings to illustrate concepts visually",
            "Use zoom effects (1.1x-1.3x) for emphasis on key statements",
            "Add captions/subtitles — 85% of social media video is watched without sound",
            "Keep intro sequences under 5 seconds (or eliminate them entirely)",
            "Add chapters via timestamps in the description for easy navigation",
            "Export at 1080p minimum; 4K if your source material supports it"
          ]
        }
      ]
    },
    {
      number: 5,
      title: "YouTube SEO and Discovery",
      sections: [
        {
          heading: "How the YouTube Algorithm Works",
          body: [
            "YouTube's recommendation algorithm is the most powerful distribution engine in digital media. Understanding how it works is essential for maximizing your reach. The algorithm has one primary objective: keep users on the platform as long as possible. It does this by recommending videos that individual users are most likely to watch and enjoy.",
            "The algorithm evaluates every video across three primary dimensions: click-through rate (CTR), audience retention, and engagement signals. CTR measures how often people click your video when they see it. Retention measures how much of the video they actually watch. Engagement measures likes, comments, shares, and subscribers generated by the video.",
            "Understanding these three metrics is the key to YouTube growth. Every optimization you make should be aimed at improving one or more of these signals. A video with a high CTR but low retention tells the algorithm the thumbnail and title are misleading. A video with high retention but low CTR tells the algorithm the content is good but the packaging needs improvement."
          ]
        },
        {
          heading: "Title Optimization",
          body: [
            "Your video title is the single most important metadata element for both SEO and CTR. An effective title accomplishes three things: it includes your target keyword, it creates curiosity or communicates clear value, and it accurately represents your content.",
            "Front-load your primary keyword — place it within the first 60 characters to ensure it's fully visible on all devices. Use power words that create emotional engagement: 'ultimate,' 'complete,' 'proven,' 'secret,' 'mistakes,' and 'essential' consistently drive higher CTRs.",
            "Test different title formulas and track which ones perform best for your audience. Common high-performing formats include: 'How to [Result] in [Timeframe],' '[Number] [Topic] Mistakes (And How to Fix Them),' 'The COMPLETE [Topic] Guide for [Audience],' and '[Topic] for Beginners — Everything You Need to Know.'"
          ],
          tip: "Update titles on underperforming videos after 48 hours. If a video gets a low CTR in its first two days, changing the title (and thumbnail) can give it a second chance with the algorithm. YouTube will re-evaluate and potentially push it to a broader audience."
        },
        {
          heading: "Thumbnail Design That Gets Clicks",
          body: [
            "Your thumbnail is your video's billboard. On YouTube, thumbnails drive 90% of click decisions. Investing time in thumbnail design has a higher return on investment than almost any other aspect of your YouTube workflow.",
            "Effective thumbnails follow consistent design principles: use high-contrast colors that stand out against YouTube's white background, include a face with a clear emotion (surprised, excited, focused), use minimal text (3-5 words maximum) in large, bold fonts, and create visual tension or curiosity that compels the click.",
            "Design your thumbnails before filming when possible. This forces you to think about the most compelling visual angle for your content and ensures your thumbnail accurately represents the video. Use tools like Canva, Photoshop, or Figma to create thumbnails at 1280 x 720 pixels (16:9 ratio).",
            "A/B test your thumbnails systematically. YouTube now offers built-in thumbnail testing for eligible channels. If you don't have access to this feature, you can manually test by swapping thumbnails after 48 hours and comparing CTR changes."
          ],
          checklist: [
            "Design at 1280 x 720 pixels with high resolution",
            "Use contrasting colors that stand out on white and dark backgrounds",
            "Include a clear facial expression when featuring a person",
            "Limit text to 3-5 words in large, readable font",
            "Ensure text is readable at mobile thumbnail size (small)",
            "Create visual contrast with the background",
            "Maintain consistent branding elements across all thumbnails",
            "Test at least 2 thumbnail variations for important videos"
          ]
        },
        {
          heading: "Description and Tags",
          body: [
            "Your video description provides critical context to the YouTube algorithm and serves as a secondary SEO asset. Write at least 250 words in your description, with your primary keyword appearing naturally in the first two sentences. Include related keywords and phrases throughout.",
            "Structure your description in this order: compelling summary (first 2-3 lines visible above the fold), timestamps/chapters, relevant links, social media links, and a standard footer with hashtags and disclaimers.",
            "Tags are less important than they used to be, but still worth including. Add 5-10 tags that include your exact target keyword, keyword variations, your channel name, and broad category terms. Tags help YouTube understand your content and can influence which videos appear as related content."
          ]
        },
        {
          heading: "Cards, End Screens, and Playlists",
          body: [
            "Cards and end screens are your internal linking tools — they keep viewers on your channel and signal to the algorithm that your content library is interconnected. Add 2-3 cards per video that link to related content at moments where viewers might naturally seek more information.",
            "End screens appear in the final 20 seconds of your video and should always include: a subscribe button, a link to your best related video, and optionally a link to a playlist or your website. Design your video's closing segment to accommodate end screen elements without covering important content.",
            "Playlists dramatically increase watch time by auto-playing your videos in sequence. Create playlists organized by topic series, difficulty level, or content type. When linking to your own content (in descriptions, cards, or end screens), link to the playlist version of the video rather than the individual video URL — this ensures the next video that auto-plays is yours, not a competitor's."
          ]
        }
      ]
    },
    {
      number: 6,
      title: "Growing Your Audience",
      sections: [
        {
          heading: "The First 1,000 Subscribers",
          body: [
            "The journey to your first 1,000 subscribers is the hardest phase of YouTube growth. The algorithm provides minimal distribution to new channels, which means you need to actively drive traffic from external sources. This is a marathon, not a sprint — most successful channels take 6-12 months to reach their first thousand.",
            "Focus on search-based content during this phase. New channels with zero authority won't get suggested alongside established creators, but they can rank for specific long-tail keywords in search results. Target keywords with moderate search volume and low competition — these are your foot in the door.",
            "Promote every video across all your existing platforms: email list, social media, online communities, forums, and relevant groups. Don't just drop links — add value in those communities and mention your video as a resource when genuinely relevant. This authentic approach builds lasting audience relationships."
          ],
          bullets: [
            "Focus exclusively on search-targeted content for your first 50 videos",
            "Share videos in relevant online communities (Reddit, Facebook groups, Discord)",
            "Collaborate with channels of similar size in your niche",
            "Respond to every comment within the first 24 hours of upload",
            "Create content on topics where existing YouTube results are weak or outdated",
            "Cross-promote on other social platforms with native clips (not just links)",
            "Optimize your channel page to convert visitors into subscribers",
            "Maintain a consistent upload schedule — the algorithm rewards consistency"
          ]
        },
        {
          heading: "Leveraging YouTube Shorts",
          body: [
            "YouTube Shorts is the fastest path to new subscriber growth in 2024-2026. The Shorts algorithm operates independently from the main long-form algorithm and is far more willing to push content from small channels to large audiences. A single Short that resonates can generate tens of thousands of views and hundreds of new subscribers overnight.",
            "Create Shorts by repurposing the most compelling 30-60 second moments from your long-form videos. This serves double duty: it gives your best content a second life and it drives new viewers to discover your full-length videos. Add a call-to-action at the end directing viewers to the related long-form content.",
            "Original Shorts also perform well. Quick tips, surprising facts, hot takes, and behind-the-scenes moments all work well in short format. The key is to hook viewers in the first 2 seconds — if they swipe past, you've lost them. Start with a bold statement, surprising visual, or direct question."
          ],
          tip: "Shorts that lead to long-form viewership are extremely valuable for your channel. End every Short with 'Full breakdown in the video on my channel' or similar CTA. YouTube tracks this viewer journey and rewards channels that successfully bridge Short-form to long-form viewing."
        },
        {
          heading: "Community Building and Engagement",
          body: [
            "A loyal community is worth more than a large but disengaged subscriber count. Community members share your content, defend your brand, purchase your products, and provide the engagement signals that fuel algorithmic distribution.",
            "Respond to comments actively, especially in the first 2 hours after upload. This is when YouTube evaluates initial engagement signals to decide how widely to distribute your video. Genuine, thoughtful replies encourage more comments and signal to the algorithm that your content generates conversation.",
            "Use YouTube's Community tab to maintain engagement between video uploads. Post polls, behind-the-scenes photos, upcoming topic teasers, and questions that spark discussion. Community posts keep your channel active in subscribers' feeds and provide valuable audience insights.",
            "Create recurring segments or series that give viewers a reason to come back. 'Weekly Q&A,' 'Monthly Industry Review,' or 'Tool of the Week' formats create appointment viewing habits that strengthen viewer loyalty."
          ]
        },
        {
          heading: "Collaboration Strategies",
          body: [
            "Collaborations expose your channel to new audiences that are already interested in your niche. The most effective collaborations are with channels of similar size (within 2-3x of your subscriber count) that serve an overlapping but not identical audience.",
            "Approach potential collaborators with a specific, mutually beneficial proposal. Don't just ask 'want to collab?' Instead, pitch a specific topic, explain what unique value you bring, and outline exactly how both channels will benefit. The best collaborations create content that neither channel could produce alone.",
            "Collaboration formats that work well include: joint discussions or debates, guest expert appearances, challenge videos, and 'day in the life' features. After the collaboration, cross-promote the content and engage with each other's communities."
          ]
        },
        {
          heading: "Analytics-Driven Growth",
          body: [
            "YouTube Analytics is your most powerful growth tool. Regularly reviewing your data helps you understand what's working, what isn't, and where to focus your efforts. Check your analytics at least weekly and do a deep dive monthly.",
            "Key metrics to track: impressions (how often YouTube shows your thumbnails), CTR (percentage of impressions that become views), average view duration (how long people watch), and subscriber conversion rate (views to subscribers). These four metrics together paint a complete picture of your channel's health.",
            "Pay special attention to the 'Traffic Sources' report. It shows you where your views come from — YouTube search, suggested videos, browse features, external sources, and more. This tells you which discovery mechanisms are working for your content and where to double down."
          ],
          table: {
            headers: ["Metric", "Good Benchmark", "Great Benchmark", "Action if Low"],
            rows: [
              ["CTR", "4-6%", "8-10%+", "Improve thumbnails and titles"],
              ["Avg View Duration", "40-50%", "60%+", "Improve content pacing and hooks"],
              ["Sub Conversion", "1-2%", "3-5%", "Add subscribe CTAs, improve value"],
              ["Impressions", "Growing MoM", "10%+ MoM growth", "Increase upload frequency"],
              ["RPM", "$2-5", "$8-15+", "Improve content for premium advertisers"],
              ["Returning Viewers", "20-30%", "40%+", "Strengthen community engagement"]
            ]
          }
        }
      ]
    },
    {
      number: 7,
      title: "Monetization Strategies",
      sections: [
        {
          heading: "YouTube Partner Program (Ad Revenue)",
          body: [
            "The YouTube Partner Program (YPP) is the foundation of YouTube monetization. To qualify, you need 1,000 subscribers and either 4,000 hours of watch time in the past 12 months (for long-form) or 10 million Shorts views in 90 days. Once accepted, you earn revenue from ads displayed on your videos.",
            "Ad revenue varies dramatically by niche, audience demographics, and season. Finance, business, technology, and health channels typically earn the highest CPMs ($15-50+ per 1,000 views) because advertisers pay premium rates to reach those audiences. Entertainment and gaming channels often see lower CPMs ($2-8).",
            "To maximize ad revenue: create longer videos (8-15 minutes) that allow mid-roll ad placements, target high-CPM topics, build an audience in premium demographics (25-54, US/UK/Canada/Australia), and upload consistently to maintain and grow your monthly view count."
          ]
        },
        {
          heading: "Sponsorships and Brand Deals",
          body: [
            "Sponsorships typically pay 3-10x more than ad revenue for the same number of views. Brands pay YouTube creators to feature their products because YouTube audiences are highly engaged and trust the creators they watch. Even channels with 5,000-10,000 subscribers can land sponsorship deals in the right niche.",
            "Create a media kit that includes: your channel statistics, audience demographics, content categories, past sponsor examples (if any), and your rate card. A standard starting rate is $20-50 per 1,000 subscribers per sponsored integration, but rates vary widely by niche and deliverable type.",
            "You can find sponsors proactively by reaching out to brands whose products you already use and recommend. Alternatively, join sponsorship marketplaces like Grapevine, Channel Pages, or FameBit (now YouTube BrandConnect). As your channel grows, sponsors will begin reaching out to you directly."
          ],
          table: {
            headers: ["Deal Type", "Description", "Typical Rate"],
            rows: [
              ["Dedicated Video", "Entire video about the sponsor", "$5,000 - $50,000+"],
              ["Integration", "60-90 second segment within video", "$1,000 - $15,000"],
              ["Pre-Roll Mention", "15-30 second mention at start", "$500 - $5,000"],
              ["Affiliate Link", "Commission per sale via your link", "10-30% per sale"],
              ["Product Placement", "Product visible/used in video", "$500 - $10,000"],
              ["Series Sponsorship", "Sponsor a recurring content series", "$10,000 - $100,000+"]
            ]
          }
        },
        {
          heading: "Digital Products and Courses",
          body: [
            "Selling your own digital products is the most scalable monetization strategy for YouTube creators. Unlike ad revenue and sponsorships, which are limited by view count, digital products can generate significant revenue from a relatively small but highly engaged audience.",
            "The most common digital products for YouTube creators include: online courses, eBooks, templates, checklists, software tools, and membership communities. The key is creating products that solve the same problems your free content addresses, but in a more comprehensive, structured, or convenient format.",
            "Use your YouTube content as the top of your sales funnel. Free videos establish your expertise and build trust. Your digital products provide the deep-dive, structured implementation that viewers need to actually achieve results. This value ladder approach feels natural because viewers have already experienced your teaching style and trust your knowledge."
          ],
          bullets: [
            "Create a flagship course ($197-997) teaching your core expertise comprehensively",
            "Offer a low-ticket product ($27-97) as an entry point for price-sensitive buyers",
            "Build templates and tools ($17-47) that save your audience time",
            "Launch a membership community ($19-99/month) for ongoing access and support",
            "Use YouTube videos as free samples that demonstrate your teaching quality",
            "Include course promotions naturally within relevant video content",
            "Offer exclusive bonuses to YouTube subscribers who purchase"
          ]
        },
        {
          heading: "Affiliate Marketing",
          body: [
            "Affiliate marketing allows you to earn commissions by recommending products and services you genuinely use. It's one of the most natural monetization methods for YouTube because you're simply extending the recommendations you'd make anyway.",
            "High-performing affiliate niches on YouTube include: software and tools (SaaS products often pay 20-40% recurring commissions), online education platforms, physical products via Amazon Associates, and financial services. Choose affiliate products that genuinely help your audience — promoting low-quality products for high commissions will destroy your credibility.",
            "Place affiliate links in your video description with clear context about what the product is and how it helps. Create dedicated review and comparison videos for your highest-commission products, as these videos have high purchase intent. Always disclose affiliate relationships transparently — it's both a legal requirement and a trust-building practice."
          ],
          tip: "Amazon Associates is the easiest affiliate program to start with because almost any product can be linked. However, commissions are low (1-5%). As you grow, negotiate direct affiliate relationships with companies whose products you frequently recommend — direct relationships often pay 20-50% commissions."
        },
        {
          heading: "Diversifying Revenue Streams",
          body: [
            "The most financially successful YouTube creators never rely on a single revenue source. Build a diversified income portfolio that includes multiple streams. A healthy revenue mix might look like: 30% digital products, 25% sponsorships, 20% ad revenue, 15% affiliate income, and 10% services or consulting.",
            "This diversification protects you against platform changes, algorithm shifts, and market fluctuations. If ad rates drop during Q1 (as they typically do), your digital product and sponsorship revenue can compensate. If a sponsorship falls through, your passive income streams maintain your baseline.",
            "Track each revenue stream monthly and identify which ones have the highest return on time invested. Often, creators discover that an hour spent creating a digital product generates 10x more revenue than an hour spent creating content optimized for ad revenue."
          ]
        }
      ]
    },
    {
      number: 8,
      title: "AI-Powered YouTube Growth",
      sections: [
        {
          heading: "AI Tools for Content Research and Planning",
          body: [
            "Artificial intelligence has transformed the YouTube content creation workflow. AI tools can dramatically reduce the time required for research, scripting, editing, and optimization — allowing you to produce more content at higher quality with less effort.",
            "For content research, tools like ChatGPT, Claude, and Perplexity can analyze market trends, identify content gaps, and generate comprehensive topic outlines in minutes. Use AI to research competitor channels, identify underserved keywords, and brainstorm unique angles on popular topics.",
            "AI Blueprint Pulse's multi-model analysis engine queries five AI models simultaneously (ChatGPT, Claude, Gemini, Grok, and Perplexity) to provide consensus-verified insights on any topic. This approach eliminates the bias inherent in single-model analysis and provides a more comprehensive understanding of market opportunities."
          ],
          bullets: [
            "Use ChatGPT or Claude to brainstorm 50+ video title ideas for your niche",
            "Leverage Perplexity for real-time research with source citations",
            "Use AI to analyze competitor video transcripts for content gaps",
            "Generate detailed video outlines and scripts with AI assistance",
            "Create A/B test variations for titles and descriptions using AI",
            "Use AI to summarize long research documents into actionable talking points",
            "Identify trending topics in your niche using AI-powered trend analysis"
          ]
        },
        {
          heading: "AI for Script Writing and Optimization",
          body: [
            "AI can cut your scripting time by 60-80% while improving the quality and structure of your content. The key is using AI as a starting point, not a replacement for your unique voice and expertise.",
            "Start by providing the AI with your target keyword, audience description, and key points you want to cover. Ask it to generate a structured outline with hooks, transitions, and call-to-actions. Then review the outline, add your personal examples, insights, and personality, and expand sections that need your unique expertise.",
            "Use AI to optimize your hooks — the first 30 seconds of your video. Provide your topic and ask the AI to generate 10 different hook options, then choose the most compelling one. AI is particularly effective at creating pattern interrupts, open loops, and curiosity-driven openings.",
            "After scripting, run your final script through AI for optimization. Ask it to identify weak transitions, suggest more engaging examples, tighten wordy sections, and recommend places to add visual elements or pattern interrupts."
          ]
        },
        {
          heading: "AI for Thumbnail and Title Generation",
          body: [
            "AI image generation tools like DALL-E 3, Midjourney, and Stable Diffusion can create compelling thumbnail backgrounds, illustrations, and visual elements. While you'll still want your face in most thumbnails (faces dramatically increase CTR), AI can generate the backgrounds, icons, and visual metaphors that make your thumbnails stand out.",
            "Use AI to generate multiple title variations and evaluate them against proven formulas. Provide your topic and ask the AI to create 20+ title options using different frameworks: how-to, listicle, mistake-based, comparison, and question-based formats. Test the top candidates against each other using YouTube's built-in A/B testing or manual rotation.",
            "AI can also analyze your existing titles and thumbnails to suggest improvements. Feed your lowest-CTR videos into an AI tool and ask for specific recommendations to increase click-through rates. Often, small changes in word choice or visual composition can dramatically improve performance."
          ],
          tip: "Create a 'title bank' using AI. Generate 100+ potential video titles in a single session, organized by content pillar. When it's time to plan your next video, browse your title bank instead of brainstorming from scratch. This ensures you always have a pipeline of ideas ready."
        },
        {
          heading: "AI-Powered Editing and Post-Production",
          body: [
            "AI editing tools have become remarkably capable. Tools like Descript allow you to edit video by editing text — simply delete words from the transcript and the corresponding video is removed. This makes rough-cut editing as fast as editing a document.",
            "Auto-captioning powered by AI (Descript, Captions app, CapCut) generates accurate subtitles in minutes. Since 85% of social media video is watched without sound, captions are essential for maximizing reach when your content is shared or embedded outside YouTube.",
            "AI can also handle repetitive editing tasks: removing silences and filler words, auto-generating chapter markers from content analysis, creating highlight reels for social media promotion, and even suggesting optimal cut points based on engagement patterns.",
            "Use AI tools to repurpose your long-form content into multiple formats: YouTube Shorts, Instagram Reels, TikTok clips, Twitter threads, LinkedIn posts, and blog articles. A single 15-minute YouTube video can generate 10-15 pieces of derivative content across platforms."
          ]
        },
        {
          heading: "Building AI Workflows for YouTube",
          body: [
            "The most efficient YouTube creators build automated workflows that combine multiple AI tools into seamless production pipelines. Here's an example workflow:",
            "Step 1: Use AI to research trending topics in your niche and identify the highest-potential keywords. Step 2: Generate a video outline and detailed script using your preferred AI writing tool. Step 3: Create thumbnail concepts with AI image generation while you record. Step 4: Edit using AI-powered tools that auto-remove silences and generate captions. Step 5: Generate optimized titles, descriptions, and tags with AI. Step 6: Auto-create social media promotional content from your video.",
            "This workflow reduces total production time from 8-12 hours per video to 3-5 hours while maintaining or improving quality. The time savings compound dramatically as you scale — a creator producing 2 videos per week saves 10-14 hours weekly, equivalent to gaining an extra part-time employee.",
            "AI Blueprint Pulse provides pre-built research workflows through its Blueprint Studio, which integrates Tavily web research with multi-model AI analysis to deliver comprehensive topic intelligence in minutes rather than hours."
          ]
        }
      ]
    },
    {
      number: 9,
      title: "Advanced YouTube Strategies",
      sections: [
        {
          heading: "Understanding and Optimizing Audience Retention",
          body: [
            "Audience retention is the most important metric for YouTube growth because it directly correlates with algorithmic distribution. Videos with high retention get pushed to more viewers through suggested videos and browse features. The algorithm interprets high retention as a quality signal that predicts viewer satisfaction.",
            "Analyze your retention graphs in YouTube Analytics for every video. Look for drop-off points — moments where viewers leave in clusters. These reveal structural problems in your content: weak hooks, slow pacing, confusing transitions, or content that doesn't match the title's promise.",
            "The most common retention killers are: lengthy introductions before the content begins, asking for likes and subscribes before delivering value, tangential stories that don't serve the main topic, and repetitive points that could be consolidated. Edit ruthlessly to eliminate these engagement drains."
          ],
          bullets: [
            "Aim for 50%+ average view duration on all videos",
            "Use pattern interrupts (visual changes, B-roll, zooms) every 30-60 seconds",
            "Place your strongest content point in the first 60 seconds",
            "Create open loops ('I'll share the most important tip at the end')",
            "Use chapter markers so viewers can navigate to relevant sections",
            "Analyze retention graphs to identify and fix common drop-off patterns",
            "Re-edit older videos with poor retention to test if improvements help rankings"
          ]
        },
        {
          heading: "YouTube as a Search Engine: Advanced SEO",
          body: [
            "Beyond basic keyword optimization, advanced YouTube SEO involves understanding search intent, topical authority, and content clustering. YouTube increasingly evaluates channels holistically — a channel with 50 videos on marketing will rank individual marketing videos higher than a channel with just one or two marketing videos mixed with unrelated content.",
            "Build topical authority by creating comprehensive content clusters around your core topics. If your niche is email marketing, create videos covering every aspect: strategy, tools, copywriting, automation, analytics, deliverability, list building, and segmentation. This depth signals to YouTube that your channel is the authoritative source on the topic.",
            "Optimize for Google search in addition to YouTube search. Many YouTube videos appear in Google's search results, especially for how-to and tutorial queries. To improve your chances: create videos longer than 5 minutes (Google prefers substantial content), include detailed descriptions with natural language, and add structured timestamps.",
            "Track your ranking positions for target keywords weekly using tools like TubeBuddy or VidIQ. When a competitor outranks you, study their video to understand what they're doing better in terms of content, engagement, and optimization."
          ]
        },
        {
          heading: "Live Streaming and Premieres",
          body: [
            "Live streaming is YouTube's most underutilized growth tool. Live streams generate outsized engagement because viewers comment in real-time, creating a community experience that pre-recorded videos can't match. YouTube's algorithm heavily promotes live content, often placing it at the top of subscribers' home feeds.",
            "Start with a weekly or bi-weekly live stream focused on Q&A or topic discussion. Promote the stream 24-48 hours in advance using your Community tab and other social platforms. Have a structured agenda but leave room for audience interaction — the best live streams balance planned content with spontaneous conversation.",
            "Premieres combine the benefits of pre-recorded content with live stream engagement. When you premiere a video, it counts down to the first viewing and creates a live chat experience around the debut. This concentrates views and engagement into the video's first hour, sending strong initial signals to the algorithm."
          ]
        },
        {
          heading: "International and Multi-Language Strategy",
          body: [
            "YouTube is a global platform, and creators who think internationally have access to exponentially larger audiences. If your content is valuable in one language, it's likely valuable in others. Consider these expansion strategies:",
            "Add subtitles in your top non-English audience languages. YouTube Analytics shows which countries your viewers come from — start with subtitles in those languages. Professional translation services cost $3-5 per minute of video and can unlock entirely new audience segments.",
            "Create dubbed versions of your best-performing content for specific markets. AI dubbing tools like HeyGen and Eleven Labs can create remarkably natural translations that preserve your voice characteristics. Even imperfect dubbing often outperforms no localization.",
            "Consider creating dedicated channels for major language markets (Spanish, Portuguese, Hindi, German, Japanese). Multi-language channels allow you to build separate communities with localized content, playlists, and engagement."
          ]
        },
        {
          heading: "Building a Team and Scaling",
          body: [
            "As your channel grows, you'll reach a point where doing everything yourself becomes a bottleneck. The first hire for most YouTube creators is a video editor — editing is the most time-consuming production task and the easiest to delegate.",
            "Build your team incrementally based on what consumes the most time and what you least enjoy doing. Common roles include: video editor, thumbnail designer, research assistant, social media manager, community moderator, and virtual assistant for administrative tasks.",
            "Document your processes before hiring. Create standard operating procedures (SOPs) for every repeatable task: your editing style guide, thumbnail templates, description templates, upload checklist, and engagement protocols. Clear SOPs enable faster onboarding and consistent quality regardless of who performs the task.",
            "Freelancer platforms like Upwork, Fiverr, and OnlineJobs.ph are excellent sources for YouTube-specific talent. Start with project-based contractors before committing to full-time hires, and look for editors who have specific YouTube editing experience — it's a distinct skill from corporate or film editing."
          ],
          table: {
            headers: ["Role", "When to Hire", "Where to Find", "Typical Cost"],
            rows: [
              ["Video Editor", "10+ hrs/week editing", "Upwork, Fiverr", "$15-50/video"],
              ["Thumbnail Designer", "2+ hours per thumbnail", "Fiverr, 99designs", "$10-50/thumbnail"],
              ["Research Assistant", "5+ hrs/week researching", "Upwork, OnlineJobs.ph", "$5-15/hour"],
              ["Social Media Manager", "Channel has 10K+ subs", "Upwork, LinkedIn", "$500-2,000/month"],
              ["Virtual Assistant", "3+ hrs/week on admin", "OnlineJobs.ph", "$400-800/month"],
              ["Scriptwriter", "Want to increase output", "Upwork, ProBlogger", "$50-300/script"]
            ]
          }
        }
      ]
    },
    {
      number: 10,
      title: "YouTube Analytics Deep Dive",
      sections: [
        {
          heading: "Essential Reports and What They Tell You",
          body: [
            "YouTube Analytics provides a wealth of data, but knowing which reports to focus on is key to making data-driven decisions. The Overview dashboard gives you a quick snapshot, but the real insights are in the detailed reports.",
            "The Reach report shows how YouTube is distributing your content. Monitor impressions (how often your thumbnails are shown), CTR (how often they're clicked), and traffic sources (where views come from). This report helps you understand whether growth issues are related to distribution (low impressions) or packaging (low CTR).",
            "The Engagement report reveals how viewers interact with your content. Watch time, average view duration, and key moments (retention curve) show you exactly where viewers engage most and where they drop off. The likes, comments, and shares data helps you understand which content resonates emotionally.",
            "The Audience report is critical for long-term strategy. It shows viewer demographics, when your audience is online (best upload times), other channels your audience watches (collaboration opportunities), and your subscriber growth trajectory."
          ]
        },
        {
          heading: "Reading Retention Curves",
          body: [
            "Retention curves are the most actionable data in YouTube Analytics. Each video generates a unique curve that shows what percentage of viewers are still watching at each moment. Learning to read these curves is an essential skill for any serious creator.",
            "A flat retention curve is ideal — it means viewers are watching consistently throughout the video. Gradual decline is normal and expected. Sharp drops indicate specific problems at those timestamps that need investigation.",
            "Common retention curve patterns and their causes: a steep drop in the first 30 seconds (weak hook or misleading title/thumbnail), a spike at a specific point (viewers skipping to interesting content — consider restructuring), gradual decline accelerating toward the end (content becomes repetitive or less valuable), and flat sections (highly engaging content that holds attention).",
            "Compare retention curves across your videos to identify patterns. If you consistently see drops at the same relative position (e.g., 25% into every video), you likely have a structural habit that's costing you viewers — perhaps a recurring segment that's less interesting than you think."
          ]
        },
        {
          heading: "Revenue Analytics",
          body: [
            "Once monetized, YouTube provides detailed revenue analytics that help you optimize your earning potential. Key revenue metrics include: estimated revenue, RPM (revenue per mille — total revenue per 1,000 views), CPM (cost per mille — what advertisers pay per 1,000 ad impressions), and playback-based CPM.",
            "Track your RPM trends monthly. RPM naturally fluctuates with advertising seasons — Q4 (October-December) typically has the highest RPM due to holiday advertising spend, while Q1 (January-March) has the lowest. Understanding these cycles helps you set realistic revenue expectations.",
            "Identify your highest-RPM content types and create more of them. Some video topics naturally attract higher-paying advertisers, and creating content that combines high CPM with high view counts is the most efficient path to revenue growth."
          ]
        },
        {
          heading: "Using Data to Inform Content Strategy",
          body: [
            "Analytics should inform every content decision you make. Create a monthly analysis ritual where you review your top and bottom performing videos, identify patterns, and adjust your strategy accordingly.",
            "Look for outlier videos — both positive and negative. A video that significantly outperformed your average likely hit on a topic, format, or title formula that resonates with your audience and the algorithm. Create more content following that pattern. Conversely, underperforming videos reveal topics or formats to avoid or approach differently.",
            "Build a performance tracking spreadsheet that logs key metrics for every video: impressions, CTR, average view duration, views in first 48 hours, subscriber gain, and revenue. Over time, this data reveals patterns that are impossible to spot in YouTube's native analytics interface.",
            "Set quarterly growth goals based on your trailing metrics. If your average CTR is 5%, aim for 6% next quarter through thumbnail improvements. If your average retention is 45%, target 50% through better hooks and pacing. Small, consistent improvements compound into dramatic growth over time."
          ]
        }
      ]
    },
    {
      number: 11,
      title: "Legal, Compliance, and Best Practices",
      sections: [
        {
          heading: "Copyright and Fair Use",
          body: [
            "Understanding copyright law is essential for protecting both your content and your channel. YouTube's Content ID system automatically scans every upload against a database of copyrighted material. Using copyrighted music, footage, or images without permission can result in demonetization, video removal, or channel strikes.",
            "Fair use is a legal doctrine that permits limited use of copyrighted material for purposes such as criticism, commentary, education, and parody. However, fair use is a legal defense, not a right — it's determined on a case-by-case basis by courts. The four factors considered are: purpose of use, nature of the copyrighted work, amount used, and effect on the market value.",
            "To stay safe: use royalty-free music from YouTube's Audio Library or services like Epidemic Sound and Artlist, create original graphics and B-roll, get explicit permission before using others' content, and attribute sources clearly when using content under Creative Commons licenses."
          ]
        },
        {
          heading: "FTC Disclosure Requirements",
          body: [
            "The Federal Trade Commission requires clear disclosure of any material relationship between a creator and a brand. This applies to sponsorships, affiliate links, gifted products, and any other form of compensation. Failure to disclose can result in FTC enforcement action.",
            "Best practices for disclosure: use YouTube's built-in 'paid promotion' checkbox for sponsored content, verbally disclose sponsorships at the beginning of the video, include disclosure text in the first three lines of your description, and use clear language ('This video is sponsored by...' or 'I earn a commission if you purchase through my link').",
            "Disclosure must be clear and conspicuous — burying it in the middle of a long description or mentioning it only briefly doesn't meet the standard. When in doubt, over-disclose. Transparency builds audience trust and protects you legally."
          ]
        },
        {
          heading: "Community Guidelines and Channel Safety",
          body: [
            "YouTube's Community Guidelines define what content is and isn't allowed on the platform. Violating these guidelines results in strikes: one strike limits some features for a week, two strikes within 90 days adds more restrictions, and three strikes within 90 days results in permanent channel termination.",
            "The most common guideline violations for business channels are: misleading metadata (clickbait titles that don't match content), spam and deceptive practices, reused content without sufficient original value, and harassment or bullying in comments.",
            "Protect your channel by: regularly reviewing YouTube's updated guidelines, being transparent and accurate in your titles and thumbnails, responding respectfully to criticism, and avoiding manufactured controversy. Build your channel on genuine value, and community guideline issues will be rare."
          ],
          checklist: [
            "Review YouTube Community Guidelines quarterly for updates",
            "Enable comment moderation filters for spam and harassment",
            "Add FTC disclosure to all sponsored content and affiliate links",
            "Use YouTube's paid promotion checkbox for sponsored videos",
            "License all music, footage, and images properly",
            "Keep records of all brand deal contracts and agreements",
            "Set up Content ID claims monitoring for your own original content",
            "Create a copyright strike response plan in case of false claims"
          ]
        }
      ]
    },
    {
      number: 12,
      title: "Your 90-Day YouTube Launch Plan",
      sections: [
        {
          heading: "Days 1-30: Foundation Phase",
          body: [
            "The first month is all about building your foundation. Complete your channel setup, publish your first 4-8 videos, and establish your production workflow."
          ],
          checklist: [
            "Complete channel branding (banner, profile picture, description)",
            "Set up YouTube Studio defaults (description template, tags, settings)",
            "Research and document 30+ video topics with target keywords",
            "Create your content calendar for the first 30 days",
            "Script, record, and publish your first video",
            "Establish your recording setup (camera, mic, lighting, background)",
            "Create your thumbnail template and style guide",
            "Publish 4-8 videos (1-2 per week minimum)",
            "Set up end screens and cards on all published videos",
            "Create 2-3 playlists to organize your initial content",
            "Share each video on 3+ external platforms",
            "Respond to every comment within 24 hours",
            "Install TubeBuddy or VidIQ for keyword research",
            "Review analytics for your first videos and document learnings"
          ]
        },
        {
          heading: "Days 31-60: Optimization Phase",
          body: [
            "Month two focuses on learning from your initial data and optimizing your content based on what's working. You should have enough videos published to start seeing patterns in your analytics."
          ],
          checklist: [
            "Analyze top-performing and underperforming videos from Month 1",
            "Identify your highest-CTR thumbnail style and replicate it",
            "Review audience retention data and improve hooks/pacing",
            "Increase upload frequency if sustainable (target 2 videos/week)",
            "Create your first YouTube Short from existing content",
            "Start batch-recording to improve production efficiency",
            "Update titles and thumbnails on underperforming videos",
            "Begin engaging with other creators in your niche (comments, collabs)",
            "Create a Community tab posting schedule",
            "Optimize your channel page sections based on content performance",
            "Document your production workflow and identify bottlenecks",
            "Research and reach out to 3 potential collaboration partners",
            "Set up a basic email list to capture YouTube audience off-platform",
            "Publish 6-10 additional videos (reaching 10-18 total)"
          ]
        },
        {
          heading: "Days 61-90: Acceleration Phase",
          body: [
            "Month three is about accelerating your growth by doubling down on what works, introducing new content formats, and building toward monetization."
          ],
          checklist: [
            "Create a signature series or recurring segment for your channel",
            "Publish your first YouTube Shorts series (5-10 Shorts)",
            "Implement advanced SEO: description optimization, hashtags, subtitles",
            "Execute your first collaboration with another creator",
            "Create a lead magnet and add it to your video descriptions",
            "Develop your first potential revenue stream (affiliate, digital product)",
            "Experiment with live streaming (at least 1-2 live sessions)",
            "Review complete 90-day analytics and set quarterly goals",
            "Identify your most efficient content format and prioritize it",
            "Build a 'best of' playlist featuring your top-performing videos",
            "Consider hiring help for your biggest production bottleneck",
            "Plan your content strategy for the next quarter based on data",
            "Set milestone goals: subscriber target, view target, revenue target",
            "Celebrate your progress and document everything you've learned"
          ]
        },
        {
          heading: "Beyond 90 Days: Sustained Growth",
          body: [
            "After completing your 90-day launch plan, you'll have a solid foundation of 20-30+ videos, a clear understanding of your audience, and data-driven insights to guide your next moves. The key from here is consistency and continuous improvement.",
            "Set quarterly goals based on your trending metrics. Focus on one major improvement per quarter: Q1 might focus on thumbnail optimization, Q2 on audience retention, Q3 on monetization, and Q4 on scaling production.",
            "Continue educating yourself. YouTube is constantly evolving, and staying current with platform changes, algorithm updates, and industry trends is essential for maintaining your competitive edge. Follow YouTube's official Creator Insider channel, attend VidCon or similar events, and engage with the creator community.",
            "Remember that YouTube success is a long game. The creators who build sustainable, profitable channels are the ones who show up consistently, improve incrementally, and genuinely care about serving their audience. Your first 100 videos are your apprenticeship — embrace the learning process and trust that your effort compounds over time.",
            "The opportunity is real, the tools are available, and the audience is waiting. It's time to start creating."
          ]
        }
      ]
    }
  ];
}

export async function generateYouTubeGuide(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
      info: {
        Title: "AI Blueprint Pulse YouTube Success Guide",
        Author: "AI Blueprint Pulse",
        Subject: "Comprehensive YouTube Growth Strategy",
        Creator: "AI Blueprint Pulse",
      },
      bufferPages: true,
    });

    const buffers: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    doc.rect(0, 0, doc.page.width, doc.page.height).fill(NAVY);
    doc.moveDown(6);
    doc.fontSize(42).fillColor("#FFFFFF").font("Helvetica-Bold")
      .text("AI Blueprint Pulse", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor(ACCENT_BLUE).font("Helvetica")
      .text("PRESENTS", { align: "center", characterSpacing: 6 });
    doc.moveDown(1.5);
    doc.moveTo(doc.page.width * 0.25, doc.y).lineTo(doc.page.width * 0.75, doc.y)
      .strokeColor(ACCENT_BLUE).lineWidth(2).stroke();
    doc.moveDown(1.5);
    doc.fontSize(32).fillColor("#FFFFFF").font("Helvetica-Bold")
      .text("YouTube", { align: "center" });
    doc.fontSize(32).fillColor("#FFFFFF").font("Helvetica-Bold")
      .text("Success Guide", { align: "center" });
    doc.moveDown(1);
    doc.fontSize(14).fillColor("#94A3B8").font("Helvetica")
      .text("The Complete Playbook for Building a Profitable YouTube Channel", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor("#94A3B8")
      .text("From Zero to Revenue in 90 Days", { align: "center" });
    doc.moveDown(4);
    doc.fontSize(10).fillColor(ACCENT_BLUE)
      .text("Powered by Multi-Model AI Intelligence", { align: "center" });
    doc.fontSize(10).fillColor("#64748B")
      .text("ChatGPT  |  Claude  |  Gemini  |  Grok  |  Perplexity", { align: "center" });
    doc.moveDown(2);
    doc.fontSize(9).fillColor("#475569")
      .text(`Published ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" })}`, { align: "center" });
    doc.text("© AI Blueprint Pulse — All Rights Reserved", { align: "center" });

    doc.addPage();
    const chapters = getYouTubeGuideChapters();

    doc.rect(0, 0, doc.page.width, 100).fill(DARK_NAVY);
    doc.fontSize(28).fillColor("#FFFFFF").font("Helvetica-Bold")
      .text("Table of Contents", 72, 40);
    doc.y = 120;

    doc.font("Helvetica").fontSize(12).fillColor(TEXT_COLOR);
    for (const ch of chapters) {
      doc.moveDown(0.3);
      doc.font("Helvetica-Bold").fillColor(NAVY)
        .text(`Chapter ${ch.number}`, { continued: true });
      doc.font("Helvetica").fillColor(TEXT_COLOR)
        .text(`   ${ch.title}`);
      for (const s of ch.sections) {
        doc.font("Helvetica").fontSize(10).fillColor(MEDIUM_GRAY)
          .text(`        ${s.heading}`);
      }
      doc.fontSize(12);
    }

    doc.addPage();
    doc.font("Helvetica").fontSize(11).fillColor(TEXT_COLOR);
    doc.moveDown(2);
    doc.font("Helvetica-Bold").fontSize(18).fillColor(NAVY).text("About This Guide");
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(10.5).fillColor(TEXT_COLOR);
    doc.text("This guide was created by AI Blueprint Pulse to provide a comprehensive, actionable roadmap for building a profitable YouTube channel. Whether you're a complete beginner or an experienced creator looking to optimize your strategy, the insights and frameworks in this guide will help you achieve sustainable growth.", { align: "justify", lineGap: 3 });
    doc.moveDown(0.5);
    doc.text("The strategies outlined here are based on analysis of successful YouTube channels across dozens of niches, current platform best practices, and the latest research on video content optimization. Every recommendation is designed to be practical and immediately implementable.", { align: "justify", lineGap: 3 });
    doc.moveDown(0.5);
    doc.text("This guide is organized in a progressive structure — each chapter builds on the foundation laid by previous chapters. We recommend reading through the entire guide once to understand the complete framework, then using individual chapters as reference material as you implement each phase of your YouTube strategy.", { align: "justify", lineGap: 3 });
    doc.moveDown(1);
    doc.font("Helvetica-Bold").fontSize(12).fillColor(ACCENT_BLUE).text("How to Use This Guide:");
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(10.5).fillColor(TEXT_COLOR);
    const usageItems = [
      "Read chapters 1-3 before creating your channel",
      "Use chapters 4-5 as production reference guides",
      "Follow the 90-Day Launch Plan in Chapter 12 for structured implementation",
      "Revisit chapters 6-7 as your channel grows and you're ready to monetize",
      "Use chapters 8-10 for advanced optimization and scaling"
    ];
    for (const item of usageItems) {
      doc.text(`  -  ${item}`, { indent: 15, lineGap: 2 });
      doc.moveDown(0.15);
    }

    let pageNum = 3;
    for (const chapter of chapters) {
      doc.addPage();
      pageNum++;

      doc.rect(0, 0, doc.page.width, 110).fill(DARK_NAVY);
      doc.fontSize(12).fillColor(ACCENT_BLUE).font("Helvetica")
        .text(`CHAPTER ${chapter.number}`, 72, 35, { characterSpacing: 3 });
      doc.fontSize(26).fillColor("#FFFFFF").font("Helvetica-Bold")
        .text(chapter.title, 72, 58, { width: doc.page.width - 144 });
      doc.y = 130;

      for (const section of chapter.sections) {
        addSectionHeading(doc, section.heading);
        if (section.body.length > 0) addBody(doc, section.body);
        if (section.bullets) addBullets(doc, section.bullets);
        if (section.checklist) addChecklist(doc, section.checklist);
        if (section.table) addTable(doc, section.table);
        if (section.tip) addTip(doc, section.tip);
      }
    }

    doc.addPage();
    pageNum++;
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(NAVY);
    doc.moveDown(8);
    doc.fontSize(28).fillColor("#FFFFFF").font("Helvetica-Bold")
      .text("Start Building Your", { align: "center" });
    doc.text("YouTube Empire Today", { align: "center" });
    doc.moveDown(1.5);
    doc.fontSize(13).fillColor("#94A3B8").font("Helvetica")
      .text("Visit AI Blueprint Pulse for more business intelligence,", { align: "center" });
    doc.text("AI-powered research tools, and premium business blueprints.", { align: "center" });
    doc.moveDown(2);
    doc.fontSize(11).fillColor(ACCENT_BLUE)
      .text("aiblueprintpulse.replit.app", { align: "center" });
    doc.moveDown(3);
    doc.fontSize(9).fillColor("#475569")
      .text("© AI Blueprint Pulse — All Rights Reserved", { align: "center" });
    doc.text("Powered by Multi-Model AI Intelligence", { align: "center" });

    const totalPages = doc.bufferedPageRange().count;
    for (let i = 1; i < totalPages - 1; i++) {
      doc.switchToPage(i);
      addPageNumber(doc, i);
    }

    doc.end();
  });
}
