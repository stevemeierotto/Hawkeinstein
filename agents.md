# Project: Early Learning Web Game for Children

## Overview
This project is a browser-based educational game designed for children from **preschool through first grade** (approximately ages 3–7).  
The game teaches foundational academic skills through interactive, playful, and visually engaging activities.

The primary goal is to support early childhood learning while keeping interactions simple, fun, and developmentally appropriate.

---

## Learning Objectives

### Core Skills
The game teaches the following concepts in a **progressive learning order**:

1. **Colors**
   - Basic color recognition
   - Matching and identification

2. **Shapes**
   - Common shapes (circle, square, triangle, rectangle, star, etc.)
   - Visual matching and naming

3. **Numbers**
   - Counting (1–10 initially, expandable later)
   - Number recognition

4. **Letters**
   - Uppercase and lowercase recognition
   - Letter sounds (optional extension)

### Advanced Skills (Unlocked After Basics)
Once children demonstrate understanding of numbers and letters:

5. **Basic Math**
   - Addition (small numbers, visual aids)
   - Subtraction (small numbers, visual aids)

6. **Beginning Reading**
   - Simple words up to **five letters**
   - Phonics-based word building
   - Picture-to-word matching

---

## Target Audience Considerations
Copilot should always assume:
- Users have **limited or no reading ability**
- Instructions must be **visual, audio-based, or icon-driven**
- Minimal text on screen
- Large buttons and simple layouts
- Bright, friendly colors and animations
- No ads, no external links, no data collection

Accessibility is important:
- Clear contrast
- Optional audio narration
- Touch-friendly design (tablets and phones)

---

## Gameplay Style
- Short, focused activities
- Positive reinforcement (stars, sounds, animations)
- No failure penalties—encourage retrying
- Progression-based unlocking of new activities
- Stateless or light progress tracking (local storage only)

---

## Recommended Software Stack

### Frontend Framework
**React + TypeScript**
- Component-based UI
- Easy state management
- Strong Copilot support
- Type safety helps avoid bugs

### Build Tool
**Vite**
- Fast development server
- Simple configuration
- Ideal for small to medium web apps

### Styling
**CSS Modules or Tailwind CSS**
- Clean, predictable styles
- Easy to create large, colorful UI elements
- Avoid overly complex animations

### State Management
- React `useState` and `useContext`
- Avoid heavy state libraries unless needed

### Audio & Animation
- HTML5 Audio API
- CSS animations or lightweight libraries
- Keep animations subtle and purposeful

### Storage
**LocalStorage**
- Store progress locally
- No backend required initially

---

## File Structure (Suggested)


