import { Wod } from '@/types/wod';

const mk = (
  id: string,
  name: string,
  scheme: Wod['scheme'],
  timeCapSeconds: number,
  rounds: number,
  movements: [string, number][],
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
});

// Famous bodyweight-only benchmark workouts
export const PRESET_WODS: Wod[] = [
  mk('p-cindy', 'Cindy', 'amrap', 20 * 60, 1, [
    ['Pull-Ups', 5],
    ['Push-Ups', 10],
    ['Air Squats', 15],
  ]),
  mk('p-mary', 'Mary', 'amrap', 20 * 60, 1, [
    ['Handstand Push-Ups', 5],
    ['Pistol Squats', 10],
    ['Pull-Ups', 15],
  ]),
  mk('p-chelsea', 'Chelsea', 'emom', 30 * 60, 30, [
    ['Pull-Ups', 5],
    ['Push-Ups', 10],
    ['Air Squats', 15],
  ], 60),
  mk('p-murph', 'Murph (Partitioned)', 'fortime', 60 * 60, 1, [
    ['Pull-Ups', 100],
    ['Push-Ups', 200],
    ['Air Squats', 300],
  ]),
  mk('p-300', 'The 300', 'fortime', 45 * 60, 1, [
    ['Pull-Ups', 25],
    ['Push-Ups', 50],
    ['Jumping Jacks', 50],
    ['Floor Wipers', 50],
    ['Air Squats', 50],
  ]),
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
  ]),
  mk('p-burpees100', '100 Burpees', 'fortime', 30 * 60, 1, [
    ['Burpees', 100],
  ]),
  mk('p-tabata', 'Tabata Something Else', 'rounds', 32 * 60, 4, [
    ['Pull-Ups', 10],
    ['Push-Ups', 10],
    ['Sit-Ups', 10],
    ['Air Squats', 10],
  ], undefined, 10),
  mk('p-barbara', 'Barbara', 'rounds', 60 * 60, 5, [
    ['Pull-Ups', 20],
    ['Push-Ups', 30],
    ['Sit-Ups', 40],
    ['Air Squats', 50],
  ], undefined, 120),
  mk('p-emom10', 'EMOM 10 Burpees', 'emom', 10 * 60, 10, [
    ['Burpees', 10],
  ], 60),
  mk('p-squats200', '200 Air Squats', 'fortime', 30 * 60, 1, [
    ['Air Squats', 200],
  ]),
  mk('p-angie', 'Angie', 'fortime', 60 * 60, 1, [
    ['Pull-Ups', 100],
    ['Push-Ups', 100],
    ['Sit-Ups', 100],
    ['Air Squats', 100],
  ]),
  mk('p-muscleups', '30 Muscle-Ups', 'fortime', 45 * 60, 1, [
    ['Muscle-Ups', 30],
  ]),
];
