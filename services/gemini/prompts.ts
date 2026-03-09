import {CEFRLevel, LessonContext, SavedItem, StoryScenario} from '../../types';
import type {MindMapNode} from './types';

const SENTENCE_TYPES = [
  'question',
  'exclamation',
  'complaint',
  'idiomatic expression',
  'request',
  'suggestion',
  'warning',
  'invitation',
  'apology',
  'negotiation',
];

const LEVEL_SPECS: Record<CEFRLevel, string> = {
  'A1-A2':
    'Sentence Length: 5-8 words. Vocabulary: High frequency. Focus: Basic needs, simple questions.',
  'B1-B2':
    'Sentence Length: 12-18 words. Vocabulary: Idioms, phrasal verbs. Focus: Opinions, experiences, polite requests.',
  'C1-C2':
    'Sentence Length: 15-22+ words. Vocabulary: Nuanced, abstract. Focus: Persuasion, hypothesis, subtle humor.',
};

const REGISTER_MAP: Record<CEFRLevel, string> = {
  'A1-A2': 'casual everyday register (talking to friends, family, shopkeepers)',
  'B1-B2': 'mix of semi-formal and casual registers (coworkers, acquaintances, service staff)',
  'C1-C2': 'varied registers from formal business to witty casual (meetings, debates, banter)',
};

const ENGLISH_LEVEL_GUIDANCE: Record<CEFRLevel, string> = {
  'A1-A2': 'keep it simple but still natural (avoid "I would like to...", prefer "Can I get...")',
  'B1-B2': 'include one idiom or phrasal verb naturally woven in',
  'C1-C2': 'use nuanced language — hedging, understatement, or cultural references',
};

const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const buildEvaluateResponsePrompt = (
  userInput: string,
  lesson: LessonContext,
  direction: 'VN_to_EN' | 'EN_to_VN',
): string => {
  const isVnToEn = direction === 'VN_to_EN';
  const sourceLang = isVnToEn ? 'Vietnamese' : 'English';
  const targetLang = isVnToEn ? 'English' : 'Vietnamese';
  const sourcePhrase = isVnToEn ? lesson.vietnamesePhrase : lesson.englishPhrase;

  return `
Role: You are a strict linguistic expert and CEFR assessor.
Task: Evaluate the User's ${targetLang} translation of a ${sourceLang} source sentence based on a specific Context.
Scoring Rubric (Scale 1-10):
9-10: Native-like, idiomatically perfect for the context. (C2)
7-8: Grammatically correct, fluent, but slightly textbook-like. (B2-C1)
5-6: Grammatically correct but stiff/formal or slight unnatural phrasing. (B1)
3-4: Understandable but with grammatical errors. (A2)
1-2: Incomprehensible or completely wrong meaning. (A1)
Formula: Final Score = 0.4 * Accuracy + 0.4 * Naturalness + 0.2 * Complexity.
Input Context:
Source ${sourceLang}: "${sourcePhrase}"
Situation: "${lesson.situation}"
Target CEFR Level: "${lesson.difficulty}"
User Input to Evaluate (${targetLang}): "${userInput}"
Instructions:
1. Analyze Grammatical Accuracy in ${targetLang}.
2. Analyze Pragmatic Naturalness. Is this how a native speaker sounds in this context?
3. Analyze Vocabulary. Are the words precise?
4. **Identify Specific Improvements**: Find exact substrings in the user's input that are wrong or unnatural. Provide corrections and explanations for each.
5. **Tone Analysis**: Identify the tone of the user's input.
6. **Generate Variations**: Provide 4 distinct versions of the translation in ${targetLang}:
   - Formal
   - Friendly
   - Informal
   - Conversational
7. Provide scores and detailed feedback.
`;
};

export const buildGenerateNextLessonPrompt = (
  previousTitles: string[],
  userLevel: CEFRLevel,
  userTopics: string[],
): {prompt: string; chosenTopic: string} => {
  const recentContext = previousTitles.slice(-20).join(' | ');
  const targetSpec = LEVEL_SPECS[userLevel] || LEVEL_SPECS['A1-A2'];
  const chosenTopic = pickRandom(userTopics) || 'General';
  const chosenType = pickRandom(SENTENCE_TYPES);
  const targetRegister = REGISTER_MAP[userLevel] || REGISTER_MAP['A1-A2'];
  const levelGuidance = ENGLISH_LEVEL_GUIDANCE[userLevel] || ENGLISH_LEVEL_GUIDANCE['A1-A2'];

  const prompt = `
You are a creative scenario designer for a Vietnamese English learner. Your goal is to produce ONE hyper-specific, culturally grounded micro-scenario that feels like a real moment from daily life — not a textbook exercise.

=== STUDENT PROFILE ===
- CEFR Level: ${userLevel}
- Language Specs: ${targetSpec}
- Topic Domain: ${chosenTopic}
- Target Register: ${targetRegister}
- Required Sentence Type: ${chosenType}

=== SCENARIO DESIGN RULES ===
1. **Micro-moment, not generic scene**: Pick a hyper-specific moment (e.g., not "at a restaurant" but "asking the waiter why your phở has no herbs"). The situation must include WHO is speaking, WHERE exactly, and WHAT just happened.
2. **Vietnamese phrase rules**:
   - Must sound like real spoken Vietnamese, not written/formal Vietnamese.
   - Use natural particles and fillers: nhỉ, à, ạ, nha, với, hộ mình, cái, đi, thôi, chứ, mà, etc.
   - Match the emotional tone of the situation (frustrated → stronger particles, polite → softer particles).
   - Avoid dictionary-style translations. Write how a Vietnamese person would actually say it out loud.
3. **English phrase rules**:
   - Must match the ${targetRegister}.
   - Use contractions, phrasal verbs, and natural collocations — not textbook grammar.
   - For ${userLevel}: ${levelGuidance}.
4. **Sentence type**: Generate a **${chosenType}**. Do NOT fall back to a plain declarative statement.
5. **STRICT UNIQUENESS**: These scenarios were already generated — you MUST create something completely different in sub-topic, setting, characters, and sentence structure: [${recentContext}]

=== HINT DESIGN RULES ===
- level1 (Meaning): Describe the communicative intent in Vietnamese (e.g., "Bạn muốn hỏi lý do tại sao..."). Do NOT reveal any English words.
- level2 (Structure): Give the sentence skeleton with blanks (e.g., "Why didn't you ___ the ___?"). Reveal structure, not vocabulary.
- level3 (Key vocabulary): List 2-3 key English words/phrases the student needs, with brief Vietnamese meanings (e.g., "herbs = rau thơm, complain = phàn nàn").
`;

  return {prompt, chosenTopic};
};

export const buildToneTranslationPrompt = (text: string): string => `
You are a bilingual English-Vietnamese language expert specializing in tone, register, and pragmatics.

=== TASK ===
Translate the input text into 4 English tonal variations. If the input is already English, rephrase it into 4 distinct variations.

=== INPUT ===
"${text}"

=== TONE DEFINITIONS ===
1. **Formal** — Business/professional register. Use complete sentences, no contractions, appropriate hedging (e.g., "I would appreciate it if...", "Could you kindly..."). Suitable for emails, meetings, official communication.
2. **Friendly** — Warm and polite but approachable. Use light contractions, positive framing, softeners (e.g., "Hey, would you mind...", "That sounds great!"). Suitable for coworkers, acquaintances, friendly strangers.
3. **Informal** — Casual/slang register. Use heavy contractions, phrasal verbs, filler words, slang (e.g., "gonna", "kinda", "no worries", "my bad"). Suitable for close friends, texting, social media.
4. **Conversational** — Neutral everyday register. Natural but not overly casual or formal (e.g., "Can you help me with...?", "I think we should..."). Suitable for daily interactions with anyone.

=== RULES ===
- Each variation MUST be meaningfully different in word choice, sentence structure, and tone — not just minor word swaps.
- Preserve the original meaning and intent accurately across all 4 tones.
- Use natural collocations and idiomatic phrasing for each register — avoid translationese.
- If the input contains Vietnamese cultural context or idioms, adapt them to culturally equivalent English expressions rather than literal translation.
`;

export const buildStoryScenarioPrompt = (
  level: CEFRLevel,
  topic: string,
  previousTitles: string[],
  customContext?: string,
): string => {
  const recentContext = previousTitles.slice(-20).join(' | ');

  const contextPrompt = customContext
    ? `Context/Scenario: ${customContext}`
    : `Topic: ${topic}.\n    6. **STRICT UNIQUENESS**: You MUST NOT generate any scenario that is similar in theme, title, or situation to these previously generated scenarios: [${recentContext}]. Think outside the box and create a completely new sub-topic or situation.`;

  return `
Create a conversation starter scenario for an English learner.
Level: ${level}.
${contextPrompt}
Instructions:
1. Define a specific, highly unique situation where the User interacts with an Agent based on the context/topic above.
2. Give the Agent a name.
3. Write the FIRST line (opening line) that the Agent says to the User. It should be a greeting or a question to start the conversation.
4. Provide the Vietnamese translation for that opening line.
5. Provide 3 progressive hints for the USER on how to reply to this opening line:
   - Level 1: Meaning/Intent hint (e.g., "You should greet back and ask about...").
   - Level 2: Structure hint (e.g., "Start with 'Hi', then use Present Perfect...").
   - Level 3: Vocabulary hint (e.g., "Use the word '...').
Output JSON.
`;
};

export const buildStoryTurnPrompt = (
  scenario: StoryScenario,
  agentLastMessage: string,
  userReply: string,
): string => `
Role: Conversational English Coach.
Context:
- Scene: ${scenario.situation}
- Agent Name: ${scenario.agentName}
- Agent just said: "${agentLastMessage}"
- User replied: "${userReply}"
- Target Level: ${scenario.difficulty}
Task:
1. Evaluate the user's reply for logic (does it make sense?), grammar, and appropriate tone for the situation.
2. Assign scores (1-10).
3. **Identify Specific Improvements**: Find exact substrings in the user's input that are wrong or unnatural. Provide corrections and explanations for each.
4. Generate the Next Logical Reply for the Agent to continue the conversation naturally.
Return JSON.
`;

export const buildQuizEvaluationPrompt = (savedItem: SavedItem, userAnswer: string): string => `
Role: Vocabulary and Grammar Quiz Master.
Context:
The user is being tested on a saved item from their learning history.
- Original phrase/context: "${savedItem.original}"
- Correct target phrase/usage: "${savedItem.correction}"
- Item Type: ${savedItem.type}
- Full Context: "${savedItem.context}"

The user's answer to the quiz question is: "${userAnswer}"

Task:
1. Evaluate if the user's answer correctly demonstrates understanding of the target phrase/usage ("${savedItem.correction}").
2. Assign scores (1-10). If they nailed it, give high scores.
3. Provide constructive feedback.
4. **Identify Specific Improvements**: Find exact substrings in the user's input that are wrong or unnatural. Provide corrections and explanations for each.
5. Generate the Next Logical Reply (nextAgentReply) which should be a short encouraging message or a follow-up question.
Return JSON.
`;

export const buildVideoPrompt = (situation: string, phrase: string): string => `
Cinematic, realistic 4k video.
Context: ${situation}.
Action: A person clearly and naturally speaking the phrase: "${phrase}".
Style: Educational, clear facial expressions, high quality, professional lighting.
`;

export const buildDictionaryPrompt = (phrase: string, context: string): string => `
You are an expert English teacher. The user wants to save the phrase/word "${phrase}" from the following context:
"${context}"

Please provide:
1. The part of speech of this phrase/word in this context. You MUST choose EXACTLY ONE from this list: "Noun (Danh từ)", "Verb (Động từ)", "Adjective (Tính từ)", "Adverb (Trạng từ)", "Phrasal Verb (Cụm động từ)", "Idiom (Thành ngữ)", "Expression (Cụm từ)", "Other (Khác)".
2. A clear, concise explanation of what this phrase means in this specific context (in Vietnamese).
3. 3 practical examples of how to use this phrase in other common situations. Each example must have an English sentence and its Vietnamese translation.

Output strictly in this JSON format:
{
    "partOfSpeech": "One of the exact options above",
    "explanation": "Giải thích ý nghĩa...",
    "examples": [
        { "en": "English example 1", "vn": "Vietnamese translation 1" },
        { "en": "English example 2", "vn": "Vietnamese translation 2" },
        { "en": "English example 3", "vn": "Vietnamese translation 3" }
    ]
}
`;

export const buildWordAnalysisPrompt = (word: string, context?: string): string => `
You are an expert linguist and etymologist. Analyze the English word "${word}".
${context ? `Context: "${context}"` : ''}

Provide a comprehensive morphological breakdown and contextual analysis.

Instructions:
1. Provide the phonetic transcription (IPA).
2. Provide the Vietnamese translation.
3. Break down the word into its morphological components (prefix, root, suffix). If a component doesn't exist, omit it.
   - Provide the morpheme, its meaning, and for the root, its origin (e.g., Latin, Greek).
   - Create an equation (e.g., "sym- + path + -y = sympathy").
4. Provide two example sentences (one positive context, one negative context) with Vietnamese translations.
5. List 3 common collocations (words that frequently go with this word).
6. Provide its derivatives (word family) for noun, verb, adjective, and adverb forms if they exist.
7. List 3 synonyms and 3 antonyms.

Output strictly in JSON format matching the requested structure.
`;

export const buildMindMapRootPrompt = (topic: string, level: CEFRLevel): string => `
Create an initial vocabulary mind map for the topic "${topic}" at the ${level} level.
The root node should be the topic itself.
It should have exactly 2 highly concrete, common, and direct vocabulary words as children.
For example, if the topic is "Family", the children MUST be concrete words like "Mother" and "Father", NOT abstract concepts like "Family dynamics" or "Extended family".
Keep the words simple, direct, and highly relevant to everyday usage.

For the root node AND each child node, provide:
1. The English word (label)
2. The Vietnamese translation (translation)
3. The part of speech (partOfSpeech) - e.g., "Noun", "Verb", "Adjective"
4. A short English sentence explaining its context or usage (context)

Output strictly in JSON format matching the requested structure.
`;

export const buildMindMapExpandPrompt = (
  nodeLabel: string,
  rootTopic: string,
  level: CEFRLevel,
): string => {
  const relationTypes = [
    'a more specific subtype (hyponym)',
    'a closely associated action or verb',
    'a descriptive quality or adjective',
    'a real-world object or tool associated with it',
    'a person or role related to it',
  ];
  const relation1 = pickRandom(relationTypes);
  const relation2 = pickRandom(relationTypes.filter((r) => r !== relation1));

  return `
You are a vocabulary network architect building a mind map for a ${level} English learner.

=== CONTEXT ===
- Root topic: "${rootTopic}"
- Node being expanded: "${nodeLabel}"
- Target: Generate exactly 2 new vocabulary branches from "${nodeLabel}"

=== WORD SELECTION RULES ===
1. **Concrete over abstract**: Choose tangible, visualizable words — not categories or concepts.
   - Good: "Mother" → "Lullaby", "Apron"
   - Bad: "Mother" → "Maternal instinct", "Family dynamics"
2. **Relationship variety**: The 2 words should represent DIFFERENT types of relationships to "${nodeLabel}":
   - Word 1: ${relation1}
   - Word 2: ${relation2}
3. **1-2 words maximum** per node. No phrases, no explanations as labels.
4. **Level-appropriate**: For ${level}, choose words that ${level === 'A1-A2' ? 'are high-frequency and used in daily life' : level === 'B1-B2' ? 'include useful collocations or phrasal connections' : 'are nuanced, less common, or have interesting etymology'}.
5. **Stay in domain**: Both words must connect back to "${rootTopic}" through "${nodeLabel}" — not random associations.

=== OUTPUT PER NODE ===
1. **label**: The English word (1-2 words)
2. **translation**: Vietnamese translation
3. **partOfSpeech**: "Noun", "Verb", "Adjective", "Adverb", etc.
4. **context**: A natural example sentence using this word in the context of "${rootTopic}" (max 15 words)

Output strictly in JSON format as an array of 2 objects.
`;
};

export const buildCustomNodePrompt = (
  customWord: string,
  mindMapData: MindMapNode,
): string => {
  const nodesList: {id: string; label: string}[] = [];
  const traverse = (node: MindMapNode) => {
    nodesList.push({id: node.id, label: node.label});
    if (node.children) {
      node.children.forEach(traverse);
    }
  };
  traverse(mindMapData);

  return `
The user wants to add the word "${customWord}" to their current vocabulary mind map.
Here are the existing nodes in the mind map:
${JSON.stringify(nodesList)}

Determine if "${customWord}" is related to any of these existing nodes.
If it is related, find the BEST parent node for it and return status "connected" with the parentNodeId.
Also provide:
1. The Vietnamese translation (translation)
2. The part of speech (partOfSpeech) - e.g., "Noun", "Verb", "Adjective"
3. A short English sentence explaining its context or usage (context)

If it is NOT related to ANY of the nodes (including the root), return status "unrelated" and a brief message explaining why.

Output strictly in JSON format.
`;
};

export const buildExercisesPrompt = (vocabList: {word: string; context: string}[]): string => `
Create ${vocabList.length} interactive exercises based on this vocabulary list:
${JSON.stringify(vocabList, null, 2)}

For each word, create either a 'fill-in-the-blank' or 'sentence-construction' exercise.
- For 'fill-in-the-blank', provide a sentence with the target word missing (use "___"), 4 options (including the correct one), and the correct answer.
- For 'sentence-construction', provide a prompt or a scenario where the user needs to use the target word, and provide a sample correct answer.

Include a helpful hint and a brief explanation of why the answer is correct or how the word is used.
`;
