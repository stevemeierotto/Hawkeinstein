# Gameplay Rules & Flow

## Overview
This is an early learning web game for preschool through first grade (ages 3–7). The game progresses through multiple levels, each teaching foundational academic skills through interactive matching activities.

---

## UI Element Layering

**CRITICAL RULE:** Draggable pieces must never appear behind UI elements.

All levels must ensure that:
- Back button (`z-index: 1000`)
- Score display (`z-index: 1000`)
- Timer display (`z-index: 1000`)

Stay above all draggable game pieces at all times. This ensures the interface remains accessible and prevents pieces from obscuring critical UI controls.

---

## Game Structure

### Levels
The game consists of multiple levels that unlock progressively:
- **Level 1:** Shape Matching
- **Level 2:** Shape & Color Matching (Stages 1-4)
- **Level 3:** Number Matching
- **Level 4:** Letter Matching

Each level must be completed before the next level unlocks.

---

## Core Mechanics

### Drag & Match
- Players drag objects from the top area to matching targets in the bottom area
- A match is valid only when **all required attributes match** (see level-specific rules)
- Correct matches: Object disappears, target is filled, score increases
- Incorrect matches: Object snaps back to random position in top area
- No penalties for incorrect matches; encourage retrying

### Stage Progression
- Each level contains **stages** that must be completed sequentially
- All 9 objects in a stage must be matched before advancing to the next stage
- Upon completing a stage:
  1. Wait 1.5 seconds for feedback
  2. Top area clears (no objects remain)
  3. Bottom targets reset (empty)
  4. New stage objects appear
- Visual indicator shows current stage (e.g., "Stage 2/4")

---

## Level 1: Shape Matching

### Objective
Match draggable shapes to their corresponding target shapes.

### Objects
- **9 draggable shapes** in top area
- **3 target shapes** in bottom area (one of each type)

### Matching Rule
- Shape type must match only
- Color is decorative (does not affect matching)

### Stage Structure
- All 9 shapes are the same type within a single play-through
- Focus: Visual recognition of shape forms

### Flow
```
Top Area: 9 mixed-color circles
Bottom Area: 1 circle target
→ Match all 9 circles to the target
→ Level Complete
```

---

## Level 2: Shape & Color Matching

### Objective
Match shapes to targets based on **both shape type AND color**.

### Objects
- **9 draggable shapes** (mixed colors) in top area
- **3 target shapes** (one per color) in bottom area

### Matching Rule
- Shape type must match **AND**
- Color must match
- Both conditions required for valid match

### Stage Structure

#### Stage 1: Squares
- Draggable: 3 red squares + 3 blue squares + 3 green squares
- Targets: 1 red square, 1 blue square, 1 green square
- Task: Match all 9 squares to their color-matched targets

#### Stage 2: Circles
- Draggable: 3 red circles + 3 blue circles + 3 green circles
- Targets: 1 red circle, 1 blue circle, 1 green circle
- Task: Match all 9 circles to their color-matched targets

#### Stage 3: Triangles
- Draggable: 3 red triangles + 3 blue triangles + 3 green triangles
- Targets: 1 red triangle, 1 blue triangle, 1 green triangle
- Task: Match all 9 triangles to their color-matched targets

#### Stage 4: Mixed Shapes (Challenge)
- Draggable: 3 squares (red, blue, green) + 3 circles (red, blue, green) + 3 triangles (red, blue, green)
- Targets: 3 shapes (one red, one blue, one green) covering all types
- Task: Match all 9 mixed shapes to their shape AND color-matched targets

### Flow
```
Stage 1 (Squares)
→ Match all 9 red/blue/green squares to targets
→ Wait 1.5s for feedback
→ Clear and load Stage 2

Stage 2 (Circles)
→ Match all 9 red/blue/green circles to targets
→ Wait 1.5s for feedback
→ Clear and load Stage 3

Stage 3 (Triangles)
→ Match all 9 red/blue/green triangles to targets
→ Wait 1.5s for feedback
→ Clear and load Stage 4

Stage 4 (Mixed)
→ Match all 9 mixed shapes to targets
→ Wait 1.5s for feedback
→ Level 2 Complete → Unlock Level 3
```

---

## Level 3: Number Matching

### Objective
Match numbered objects to their corresponding count targets.

### Objects
- **9 draggable numbers/counters** in top area
- **3 target numbers** in bottom area

### Matching Rule
- Number/count value must match
- Visual representation of quantity

### Stage Structure
- Each stage increases difficulty by number range or counting complexity
- Focus: Number recognition and quantity understanding

---

## Level 4: Letter Matching

### Objective
Match letter tiles to target letter positions.

### Objects
- **9 draggable letters** in top area
- **3 target letter slots** in bottom area

### Matching Rule
- Letter must match (uppercase/lowercase as appropriate)
- Position-based or order-based matching depending on stage

### Stage Structure
- Stages introduce letters progressively (A-Z or phonetic grouping)
- Focus: Letter recognition and identification

---

## User Interface

### Persistent Elements
- **Back Button** (top-left): Return to game map
- **Score Display** (top-right): Current accumulated score
- **Timer Display** (top-right, below score): Elapsed time in seconds
- **Stage Display** (top-right, below timer): Current stage progress (e.g., "2/4")

### Game Areas
- **Top Area (75% of screen):** Draggable objects with random, non-overlapping positions
- **Bottom Area (25% of screen):** Target positions where objects are dropped

### Visual Feedback
- Dragging: Object opacity changes, cursor changes to "grabbing"
- Correct Match: Success sound, object disappears, target fills
- Incorrect Match: Object snaps back to random position
- Stage Complete: Visual/audio feedback, 1.5-second pause before clearing

---

## Progression & Scoring

### Score System
- +1 point per correct match
- No negative penalties
- Score persists across stages and levels

### Level Completion
- A level is complete when all stages are finished
- Completion unlocks the next level
- Completed levels show a ⭐ star on the game map

### No Failure State
- Players cannot "fail" a level
- Mistakes are learning opportunities
- Encourage persistence and retry

---

## Design Principles

### For Young Players
1. **Simple Rules:** One clear action (drag & drop)
2. **Immediate Feedback:** Visual and audio confirmation
3. **No Time Pressure:** Timer displayed but no countdown penalties
4. **Encouragement:** No failure states, only positive reinforcement
5. **Large Targets:** Easy-to-hit drop zones
6. **Bright Colors:** Engaging, visually distinct shapes and colors
7. **Short Stages:** Achievable goals (9 matches per stage)

### Accessibility
- Responsive design for tablets and phones
- Touch-friendly large buttons and drag targets
- Clear contrast between shapes and backgrounds
- Optional audio narration (future enhancement)
- No required reading (icons and visuals only)

---

## Future Enhancements

- Audio narration for instructions
- Difficulty settings (easy/medium/hard)
- Achievement badges and visual milestones
- Parental dashboard for progress tracking
- Additional levels (shapes with sizes, patterns, etc.)
- Multiplayer/competitive modes
- Customizable difficulty progression
