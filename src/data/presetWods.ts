import { Wod, WodBenchmark } from '@/types/wod';

const bm = (beginner: string, intermediate: string, advanced: string, elite: string): WodBenchmark[] => [
  { level: 'Beginner', result: beginner },
  { level: 'Intermediate', result: intermediate },
  { level: 'Advanced', result: advanced },
  { level: 'Elite', result: elite },
];

const mk = (
  id: string,
  name: string,
  scheme: Wod['scheme'],
  timeCapSeconds: number,
  rounds: number,
  movements: [string, number][],
  benchmarks?: WodBenchmark[],
  roundSeconds?: number,
  exerciseRestSeconds?: number
): Wod => ({
  id,
  name,
  scheme,
  timeCapSeconds,
  roundSeconds,
  exerciseRestSeconds,
  rounds,
  movements: movements.map(([mName, reps], i) => ({ id: `${id}-m${i}`, name: mName, reps })),
  benchmarks,
});

// Famous bodyweight-only benchmark workouts
export const PRESET_WODS: Wod[] = [
  mk('p-cindy', 'Cindy', 'amrap', 20 * 60, 1, [
    ['Pull-Ups', 5],
    ['Pushups', 10],
    ['Air Squats', 15],
  ], bm('12-14 rounds', '15-18 rounds', '19-22 rounds', '23+ rounds')),
  mk('p-mary', 'Mary', 'amrap', 20 * 60, 1, [
    ['Handstand Pushups', 5],
    ['Pistol Squats', 10],
    ['Pull-Ups', 15],
  ], bm('7-9 rounds', '10-13 rounds', '14-16 rounds', '17+ rounds')),
  mk('p-chelsea', 'Chelsea', 'emom', 30 * 60, 30, [
    ['Pull-Ups', 5],
    ['Pushups', 10],
    ['Air Squats', 15],
  ], bm('20+ rounds completed', '25+ rounds completed', 'full 30 min (Rx)', 'full 30 min unbroken'), 60),
  mk('p-murph', 'Murph (Partitioned)', 'fortime', 60 * 60, 1, [
    ['Pull-Ups', 100],
    ['Pushups', 200],
    ['Air Squats', 300],
  ], bm('55-70 min', '45-55 min', '35-45 min', '<35 min')),
  mk('p-300', 'The 300', 'fortime', 45 * 60, 1, [
    ['Pull-Ups', 25],
    ['Pushups', 50],
    ['Jumping Jacks', 50],
    ['Floor Wipers', 50],
    ['Air Squats', 50],
  ], bm('30-40 min', '23-30 min', '18-23 min', '<18 min')),
  mk('p-annie', 'Annie', 'fortime', 30 * 60, 1, [
    ['Double-Unders', 50],
    ['Sit-Ups', 50],
    ['Double-Unders', 40],
    ['Sit-Ups', 40],
    ['Double-Unders', 30],
    ['Sit-Ups', 30],
    ['Double-Unders', 20],
    ['Sit-Ups', 20],
    ['Double-Unders', 10],
    ['Sit-Ups', 10],
  ], bm('12-16 min', '8-12 min', '6-8 min', '<5 min')),
  mk('p-burpees100', '100 Burpees', 'fortime', 30 * 60, 1, [
    ['Burpees', 100],
  ], bm('9-12 min', '7-9 min', '5-7 min', '<5 min')),
  mk('p-tabata', 'Tabata Something Else', 'rounds', 32 * 60, 4, [
    ['Pull-Ups', 10],
    ['Pushups', 10],
    ['Sit-Ups', 10],
    ['Air Squats', 10],
  ], undefined, undefined, 10),
  mk('p-barbara', 'Barbara', 'rounds', 60 * 60, 5, [
    ['Pull-Ups', 20],
    ['Pushups', 30],
    ['Sit-Ups', 40],
    ['Air Squats', 50],
  ], bm('28-34 min total', '24-28 min total', '21-24 min total', '<21 min total'), undefined, 120),
  mk('p-emom10', 'EMOM 10 Burpees', 'emom', 10 * 60, 10, [
    ['Burpees', 10],
  ], undefined, 60),
  mk('p-squats200', '200 Air Squats', 'fortime', 30 * 60, 1, [
    ['Air Squats', 200],
  ], bm('9-12 min', '7-9 min', '5-7 min', '<4 min')),
  mk('p-angie', 'Angie', 'fortime', 60 * 60, 1, [
    ['Pull-Ups', 100],
    ['Pushups', 100],
    ['Sit-Ups', 100],
    ['Air Squats', 100],
  ], bm('30-40 min', '22-30 min', '16-22 min', '<15 min')),
  mk('p-muscleups', '30 Muscle-Ups', 'fortime', 45 * 60, 1, [
    ['Muscle-Ups', 30],
  ], bm('15-20 min', '10-15 min', '6-10 min', '<6 min')),
  mk('p-candy', 'Candy', 'rounds', 45 * 60, 5, [
    ['Pull-Ups', 20],
    ['Push-Ups', 40],
    ['Air Squats', 60],
  ], bm('36-41 min', '24-32 min', '18-21 min', '<16 min'), undefined, 0),
  // --- Calisthenics WODs ---
  mk('p-dips100', '100 Dips', 'fortime', 30 * 60, 1, [
    ['Dips', 100],
  ]),
  mk('p-hlr50', '50 Hanging Leg Raises', 'fortime', 20 * 60, 1, [
    ['Hanging Leg Raises', 50],
  ]),
  mk('p-core-crusher', 'Core Crusher', 'amrap', 15 * 60, 1, [
    ['Hanging Leg Raises', 10],
    ['Sit-Ups', 15],
    ['Plank Shoulder Taps', 20],
  ]),
  mk('p-gymnastique', 'Gymnastique', 'rounds', 40 * 60, 5, [
    ['Muscle-Ups', 3],
    ['Dips', 15],
    ['Hanging Leg Raises', 15],
    ['Pistol Squats', 10],
  ], undefined, undefined, 90),
  mk('p-handstand', 'Handstand Heaven', 'amrap', 12 * 60, 1, [
    ['Handstand Pushups', 5],
    ['Handstand Hold (s)', 30],
    ['Pushups', 15],
  ]),
  mk('p-upside-down', 'Upside Down', 'fortime', 25 * 60, 1, [
    ['Upside Down Deadlifts', 20],
    ['Wall Handstand Pushups', 20],
    ['Hanging Leg Raises', 20],
    ['Air Squats', 40],
  ]),
  mk('p-bar-dips-emom', 'EMOM Bar Dips', 'emom', 12 * 60, 12, [
    ['Bar Dips', 12],
  ], undefined, 60),
  mk('p-street-workout', 'Street Workout', 'amrap', 16 * 60, 1, [
    ['Pull-Ups', 8],
    ['Dips', 12],
    ['Jump Squats', 16],
    ['Hanging Leg Raises', 10],
  ]),
  mk('p-l-sit-ladder', 'L-Sit Ladder', 'rounds', 30 * 60, 5, [
    ['L-Sit Hold (s)', 10],
    ['Dips', 10],
    ['Hollow Body Hold (s)', 20],
  ], undefined, undefined, 60),
  mk('p-pullup-dip-grinder', 'Pull-Up & Dip Grinder', 'fortime', 35 * 60, 1, [
    ['Pull-Ups', 50],
    ['Dips', 75],
    ['Hanging Leg Raises', 50],
  ]),
];

