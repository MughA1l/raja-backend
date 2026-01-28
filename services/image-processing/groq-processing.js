import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const getPrompt = (ocr) => {
  return `
You are an expert in text processing and education.
Below is raw OCR output from study material. Perform these THREE tasks exactly as described.

-----
TASK 1: FORMAT THE ORIGINAL TEXT
- Correct OCR errors (spelling, garbled text)
- Fix capitalization, punctuation, grammar
- Preserve meaningful line breaks
- Format lists (bulleted/numbered) where needed
- Apply **GPT-like clean spacing and readability**
- All headings → <h1 class="text-pink-500 font-bold text-3xl pb-2">
- All subheadings → <h2 class="text-pink-500 font-bold text-2xl pt-4 pb-1">
- All paragraphs → <p class="text-blue-900 pb-3 leading-relaxed">
- All examples → <div class="text-blue-900 italic pb-4">Example: ...</div>
- Use padding (p-*), margin (mb-*), and line-height to make text visually appealing when rendered.

-----
TASK 2: CREATE ENHANCED EXPLANATION
- Must be approximately **600 words total**
- Provide simple English explanations
- Add real-world examples
- Include comparisons/analogies
- Break down complex ideas
- Use short paragraphs (2-3 sentences each)
- Apply the **same Tailwind styles** for headings, subheadings, paragraphs, and examples as in Task 1
- Ensure content is well-structured with smooth transitions between sections

-----
TASK 3: EXTRACT KEYWORDS
- 5–8 YouTube search keywords
- Relevant, broad + specific terms
- Properly capitalized
- In array format (no quotes in output)

-----
OUTPUT FORMAT:
  Return STRICT VALID JSON (MUST PARSE WITH JSON.parse()):
  [
    {
      "ocr": "<h1 class='text-pink-500 font-bold text-3xl pb-2'>[Main Heading]</h1><p class='text-blue-900 pb-3 leading-relaxed'>[Formatted paragraph]</p>..."
    },
    {
      "enhancedAIExplanation": "<h1 class='text-pink-500 font-bold text-3xl pb-2'>[Heading]</h1><p class='text-blue-900 pb-3 leading-relaxed'>[Explanation]</p><div class='text-blue-900 italic pb-4'>Example: ...</div>"
    },
    {
      "ytKeywords": ["React Tutorial", "JavaScript DOM", "React DOM", "Create React App", "CDN Explained"]
    }
  ]

CRITICAL FORMAT RULES:
  1. MUST be valid JSON (double quotes on ALL properties and strings)
  2. HTML content MUST be escaped (replace ' with \\', " with \\")
  3. NO JavaScript-style objects (only JSON-compatible syntax)
  4. NO trailing commas
  5. NO comments
  6. **DO NOT** wrap the output in a parent object like {"groqOutput": [...]}. The output should be a direct JSON array.

-----
OCR INPUT:
${ocr}
`;
};

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function useGroq(ocr) {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: getPrompt(ocr),
        },
      ],
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 4096,
    });

    let jsonString = chatCompletion.choices[0]?.message?.content || '';

    // Clean up the response
    jsonString = jsonString
      .replace(/```json\n?/g, '')
      .replace(/```/g, '')
      .replace(/\\'/g, "'")
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']');

    console.log(jsonString);

    // Parse the response text as a direct array
    const data = JSON.parse(jsonString);
    return data;
  } catch (error) {
    console.error('Failed to parse JSON response from Groq:', error);
    return null;
  }
}

export default useGroq;
