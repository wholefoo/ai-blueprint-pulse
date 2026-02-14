import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Packer,
  BorderStyle,
  TableOfContents,
} from "docx";

function parseMarkdownToDocx(markdown: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const lines = markdown.split("\n");
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.match(/^#{1}\s/)) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
          children: [
            new TextRun({
              text: line.replace(/^#{1}\s/, ""),
              bold: true,
              size: 36,
              font: "Calibri",
            }),
          ],
        })
      );
    } else if (line.match(/^#{2}\s/)) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
          children: [
            new TextRun({
              text: line.replace(/^#{2}\s/, ""),
              bold: true,
              size: 30,
              font: "Calibri",
            }),
          ],
        })
      );
    } else if (line.match(/^#{3}\s/)) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: line.replace(/^#{3}\s/, ""),
              bold: true,
              size: 26,
              font: "Calibri",
            }),
          ],
        })
      );
    } else if (line.match(/^#{4,6}\s/)) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 150, after: 80 },
          children: [
            new TextRun({
              text: line.replace(/^#{4,6}\s/, ""),
              bold: true,
              size: 24,
              font: "Calibri",
            }),
          ],
        })
      );
    } else if (line.match(/^[-*]\s/)) {
      const text = line.replace(/^[-*]\s/, "").trim();
      paragraphs.push(
        new Paragraph({
          spacing: { before: 40, after: 40 },
          indent: { left: 720 },
          bullet: { level: 0 },
          children: formatInlineText(text),
        })
      );
    } else if (line.match(/^\d+\.\s/)) {
      const text = line.replace(/^\d+\.\s/, "").trim();
      paragraphs.push(
        new Paragraph({
          spacing: { before: 40, after: 40 },
          indent: { left: 720 },
          children: formatInlineText(text),
        })
      );
    } else if (line.match(/^>\s/)) {
      const text = line.replace(/^>\s?/, "").trim();
      paragraphs.push(
        new Paragraph({
          spacing: { before: 80, after: 80 },
          indent: { left: 480 },
          border: {
            left: { style: BorderStyle.SINGLE, size: 6, color: "4472C4" },
          },
          children: [
            new TextRun({
              text,
              italics: true,
              color: "666666",
              font: "Calibri",
              size: 22,
            }),
          ],
        })
      );
    } else if (line.match(/^---$/) || line.match(/^\*\*\*$/)) {
      paragraphs.push(
        new Paragraph({
          spacing: { before: 200, after: 200 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
          },
          children: [],
        })
      );
    } else if (line.trim() === "") {
      paragraphs.push(
        new Paragraph({
          spacing: { before: 60, after: 60 },
          children: [],
        })
      );
    } else {
      paragraphs.push(
        new Paragraph({
          spacing: { before: 60, after: 60 },
          children: formatInlineText(line),
        })
      );
    }
  }

  return paragraphs;
}

function formatInlineText(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|(.+?))/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match[2]) {
      runs.push(new TextRun({ text: match[2], bold: true, italics: true, font: "Calibri", size: 22 }));
    } else if (match[3]) {
      runs.push(new TextRun({ text: match[3], bold: true, font: "Calibri", size: 22 }));
    } else if (match[4]) {
      runs.push(new TextRun({ text: match[4], italics: true, font: "Calibri", size: 22 }));
    } else if (match[5]) {
      runs.push(new TextRun({ text: match[5], font: "Courier New", size: 20, color: "C7254E" }));
    } else if (match[6]) {
      runs.push(new TextRun({ text: match[6], font: "Calibri", size: 22 }));
    }
  }

  if (runs.length === 0) {
    runs.push(new TextRun({ text, font: "Calibri", size: 22 }));
  }

  return runs;
}

export async function generateDocx(
  title: string,
  content: string,
  tier: string
): Promise<Buffer> {
  const bodyParagraphs = parseMarkdownToDocx(content);

  const doc = new Document({
    creator: "AI Blueprint Pulse",
    title,
    description: `${tier} tier blueprint - ${title}`,
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 22,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: [
          new Paragraph({
            spacing: { before: 600, after: 100 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: title,
                bold: true,
                size: 48,
                font: "Calibri",
                color: "1B2A4A",
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 100, after: 100 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Blueprint`,
                size: 28,
                font: "Calibri",
                color: "4472C4",
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 100, after: 400 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Generated by AI Blueprint Pulse",
                size: 20,
                font: "Calibri",
                color: "999999",
                italics: true,
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 100, after: 100 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Full Resale Rights Included",
                bold: true,
                size: 22,
                font: "Calibri",
                color: "2E7D32",
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 200, after: 400 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 2, color: "1B2A4A" },
            },
            children: [],
          }),
          ...bodyParagraphs,
          new Paragraph({
            spacing: { before: 600, after: 200 },
            border: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            },
            children: [],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200 },
            children: [
              new TextRun({
                text: "This document was generated by AI Blueprint Pulse. The purchaser owns full resale and distribution rights.",
                size: 18,
                font: "Calibri",
                color: "999999",
                italics: true,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
