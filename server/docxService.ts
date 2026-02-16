import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Packer,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  TableBorders,
  Tab,
  TabStopType,
  TabStopPosition,
} from "docx";

function parseMarkdownToDocx(markdown: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const lines = markdown.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (isTableStart(lines, i)) {
      const { table, endIndex } = parseTable(lines, i);
      if (table) {
        paragraphs.push(new Paragraph({ spacing: { before: 120, after: 120 }, children: [] }));
        paragraphs.push(table as any);
        paragraphs.push(new Paragraph({ spacing: { before: 60, after: 60 }, children: [] }));
      }
      i = endIndex;
      continue;
    }

    if (line.match(/^```/)) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].match(/^```/)) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      for (const codeLine of codeLines) {
        paragraphs.push(
          new Paragraph({
            spacing: { before: 20, after: 20 },
            indent: { left: 360 },
            shading: { type: ShadingType.SOLID, color: "F5F5F5" },
            children: [
              new TextRun({
                text: codeLine || " ",
                font: "Courier New",
                size: 19,
                color: "333333",
              }),
            ],
          })
        );
      }
      continue;
    }

    if (line.match(/^#{1}\s/)) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 480, after: 240 },
          children: [
            new TextRun({
              text: line.replace(/^#{1}\s/, ""),
              bold: true,
              size: 36,
              font: "Calibri",
              color: "1B2A4A",
            }),
          ],
        })
      );
    } else if (line.match(/^#{2}\s/)) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 360, after: 180 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "D0D5DD" },
          },
          children: [
            new TextRun({
              text: line.replace(/^#{2}\s/, ""),
              bold: true,
              size: 30,
              font: "Calibri",
              color: "1B2A4A",
            }),
          ],
        })
      );
    } else if (line.match(/^#{3}\s/)) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 280, after: 120 },
          children: [
            new TextRun({
              text: line.replace(/^#{3}\s/, ""),
              bold: true,
              size: 26,
              font: "Calibri",
              color: "2D3748",
            }),
          ],
        })
      );
    } else if (line.match(/^#{4,6}\s/)) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: line.replace(/^#{4,6}\s/, ""),
              bold: true,
              size: 24,
              font: "Calibri",
              color: "4A5568",
            }),
          ],
        })
      );
    } else if (line.match(/^[-*]\s\[[ x]\]\s/)) {
      const checked = line.includes("[x]");
      const text = line.replace(/^[-*]\s\[[ x]\]\s/, "").trim();
      paragraphs.push(
        new Paragraph({
          spacing: { before: 40, after: 40 },
          indent: { left: 720 },
          children: [
            new TextRun({
              text: checked ? "\u2611 " : "\u2610 ",
              font: "Segoe UI Symbol",
              size: 22,
              color: checked ? "2E7D32" : "666666",
            }),
            ...formatInlineText(text),
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
    } else if (line.match(/^\s+[-*]\s/)) {
      const text = line.replace(/^\s+[-*]\s/, "").trim();
      paragraphs.push(
        new Paragraph({
          spacing: { before: 30, after: 30 },
          indent: { left: 1440 },
          bullet: { level: 1 },
          children: formatInlineText(text),
        })
      );
    } else if (line.match(/^\d+\.\s/)) {
      const text = line.replace(/^\d+\.\s/, "").trim();
      const num = line.match(/^(\d+)\./)?.[1] || "1";
      paragraphs.push(
        new Paragraph({
          spacing: { before: 40, after: 40 },
          indent: { left: 720 },
          children: [
            new TextRun({
              text: `${num}. `,
              bold: true,
              font: "Calibri",
              size: 22,
              color: "4472C4",
            }),
            ...formatInlineText(text),
          ],
        })
      );
    } else if (line.match(/^>\s/)) {
      const text = line.replace(/^>\s?/, "").trim();
      paragraphs.push(
        new Paragraph({
          spacing: { before: 100, after: 100 },
          indent: { left: 480, right: 480 },
          border: {
            left: { style: BorderStyle.SINGLE, size: 8, color: "4472C4" },
          },
          shading: { type: ShadingType.SOLID, color: "F0F4FA" },
          children: [
            new TextRun({
              text,
              italics: true,
              color: "4A5568",
              font: "Calibri",
              size: 22,
            }),
          ],
        })
      );
    } else if (line.match(/^---$/) || line.match(/^\*\*\*$/)) {
      paragraphs.push(
        new Paragraph({
          spacing: { before: 240, after: 240 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "D0D5DD" },
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
    i++;
  }

  return paragraphs;
}

function isTableStart(lines: string[], index: number): boolean {
  if (index + 1 >= lines.length) return false;
  const line = lines[index];
  const nextLine = lines[index + 1];
  return (
    line.includes("|") &&
    nextLine !== undefined &&
    /^\|[\s:|-]+\|$/.test(nextLine.trim())
  );
}

function parseTable(lines: string[], startIndex: number): { table: Table | null; endIndex: number } {
  const tableLines: string[] = [];
  let i = startIndex;

  while (i < lines.length && lines[i].includes("|")) {
    tableLines.push(lines[i]);
    i++;
  }

  if (tableLines.length < 3) return { table: null, endIndex: i };

  const headerCells = tableLines[0]
    .split("|")
    .filter((c) => c.trim() !== "")
    .map((c) => c.trim());

  const dataRows = tableLines.slice(2).map((row) =>
    row
      .split("|")
      .filter((c) => c.trim() !== "")
      .map((c) => c.trim())
  );

  const colCount = headerCells.length;

  const headerRow = new TableRow({
    tableHeader: true,
    children: headerCells.map(
      (cell) =>
        new TableCell({
          shading: { type: ShadingType.SOLID, color: "1B2A4A" },
          width: { size: Math.floor(100 / colCount), type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 60, after: 60 },
              children: [
                new TextRun({
                  text: cell,
                  bold: true,
                  font: "Calibri",
                  size: 20,
                  color: "FFFFFF",
                }),
              ],
            }),
          ],
        })
    ),
  });

  const bodyRows = dataRows.map(
    (row, rowIndex) =>
      new TableRow({
        children: Array.from({ length: colCount }, (_, colIndex) => {
          const cellText = row[colIndex] || "";
          return new TableCell({
            shading:
              rowIndex % 2 === 0
                ? { type: ShadingType.SOLID, color: "F8FAFC" }
                : undefined,
            width: { size: Math.floor(100 / colCount), type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                spacing: { before: 40, after: 40 },
                children: formatInlineText(cellText),
              }),
            ],
          });
        }),
      })
  );

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "D0D5DD" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "D0D5DD" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "D0D5DD" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "D0D5DD" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
    },
    rows: [headerRow, ...bodyRows],
  });

  return { table, endIndex: i };
}

function formatInlineText(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|(.+?))/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match[2]) {
      runs.push(new TextRun({ text: match[2], bold: true, italics: true, font: "Calibri", size: 22 }));
    } else if (match[3]) {
      runs.push(new TextRun({ text: match[3], bold: true, font: "Calibri", size: 22, color: "1B2A4A" }));
    } else if (match[4]) {
      runs.push(new TextRun({ text: match[4], italics: true, font: "Calibri", size: 22, color: "4A5568" }));
    } else if (match[5]) {
      runs.push(new TextRun({ text: match[5], font: "Courier New", size: 19, color: "C7254E", shading: { type: ShadingType.SOLID, color: "FFF5F5" } }));
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
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
          paragraph: {
            spacing: { line: 276 },
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
            pageNumbers: {
              start: 1,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 200 },
                border: {
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: "D0D5DD" },
                },
                children: [
                  new TextRun({
                    text: "AI Blueprint Pulse",
                    font: "Calibri",
                    size: 16,
                    color: "4472C4",
                    bold: true,
                  }),
                  new TextRun({
                    text: "  |  ",
                    font: "Calibri",
                    size: 16,
                    color: "D0D5DD",
                  }),
                  new TextRun({
                    text: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Blueprint`,
                    font: "Calibri",
                    size: 16,
                    color: "999999",
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                border: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "D0D5DD" },
                },
                spacing: { before: 200 },
                children: [
                  new TextRun({
                    text: "Confidential  |  Full Resale Rights Included  |  Page ",
                    font: "Calibri",
                    size: 16,
                    color: "999999",
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: "Calibri",
                    size: 16,
                    color: "999999",
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({ spacing: { before: 800 }, children: [] }),

          new Paragraph({
            spacing: { before: 200, after: 80 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "AI BLUEPRINT PULSE",
                bold: true,
                size: 24,
                font: "Calibri",
                color: "4472C4",
                characterSpacing: 200,
              }),
            ],
          }),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: title,
                bold: true,
                size: 52,
                font: "Calibri",
                color: "1B2A4A",
              }),
            ],
          }),

          new Paragraph({
            spacing: { before: 200, after: 60 },
            alignment: AlignmentType.CENTER,
            border: {
              top: { style: BorderStyle.SINGLE, size: 2, color: "4472C4" },
            },
            children: [],
          }),

          new Paragraph({
            spacing: { before: 100, after: 60 },
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
            spacing: { before: 200, after: 60 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Generated ${generatedDate}`,
                size: 20,
                font: "Calibri",
                color: "999999",
              }),
            ],
          }),

          new Paragraph({
            spacing: { before: 60, after: 60 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Powered by 5-Model AI Analysis: ChatGPT + Claude + Gemini + Grok + Perplexity",
                size: 18,
                font: "Calibri",
                color: "718096",
                italics: true,
              }),
            ],
          }),

          new Paragraph({
            spacing: { before: 300, after: 200 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "\u2713 Full Resale Rights Included",
                bold: true,
                size: 22,
                font: "Calibri",
                color: "2E7D32",
              }),
            ],
          }),

          new Paragraph({
            spacing: { before: 600 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 2, color: "1B2A4A" },
            },
            children: [],
          }),

          ...bodyParagraphs,

          new Paragraph({
            spacing: { before: 600, after: 200 },
            border: {
              top: { style: BorderStyle.SINGLE, size: 2, color: "1B2A4A" },
            },
            children: [],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 60 },
            children: [
              new TextRun({
                text: "End of Blueprint",
                size: 22,
                font: "Calibri",
                color: "1B2A4A",
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 60 },
            children: [
              new TextRun({
                text: `Generated by AI Blueprint Pulse on ${generatedDate}`,
                size: 18,
                font: "Calibri",
                color: "999999",
                italics: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60 },
            children: [
              new TextRun({
                text: "This document includes full resale and distribution rights. The purchaser may rebrand, resell, or distribute this content.",
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
