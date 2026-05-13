// =============================================
// API Route — Generate AI Questions
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { generateCricketQuestions } from '@/lib/ai';
import { FALLBACK_QUESTIONS } from '@/lib/gameEngine';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { roomId, count = 10, difficulty = 'medium' } = await request.json();

    if (!roomId) {
      return NextResponse.json({ error: 'roomId is required' }, { status: 400 });
    }

    let questions;

    try {
      // Try AI generation first
      questions = await generateCricketQuestions(count, difficulty);
    } catch (aiError) {
      console.error('AI generation failed, using fallback questions:', aiError);
      // Shuffle and take `count` fallback questions
      const shuffled = [...FALLBACK_QUESTIONS].sort(() => Math.random() - 0.5);
      questions = shuffled.slice(0, count);
    }

    // Insert questions into database
    const questionRows = questions.map((q, index) => ({
      room_id: roomId,
      question_text: q.question,
      options: q.options,
      correct_answer: q.correctAnswer,
      difficulty: q.difficulty || difficulty,
      question_order: index,
    }));

    const { data, error } = await supabaseAdmin
      .from('questions')
      .insert(questionRows)
      .select('id');

    if (error) {
      console.error('Failed to insert questions:', error);
      return NextResponse.json({ error: 'Failed to save questions' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      questionIds: data.map((q) => q.id),
      count: data.length,
      source: questions === FALLBACK_QUESTIONS ? 'fallback' : 'ai',
    });
  } catch (error) {
    console.error('Question generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
