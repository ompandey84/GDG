// =============================================
// Game Engine — Scoring, Room Codes, Utilities
// =============================================

import type { ScoreResult } from '@/types';

/**
 * Generate a 6-character alphanumeric room code
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I,O,0,1 to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Calculate score based on speed and difficulty (cricket-themed)
 *
 * @param timeTaken - seconds taken to answer
 * @param difficulty - question difficulty
 * @param timeLimit - total seconds allowed
 * @param isCorrect - whether the answer was correct
 */
export function calculateScore(
  timeTaken: number,
  difficulty: string,
  timeLimit: number,
  isCorrect: boolean
): ScoreResult {
  if (!isCorrect) {
    return {
      points: 0,
      label: 'WICKET!',
      emoji: '❌',
      description: 'Wrong answer — bowled out!',
    };
  }

  const basePoints: Record<string, number> = {
    easy: 100,
    medium: 150,
    hard: 200,
  };

  const base = basePoints[difficulty] || 150;
  const speedRatio = Math.max(0, (timeLimit - timeTaken) / timeLimit);
  const speedBonus = Math.floor(speedRatio * 50);
  const totalPoints = base + speedBonus;

  // Cricket-themed labels based on speed
  if (speedRatio > 0.7) {
    return {
      points: totalPoints,
      label: 'SIX!',
      emoji: '💥',
      description: `Lightning fast — ${totalPoints} runs!`,
    };
  } else if (speedRatio > 0.4) {
    return {
      points: totalPoints,
      label: 'FOUR!',
      emoji: '🏏',
      description: `Well timed — ${totalPoints} runs!`,
    };
  } else {
    return {
      points: totalPoints,
      label: 'Single',
      emoji: '🏃',
      description: `Just made it — ${totalPoints} runs!`,
    };
  }
}

/**
 * Generate a random avatar seed for player avatars
 */
export function generateAvatarSeed(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Format time remaining as mm:ss or just seconds
 */
export function formatTime(seconds: number): string {
  if (seconds <= 0) return '0';
  return Math.ceil(seconds).toString();
}

/**
 * Get ordinal suffix for rankings (1st, 2nd, 3rd...)
 */
export function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Static fallback questions in case AI generation fails
 */
export const FALLBACK_QUESTIONS = [
  {
    question: "Who won the first-ever IPL tournament in 2008?",
    options: ["Chennai Super Kings", "Rajasthan Royals", "Mumbai Indians", "Kolkata Knight Riders"],
    correctAnswer: "Rajasthan Royals",
    difficulty: "medium"
  },
  {
    question: "Which player holds the record for most runs in a single IPL season?",
    options: ["Virat Kohli", "Chris Gayle", "David Warner", "Shikhar Dhawan"],
    correctAnswer: "Virat Kohli",
    difficulty: "medium"
  },
  {
    question: "Who has won the most IPL titles?",
    options: ["Chennai Super Kings", "Mumbai Indians", "Kolkata Knight Riders", "Royal Challengers Bangalore"],
    correctAnswer: "Mumbai Indians",
    difficulty: "easy"
  },
  {
    question: "What is the highest individual score in IPL history?",
    options: ["175*", "158*", "128", "117"],
    correctAnswer: "175*",
    difficulty: "hard"
  },
  {
    question: "Which bowler has the most wickets in IPL history?",
    options: ["Lasith Malinga", "Yuzvendra Chahal", "Amit Mishra", "Dwayne Bravo"],
    correctAnswer: "Yuzvendra Chahal",
    difficulty: "medium"
  },
  {
    question: "Who hit the fastest fifty in IPL history?",
    options: ["KL Rahul", "Sunil Narine", "Chris Gayle", "Pat Cummins"],
    correctAnswer: "KL Rahul",
    difficulty: "hard"
  },
  {
    question: "Which team has the most IPL final appearances?",
    options: ["Mumbai Indians", "Chennai Super Kings", "Royal Challengers Bangalore", "Kolkata Knight Riders"],
    correctAnswer: "Chennai Super Kings",
    difficulty: "medium"
  },
  {
    question: "Who won the Orange Cap in IPL 2016?",
    options: ["Virat Kohli", "David Warner", "AB de Villiers", "Rohit Sharma"],
    correctAnswer: "Virat Kohli",
    difficulty: "medium"
  },
  {
    question: "In which year was the IPL not held in India due to elections?",
    options: ["2009", "2014", "2019", "2012"],
    correctAnswer: "2009",
    difficulty: "hard"
  },
  {
    question: "Who scored 973 runs in a single IPL season?",
    options: ["Virat Kohli", "David Warner", "Shikhar Dhawan", "Faf du Plessis"],
    correctAnswer: "Virat Kohli",
    difficulty: "easy"
  },
  {
    question: "Which team won IPL 2016?",
    options: ["Mumbai Indians", "Sunrisers Hyderabad", "Gujarat Lions", "Royal Challengers Bangalore"],
    correctAnswer: "Sunrisers Hyderabad",
    difficulty: "easy"
  },
  {
    question: "Who was the first player to score a century in IPL?",
    options: ["Brendon McCullum", "Adam Gilchrist", "Sachin Tendulkar", "Virender Sehwag"],
    correctAnswer: "Brendon McCullum",
    difficulty: "medium"
  },
  {
    question: "What was Brendon McCullum's score in the first-ever IPL match?",
    options: ["158*", "145", "132", "128"],
    correctAnswer: "158*",
    difficulty: "hard"
  },
  {
    question: "Which city's team is known as 'Super Kings'?",
    options: ["Chennai", "Mumbai", "Delhi", "Bangalore"],
    correctAnswer: "Chennai",
    difficulty: "easy"
  },
  {
    question: "Who captained Mumbai Indians to their first IPL title?",
    options: ["Rohit Sharma", "Sachin Tendulkar", "Ricky Ponting", "Harbhajan Singh"],
    correctAnswer: "Rohit Sharma",
    difficulty: "medium"
  },
  {
    question: "Which IPL team's home ground is Eden Gardens?",
    options: ["Kolkata Knight Riders", "Delhi Capitals", "Rajasthan Royals", "Punjab Kings"],
    correctAnswer: "Kolkata Knight Riders",
    difficulty: "easy"
  },
  {
    question: "Who has hit the most sixes in IPL history?",
    options: ["Chris Gayle", "AB de Villiers", "MS Dhoni", "Rohit Sharma"],
    correctAnswer: "Chris Gayle",
    difficulty: "easy"
  },
  {
    question: "Which player is known as 'Mr. IPL'?",
    options: ["Suresh Raina", "Virat Kohli", "Rohit Sharma", "MS Dhoni"],
    correctAnswer: "Suresh Raina",
    difficulty: "medium"
  },
  {
    question: "How many teams participated in the first IPL season?",
    options: ["8", "10", "6", "12"],
    correctAnswer: "8",
    difficulty: "easy"
  },
  {
    question: "Who won the Purple Cap (most wickets) in IPL 2020?",
    options: ["Kagiso Rabada", "Jasprit Bumrah", "Anrich Nortje", "Trent Boult"],
    correctAnswer: "Kagiso Rabada",
    difficulty: "hard"
  },
  {
    question: "Which franchise was banned from IPL for 2 years?",
    options: ["Chennai Super Kings", "Royal Challengers Bangalore", "Delhi Capitals", "Punjab Kings"],
    correctAnswer: "Chennai Super Kings",
    difficulty: "medium"
  },
  {
    question: "Who holds the record for best bowling figures in a single IPL match?",
    options: ["Alzarri Joseph", "Anil Kumble", "Sohail Tanvir", "Adam Zampa"],
    correctAnswer: "Alzarri Joseph",
    difficulty: "hard"
  },
  {
    question: "Which stadium hosted the first IPL final?",
    options: ["DY Patil Stadium", "Wankhede Stadium", "M. Chinnaswamy Stadium", "Eden Gardens"],
    correctAnswer: "DY Patil Stadium",
    difficulty: "hard"
  },
  {
    question: "Who was the most expensive player in the first IPL auction?",
    options: ["MS Dhoni", "Andrew Symonds", "Sachin Tendulkar", "Virender Sehwag"],
    correctAnswer: "MS Dhoni",
    difficulty: "hard"
  },
  {
    question: "Which player has played for the most IPL teams?",
    options: ["Ravichandran Ashwin", "Aaron Finch", "Ajinkya Rahane", "David Miller"],
    correctAnswer: "Aaron Finch",
    difficulty: "hard"
  },
  {
    question: "What is the official ball color used in IPL matches?",
    options: ["White", "Red", "Pink", "Yellow"],
    correctAnswer: "White",
    difficulty: "easy"
  },
  {
    question: "Which team's jersey is predominantly yellow?",
    options: ["Chennai Super Kings", "Kolkata Knight Riders", "Rajasthan Royals", "Mumbai Indians"],
    correctAnswer: "Chennai Super Kings",
    difficulty: "easy"
  },
  {
    question: "Who was the youngest captain in IPL history?",
    options: ["Steve Smith", "Shreyas Iyer", "Rishabh Pant", "Sanju Samson"],
    correctAnswer: "Steve Smith",
    difficulty: "hard"
  },
  {
    question: "In which year was the IPL held entirely in the UAE?",
    options: ["2020", "2021", "2019", "2018"],
    correctAnswer: "2020",
    difficulty: "medium"
  },
  {
    question: "What does 'IPL' stand for?",
    options: ["Indian Premier League", "Indian Professional League", "International Premier League", "Indian Players League"],
    correctAnswer: "Indian Premier League",
    difficulty: "easy"
  }
];
