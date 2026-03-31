import type { Achievement, UserAchievement } from '../types';

export function createInitialUserAchievements(
  userId: string,
  achievements: Achievement[]
): UserAchievement[] {
  return [];
}

export function updateAchievementProgress(
  userId: string,
  userAchievements: UserAchievement[],
  allAchievements: Achievement[],
  eventType: string,
  eventData: any
): UserAchievement[] {
  const updatedAchievements = [...userAchievements];

  allAchievements.forEach(achievement => {
    const existing = updatedAchievements.find(
      ua => ua.achievementId === achievement.id
    );

    if (existing && existing.unlockedAt > 0) {
      return;
    }

    let shouldUpdate = false;
    let newProgress = 0;

    switch (achievement.condition.type) {
      case 'complete_carriages':
        if (eventType === 'carriage:complete') {
          const currentProgress = existing?.progress ?? 0;
          newProgress = currentProgress + 1;
          shouldUpdate = true;
        }
        break;
      case 'streak_days':
        if (eventType === 'streak:update') {
          newProgress = eventData.streakDays ?? 0;
          shouldUpdate = true;
        }
        break;
      case 'share_count':
        if (eventType === 'share') {
          const currentProgress = existing?.progress ?? 0;
          newProgress = currentProgress + 1;
          shouldUpdate = true;
        }
        break;
      case 'custom':
        if (eventType === 'first:action' && eventData.action === 'all_categories') {
          newProgress = 1;
          shouldUpdate = true;
        }
        break;
    }

    if (shouldUpdate) {
      const isUnlocked = newProgress >= achievement.condition.target;

      if (existing) {
        const index = updatedAchievements.indexOf(existing);
        updatedAchievements[index] = {
          ...existing,
          progress: newProgress,
          unlockedAt: isUnlocked ? Date.now() : existing.unlockedAt,
          isNew: isUnlocked && !existing.unlockedAt,
        };
      } else {
        updatedAchievements.push({
          userId,
          achievementId: achievement.id,
          unlockedAt: isUnlocked ? Date.now() : 0,
          progress: newProgress,
          isNew: isUnlocked,
        });
      }
    }
  });

  return updatedAchievements;
}

export function checkUnlockedAchievements(
  userAchievements: UserAchievement[],
  allAchievements: Achievement[]
): UserAchievement[] {
  return userAchievements.filter(
    ua => ua.isNew && ua.unlockedAt > 0
  );
}

export function getVisibleAchievements(
  allAchievements: Achievement[],
  userAchievements: UserAchievement[]
): Achievement[] {
  const unlockedIds = new Set(
    userAchievements.filter(ua => ua.unlockedAt > 0).map(ua => ua.achievementId)
  );

  return allAchievements.filter(
    achievement => !achievement.isHidden || unlockedIds.has(achievement.id)
  );
}

export function markAchievementAsRead(
  userAchievement: UserAchievement
): UserAchievement {
  return {
    ...userAchievement,
    isNew: false,
  };
}

export function getAchievementProgress(
  userAchievement: UserAchievement | undefined,
  achievement: Achievement
): { current: number; target: number; percent: number; isUnlocked: boolean } {
  const current = userAchievement?.progress ?? 0;
  const target = achievement.condition.target;
  const isUnlocked = !!userAchievement?.unlockedAt;
  const percent = isUnlocked ? 100 : Math.min(100, (current / target) * 100);

  return { current, target, percent, isUnlocked };
}

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common': return '#6b7280';
    case 'rare': return '#3b82f6';
    case 'epic': return '#8b5cf6';
    case 'legendary': return '#f59e0b';
    default: return '#6b7280';
  }
}
