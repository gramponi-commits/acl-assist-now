import { TrainingScenario } from '@/types/training';

export const scenarios: TrainingScenario[] = [
  {
    id: 'basic-vf',
    name: 'Basic VF/pVT',
    nameIt: 'FV/TVp Base',
    description: 'A straightforward ventricular fibrillation case. Patient converts to normal rhythm after 2 shocks.',
    descriptionIt: 'Un caso semplice di fibrillazione ventricolare. Il paziente converte a ritmo normale dopo 2 shock.',
    difficulty: 'beginner',
    initialRhythm: 'vf_pvt',
    estimatedDuration: 300,
    learningObjectives: [
      'Recognize VF/pVT rhythm',
      'Deliver timely defibrillation',
      'Administer epinephrine after 2nd shock',
      'Maintain CPR between interventions'
    ],
    learningObjectivesIt: [
      'Riconoscere il ritmo FV/TVp',
      'Erogare defibrillazione tempestiva',
      'Somministrare adrenalina dopo il 2° shock',
      'Mantenere RCP tra gli interventi'
    ],
    events: [
      {
        triggerAfterShocks: 2,
        rosc: true,
        description: 'Patient achieves ROSC after 2nd shock'
      }
    ],
    expectedActions: [
      { type: 'rhythmCheck', windowStart: 115, windowEnd: 130, required: true, hint: 'Time for rhythm check' },
      { type: 'shock', windowStart: 120, windowEnd: 140, required: true, hint: 'Shockable rhythm - deliver shock' },
      { type: 'rhythmCheck', windowStart: 235, windowEnd: 250, required: true, hint: 'Time for 2nd rhythm check' },
      { type: 'shock', windowStart: 240, windowEnd: 260, required: true, hint: 'Still shockable - deliver shock' },
      { type: 'epinephrine', windowStart: 240, windowEnd: 300, required: true, hint: 'Epinephrine due after 2nd shock' },
      { type: 'rosc', windowStart: 245, windowEnd: 280, required: true, hint: 'Check for pulse - ROSC achieved!' }
    ]
  },
  {
    id: 'refractory-vf',
    name: 'Refractory VF',
    nameIt: 'FV Refrattaria',
    description: 'Ventricular fibrillation that requires multiple shocks and antiarrhythmic medication.',
    descriptionIt: 'Fibrillazione ventricolare che richiede shock multipli e farmaci antiaritmici.',
    difficulty: 'intermediate',
    initialRhythm: 'vf_pvt',
    estimatedDuration: 600,
    learningObjectives: [
      'Manage refractory VF',
      'Administer amiodarone after 3rd shock',
      'Maintain proper medication timing',
      'Continue systematic approach'
    ],
    learningObjectivesIt: [
      'Gestire FV refrattaria',
      'Somministrare amiodarone dopo il 3° shock',
      'Mantenere tempistiche corrette per i farmaci',
      'Continuare approccio sistematico'
    ],
    events: [
      {
        triggerAfterShocks: 4,
        rosc: true,
        description: 'Patient achieves ROSC after 4th shock and amiodarone'
      }
    ],
    expectedActions: [
      { type: 'rhythmCheck', windowStart: 115, windowEnd: 130, required: true },
      { type: 'shock', windowStart: 120, windowEnd: 140, required: true },
      { type: 'rhythmCheck', windowStart: 235, windowEnd: 250, required: true },
      { type: 'shock', windowStart: 240, windowEnd: 260, required: true },
      { type: 'epinephrine', windowStart: 240, windowEnd: 300, required: true },
      { type: 'rhythmCheck', windowStart: 355, windowEnd: 370, required: true },
      { type: 'shock', windowStart: 360, windowEnd: 380, required: true },
      { type: 'amiodarone', windowStart: 360, windowEnd: 420, required: true, hint: 'Give amiodarone 300mg after 3rd shock' },
      { type: 'rhythmCheck', windowStart: 475, windowEnd: 490, required: true },
      { type: 'shock', windowStart: 480, windowEnd: 500, required: true },
      { type: 'rosc', windowStart: 485, windowEnd: 520, required: true }
    ]
  },
  {
    id: 'asystole-basic',
    name: 'Asystole',
    nameIt: 'Asistolia',
    description: 'Non-shockable rhythm requiring immediate epinephrine and CPR.',
    descriptionIt: 'Ritmo non defibrillabile che richiede adrenalina immediata e RCP.',
    difficulty: 'beginner',
    initialRhythm: 'asystole',
    estimatedDuration: 480,
    learningObjectives: [
      'Recognize asystole',
      'Administer epinephrine immediately',
      'Continue CPR without shocking',
      'Check rhythm every 2 minutes'
    ],
    learningObjectivesIt: [
      'Riconoscere asistolia',
      'Somministrare adrenalina immediatamente',
      'Continuare RCP senza shock',
      'Controllare ritmo ogni 2 minuti'
    ],
    events: [
      {
        triggerTime: 360,
        newRhythm: 'vf_pvt',
        description: 'Rhythm converts to VF'
      },
      {
        triggerAfterShocks: 1,
        rosc: true,
        description: 'ROSC after shock'
      }
    ],
    expectedActions: [
      { type: 'epinephrine', windowStart: 0, windowEnd: 60, required: true, hint: 'Give epinephrine immediately for asystole' },
      { type: 'rhythmCheck', windowStart: 115, windowEnd: 130, required: true },
      { type: 'rhythmCheck', windowStart: 235, windowEnd: 250, required: true },
      { type: 'epinephrine', windowStart: 240, windowEnd: 300, required: true, hint: 'Second dose of epinephrine' },
      { type: 'rhythmCheck', windowStart: 355, windowEnd: 370, required: true },
      { type: 'shock', windowStart: 365, windowEnd: 400, required: true, hint: 'Now shockable - deliver shock!' },
      { type: 'rosc', windowStart: 370, windowEnd: 420, required: true }
    ]
  },
  {
    id: 'pea-hypovolemia',
    name: 'PEA - Hypovolemia',
    nameIt: 'PEA - Ipovolemia',
    description: 'PEA arrest caused by hypovolemia. Focus on identifying and treating reversible cause.',
    descriptionIt: 'Arresto in PEA causato da ipovolemia. Focus su identificazione e trattamento della causa reversibile.',
    difficulty: 'intermediate',
    initialRhythm: 'pea',
    estimatedDuration: 420,
    learningObjectives: [
      'Recognize PEA rhythm',
      'Consider H\'s and T\'s',
      'Administer epinephrine promptly',
      'Identify hypovolemia as cause'
    ],
    learningObjectivesIt: [
      'Riconoscere ritmo PEA',
      'Considerare H\'s e T\'s',
      'Somministrare adrenalina prontamente',
      'Identificare ipovolemia come causa'
    ],
    events: [
      {
        triggerTime: 300,
        rosc: true,
        description: 'ROSC achieved after fluid resuscitation'
      }
    ],
    expectedActions: [
      { type: 'epinephrine', windowStart: 0, windowEnd: 60, required: true, hint: 'Give epinephrine immediately for PEA' },
      { type: 'rhythmCheck', windowStart: 115, windowEnd: 130, required: true },
      { type: 'rhythmCheck', windowStart: 235, windowEnd: 250, required: true },
      { type: 'epinephrine', windowStart: 240, windowEnd: 300, required: true },
      { type: 'rosc', windowStart: 300, windowEnd: 360, required: true }
    ]
  },
  {
    id: 'vf-to-asystole',
    name: 'VF Deteriorating to Asystole',
    nameIt: 'FV che Degenera in Asistolia',
    description: 'Patient starts in VF but deteriorates to asystole. Tests adaptability to changing rhythms.',
    descriptionIt: 'Paziente inizia in FV ma degenera in asistolia. Testa adattabilità ai cambiamenti di ritmo.',
    difficulty: 'advanced',
    initialRhythm: 'vf_pvt',
    estimatedDuration: 720,
    learningObjectives: [
      'Manage rhythm changes',
      'Adapt treatment to new rhythm',
      'Maintain medication timing across rhythm changes',
      'Recognize when to stop shocking'
    ],
    learningObjectivesIt: [
      'Gestire cambiamenti di ritmo',
      'Adattare trattamento al nuovo ritmo',
      'Mantenere tempistiche farmaci attraverso cambi ritmo',
      'Riconoscere quando smettere di defibrillare'
    ],
    events: [
      {
        triggerAfterShocks: 2,
        newRhythm: 'asystole',
        description: 'Rhythm degrades to asystole after 2nd shock'
      },
      {
        triggerTime: 600,
        rosc: true,
        description: 'ROSC achieved'
      }
    ],
    expectedActions: [
      { type: 'rhythmCheck', windowStart: 115, windowEnd: 130, required: true },
      { type: 'shock', windowStart: 120, windowEnd: 140, required: true },
      { type: 'rhythmCheck', windowStart: 235, windowEnd: 250, required: true },
      { type: 'shock', windowStart: 240, windowEnd: 260, required: true },
      { type: 'epinephrine', windowStart: 240, windowEnd: 300, required: true },
      { type: 'rhythmCheck', windowStart: 355, windowEnd: 370, required: true },
      { type: 'rhythmCheck', windowStart: 475, windowEnd: 490, required: true },
      { type: 'epinephrine', windowStart: 480, windowEnd: 540, required: true },
      { type: 'rhythmCheck', windowStart: 595, windowEnd: 610, required: true },
      { type: 'rosc', windowStart: 600, windowEnd: 660, required: true }
    ]
  },
  {
    id: 'prolonged-resuscitation',
    name: 'Prolonged Resuscitation',
    nameIt: 'Rianimazione Prolungata',
    description: 'Extended resuscitation effort requiring multiple medication doses and systematic approach.',
    descriptionIt: 'Sforzo rianimatorio prolungato che richiede dosi multiple di farmaci e approccio sistematico.',
    difficulty: 'advanced',
    initialRhythm: 'vf_pvt',
    estimatedDuration: 900,
    learningObjectives: [
      'Maintain systematic approach over time',
      'Proper medication timing over extended period',
      'Multiple amiodarone doses',
      'Team endurance and focus'
    ],
    learningObjectivesIt: [
      'Mantenere approccio sistematico nel tempo',
      'Tempistiche farmaci corrette su periodo esteso',
      'Dosi multiple di amiodarone',
      'Resistenza e concentrazione del team'
    ],
    events: [
      {
        triggerAfterShocks: 6,
        rosc: true,
        description: 'ROSC after prolonged effort'
      }
    ],
    expectedActions: [
      { type: 'rhythmCheck', windowStart: 115, windowEnd: 130, required: true },
      { type: 'shock', windowStart: 120, windowEnd: 140, required: true },
      { type: 'rhythmCheck', windowStart: 235, windowEnd: 250, required: true },
      { type: 'shock', windowStart: 240, windowEnd: 260, required: true },
      { type: 'epinephrine', windowStart: 240, windowEnd: 300, required: true },
      { type: 'rhythmCheck', windowStart: 355, windowEnd: 370, required: true },
      { type: 'shock', windowStart: 360, windowEnd: 380, required: true },
      { type: 'amiodarone', windowStart: 360, windowEnd: 420, required: true },
      { type: 'rhythmCheck', windowStart: 475, windowEnd: 490, required: true },
      { type: 'shock', windowStart: 480, windowEnd: 500, required: true },
      { type: 'epinephrine', windowStart: 480, windowEnd: 540, required: true },
      { type: 'rhythmCheck', windowStart: 595, windowEnd: 610, required: true },
      { type: 'shock', windowStart: 600, windowEnd: 620, required: true },
      { type: 'amiodarone', windowStart: 600, windowEnd: 660, required: true, hint: 'Second dose amiodarone 150mg' },
      { type: 'rhythmCheck', windowStart: 715, windowEnd: 730, required: true },
      { type: 'shock', windowStart: 720, windowEnd: 740, required: true },
      { type: 'rosc', windowStart: 725, windowEnd: 780, required: true }
    ]
  }
];

export function getScenarioById(id: string): TrainingScenario | undefined {
  return scenarios.find(s => s.id === id);
}

export function getScenariosByDifficulty(difficulty: string): TrainingScenario[] {
  if (difficulty === 'all') return scenarios;
  return scenarios.filter(s => s.difficulty === difficulty);
}
