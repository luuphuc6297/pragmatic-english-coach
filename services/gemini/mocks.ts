import {AssessmentResult, TranslationResult, StoryScenario, LessonContext} from '../../types';

export const MOCK_ASSESSMENT_RESULT: AssessmentResult = {
  score: 7.8,
  accuracyScore: 8,
  naturalnessScore: 7,
  complexityScore: 8,
  feedback:
    '[DEMO] This is a simulated assessment because the API quota is exhausted. Your sentence structure is solid but could be more idiomatic.',
  correction: null,
  betterAlternative: "I'd appreciate it if you could update me by EOD.",
  analysis:
    "You used the conditional tense correctly. To sound more native in a business context, 'EOD' is common for 'end of day'.",
  grammarAnalysis: 'Grammar Point: Subject-verb agreement is correct. Good use of polite markers.',
  vocabularyAnalysis:
    "Vocabulary Point: 'Update' is a good choice, but consider specific timeframes.",
  improvements: [
    {
      original: 'update me',
      correction: 'update me by EOD',
      type: 'vocabulary',
      explanation: 'Adding a timeframe makes it more actionable.',
    },
  ],
  userTone: 'Polite/Formal',
  alternativeTones: {
    formal: 'I would be grateful for an update at your earliest convenience.',
    friendly: "Can you let me know how it's going later?",
    informal: "Lmk what's up later.",
    conversational: 'Could you give me an update by the end of the day?',
  },
  nextAgentReply: 'Certainly! I will have the report ready for you by 5 PM.',
  nextAgentReplyVietnamese:
    'Chắc chắn rồi! Tôi sẽ chuẩn bị xong báo cáo cho bạn trước 5 giờ chiều.',
};

export const MOCK_TRANSLATION_RESULT: TranslationResult = {
  original: 'Simulated Input',
  tones: {
    formal: {
      text: 'I apologize, but I am currently unavailable to assist.',
      quote: 'Tôi xin lỗi, nhưng hiện tại tôi không thể hỗ trợ.'
    },
    friendly: {
      text: "Sorry! I can't help right now, maybe later?",
      quote: 'Xin lỗi nha! Giờ mình không giúp được, để sau nhé?'
    },
    informal: {
      text: "Can't do it rn, sorry.",
      quote: 'Giờ không làm được đâu, xin lỗi.'
    },
    conversational: {
      text: "I'm afraid I'm busy at the moment.",
      quote: 'E là tôi đang bận lúc này.'
    },
  },
};

export const MOCK_STORY_SCENARIO: StoryScenario = {
  id: 'mock_story_1',
  topic: 'Travel',
  situation:
    '[DEMO MODE] You are checking into a boutique hotel in Paris. The receptionist cannot find your reservation.',
  agentName: 'Sophie',
  openingLine:
    "Bonjour! Welcome to Le Grand Hotel. I am looking for your booking, but I don't see it in the system...",
  openingLineVietnamese:
    'Xin chào! Chào mừng đến với Le Grand Hotel. Tôi đang tìm đơn đặt phòng của bạn, nhưng không thấy trên hệ thống...',
  difficulty: 'B1-B2',
  hints: {
    level1: 'Express concern and show your confirmation.',
    level2: 'I booked it via...',
    level3: 'confirmation / email',
  },
};

export const MOCK_LESSON_CONTEXT: LessonContext = {
  id: 'mock_lesson_1',
  topic: 'Business',
  title: '[DEMO] Negotiating a Deadline',
  situation: 'You need to ask your manager for two more days to finish the report.',
  vietnamesePhrase: 'Sếp ơi, em có thể xin thêm 2 ngày để hoàn thiện báo cáo này không?',
  englishPhrase: 'Boss, could I possibly have two more days to finalize this report?',
  difficulty: 'B1-B2',
  hints: {
    level1: 'Use a polite request structure.',
    level2: 'Could I possibly have...',
    level3: 'extension / finalize',
  },
};
