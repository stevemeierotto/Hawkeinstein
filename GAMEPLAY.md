# Gameplay Documentation

## Timer & Points System

### Timer Behavior
- **Resets at Each Stage**: The timer resets to 0 whenever a player completes a stage and advances to the next one
- **Continuous During Stage**: The timer runs continuously while the player is working on a stage
- **Applies to All Levels**: This behavior should be implemented consistently across all level components

### Points System
- **Match Points**: Players earn 1 point for each successful number/shape match
- **Stage Completion Bonus**: Players earn 10 bonus points when completing a stage
- **Level Completion**: Final score is displayed when the level is complete

### Implementation Standards

#### For New Levels with Multi-Stage Progression:
1. Create a `levelStartTimeRef` to track stage start time
2. In the stage advancement logic:
   ```typescript
   setElapsedTime(0);
   levelStartTimeRef.current = Date.now();
   onScoreChange(score + 10); // Award 10 points for stage completion
   ```
3. Update the timer useEffect to depend on `currentStage`:
   ```typescript
   }, [isLevelComplete, currentStage]);
   ```

#### For Single-Stage Levels:
1. Initialize timer once on component mount
2. Timer runs until level completion
3. Award final bonus points on completion

### Level-Specific Details

#### Level 3 (Number Matching)
- **Stages**: 4 total
  - Stage 1: Numbers 0-2 (9 matches to advance)
  - Stage 2: Numbers 3-5 (9 new matches to advance, 18 total)
  - Stage 3: Numbers 6-7 (6 new matches to advance, 24 total)
  - Stage 4: Numbers 8-9 (6 new matches to complete, 30 total)
- **Timer Reset**: Occurs after each stage completes
- **Points**: 1 per match + 10 per stage completion

## Design Rationale

Timer resets make sense because:
- Each stage represents a distinct learning goal
- Prevents discouragement from early mistakes affecting later stages
- Allows children to focus on one set of numbers at a time
- Provides fresh motivation between stages

Stage completion bonuses reward:
- Persistence and effort
- Advancing to more challenging content
- Milestone achievements

---

**Last Updated**: January 26, 2026
