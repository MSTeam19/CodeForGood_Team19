// Gamification utility functions for Progress Quest and Champion Power systems

export interface QuestLevel {
  id: string;
  name: string;
  emoji: string;
  minAmount: number;
  maxAmount: number;
  description: string;
  color: string;
  ringColor: string;
}

export interface PowerLevel {
  id: string;
  name: string;
  emoji: string;
  minPower: number;
  maxPower: number;
  color: string;
  description: string;
}

export const QUEST_LEVELS: QuestLevel[] = [
  {
    id: 'seedling',
    name: 'Seedling',
    emoji: '🌱',
    minAmount: 0,
    maxAmount: 999,
    description: 'Starting the Journey',
    color: '#22c55e',
    ringColor: '#16a34a'
  },
  {
    id: 'sprout', 
    name: 'Sprout',
    emoji: '🌿',
    minAmount: 1000,
    maxAmount: 4999,
    description: 'Growing Roots',
    color: '#84cc16',
    ringColor: '#65a30d'
  },
  {
    id: 'sapling',
    name: 'Sapling', 
    emoji: '🌳',
    minAmount: 5000,
    maxAmount: 14999,
    description: 'Reaching Up',
    color: '#eab308',
    ringColor: '#ca8a04'
  },
  {
    id: 'tree',
    name: 'Tree',
    emoji: '🌲', 
    minAmount: 15000,
    maxAmount: 29999,
    description: 'Standing Strong',
    color: '#f97316',
    ringColor: '#ea580c'
  },
  {
    id: 'forest',
    name: 'Forest',
    emoji: '🏔️',
    minAmount: 30000,
    maxAmount: Infinity,
    description: 'Community Leader', 
    color: '#8b5cf6',
    ringColor: '#7c3aed'
  }
];

export const POWER_LEVELS: PowerLevel[] = [
  {
    id: 'spark',
    name: 'Spark',
    emoji: '⚡',
    minPower: 100,
    maxPower: 299,
    color: '#06b6d4',
    description: 'New Champion'
  },
  {
    id: 'flame', 
    name: 'Flame',
    emoji: '🔥',
    minPower: 300,
    maxPower: 599,
    color: '#f59e0b',
    description: 'Active Champion'
  },
  {
    id: 'star',
    name: 'Star', 
    emoji: '⭐',
    minPower: 600,
    maxPower: 899,
    color: '#8b5cf6',
    description: 'Lead Champion'
  },
  {
    id: 'diamond',
    name: 'Diamond',
    emoji: '💎',
    minPower: 900,
    maxPower: Infinity, 
    color: '#ec4899',
    description: 'Super Active Lead'
  }
];

// Calculate quest level based on donation amount
export function getQuestLevel(totalAmountCents: number): QuestLevel {
  const amountHKD = totalAmountCents / 100;
  
  for (let i = QUEST_LEVELS.length - 1; i >= 0; i--) {
    const level = QUEST_LEVELS[i];
    if (amountHKD >= level.minAmount) {
      return level;
    }
  }
  
  return QUEST_LEVELS[0]; // Default to Seedling
}

// Calculate progress to next quest level
export function getQuestProgress(totalAmountCents: number): { current: QuestLevel; next: QuestLevel | null; progress: number } {
  const current = getQuestLevel(totalAmountCents);
  const amountHKD = totalAmountCents / 100;
  
  // Find next level
  const currentIndex = QUEST_LEVELS.findIndex(level => level.id === current.id);
  const next = currentIndex < QUEST_LEVELS.length - 1 ? QUEST_LEVELS[currentIndex + 1] : null;
  
  // Calculate progress percentage
  let progress = 0;
  if (next) {
    const progressInLevel = amountHKD - current.minAmount;
    const levelRange = next.minAmount - current.minAmount;
    progress = Math.min((progressInLevel / levelRange) * 100, 100);
  } else {
    progress = 100; // Max level achieved
  }
  
  return { current, next, progress };
}

// Calculate champion power level
export function getChampionPower(champion: any): number {
  let power = 100; // Base power
  
  // Lead champion bonus
  if (champion.isLeadChampion) {
    power += 400;
  }
  
  // Activity bonus (based on having initiatives)
  if (champion.nextInitiativeTitle) {
    power += 200;
  }
  
  // Organization bonus
  if (champion.organization) {
    power += 100;
  }
  
  // Tenure bonus (months since joining)
  const joinedDate = new Date(champion.joinedDate);
  const monthsActive = Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
  power += Math.min(monthsActive * 50, 300); // Cap at 300 bonus
  
  return power;
}

// Get power level object based on power score
export function getPowerLevel(power: number): PowerLevel {
  for (let i = POWER_LEVELS.length - 1; i >= 0; i--) {
    const level = POWER_LEVELS[i];
    if (power >= level.minPower) {
      return level;
    }
  }
  
  return POWER_LEVELS[0]; // Default to Spark
}

// Calculate power progress to next level  
export function getPowerProgress(power: number): { current: PowerLevel; next: PowerLevel | null; progress: number } {
  const current = getPowerLevel(power);
  
  // Find next level
  const currentIndex = POWER_LEVELS.findIndex(level => level.id === current.id);
  const next = currentIndex < POWER_LEVELS.length - 1 ? POWER_LEVELS[currentIndex + 1] : null;
  
  // Calculate progress percentage
  let progress = 0;
  if (next) {
    const progressInLevel = power - current.minPower;
    const levelRange = next.minPower - current.minPower;
    progress = Math.min((progressInLevel / levelRange) * 100, 100);
  } else {
    progress = 100; // Max level achieved
  }
  
  return { current, next, progress };
}