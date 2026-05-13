// =============================================
// AI Question Generation — Google Gemini
// =============================================

import { GoogleGenerativeAI, SchemaType, Schema } from '@google/generative-ai';
import type { GeneratedQuestion } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const quizSchema: Schema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      question: {
        type: SchemaType.STRING,
        description: 'The quiz question about IPL cricket',
      },
      options: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: 'Exactly 4 multiple choice options',
      },
      correctAnswer: {
        type: SchemaType.STRING,
        description: 'The correct answer, must be one of the options',
      },
      difficulty: {
        type: SchemaType.STRING,
        description: 'Difficulty level: easy, medium, or hard',
      },
    },
    required: ['question', 'options', 'correctAnswer', 'difficulty'],
  },
};

export async function generateCricketQuestions(
  count: number = 10,
  difficulty: string = 'medium'
): Promise<GeneratedQuestion[]> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: quizSchema,
    },
    systemInstruction:
      'You are a cricket quiz master specializing in the Indian Premier League (IPL). Generate high-quality, accurate multiple-choice questions. Each question must have exactly 4 options with only 1 correct answer. Cover diverse topics: IPL records, match results, player stats, team history, Orange Cap, Purple Cap, iconic moments, venue facts, auction history, and recent seasons.',
  });

  const difficultyGuide =
    difficulty === 'mixed'
      ? 'Generate a mix of easy, medium, and hard questions.'
      : `All questions should be at ${difficulty} difficulty level.`;

  const prompt = `Generate exactly ${count} IPL cricket quiz questions. ${difficultyGuide}

Requirements:
- Questions must be factually accurate
- Each question has exactly 4 options
- The correctAnswer must exactly match one of the options
- Cover different aspects of IPL (history, records, players, teams, venues)
- Avoid repeating similar questions`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const questions: GeneratedQuestion[] = JSON.parse(text);

  return questions;
}
