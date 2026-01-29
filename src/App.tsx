import { useState } from 'react'
import LandingPage from './components/LandingPage'
import ShapeMatchLevel from './components/ShapeMatchLevel'
import ShapeColorMatchLevel from './components/ShapeColorMatchLevel'
import NumberMatchLevel from './components/NumberMatchLevel'
import LetterMatchLevel from './components/LetterMatchLevel'
import MemoryGameLevel from './components/MemoryGameLevel'
import SpellingLevel from './components/SpellingLevel'
import GameMap from './components/GameMap'
import './App.css'

type Screen = 'landing' | 'map' | 'level-1' | 'level-2' | 'level-3' | 'level-4' | 'level-5' | 'level-6'

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing')
  const [level1Completed, setLevel1Completed] = useState(true)
  const [level2Completed, setLevel2Completed] = useState(true)
  const [level3Completed, setLevel3Completed] = useState(true)
  const [level4Completed, setLevel4Completed] = useState(true)
  const [level5Completed, setLevel5Completed] = useState(true)
  const [level6Completed, setLevel6Completed] = useState(false)
  const [score, setScore] = useState(0)

  const handleLevel1Complete = () => {
    setLevel1Completed(true)
    setCurrentScreen('map')
  }

  const handleLevel2Complete = () => {
    setLevel2Completed(true)
    setCurrentScreen('map')
  }

  const handleLevel3Complete = () => {
    setLevel3Completed(true)
    setCurrentScreen('map')
  }

  const handleLevel4Complete = () => {
    setLevel4Completed(true)
    setCurrentScreen('map')
  }

  const handleLevel5Complete = () => {
    setLevel5Completed(true)
    setCurrentScreen('map')
  }

  const handleLevel6Complete = () => {
    setLevel6Completed(true)
    setCurrentScreen('map')
  }

  const handlePlayLevel = (levelNumber: number) => {
    if (levelNumber === 1) {
      setCurrentScreen('level-1')
    } else if (levelNumber === 2 && level1Completed) {
      setCurrentScreen('level-2')
    } else if (levelNumber === 3 && level2Completed) {
      setCurrentScreen('level-3')
    } else if (levelNumber === 4 && level3Completed) {
      setCurrentScreen('level-4')
    } else if (levelNumber === 5 && level4Completed) {
      setCurrentScreen('level-5')
    } else if (levelNumber === 6 && level5Completed) {
      setCurrentScreen('level-6')
    }
  }

  const handleBackToMap = () => {
    setCurrentScreen('map')
  }

  const handleStartGame = () => {
    setCurrentScreen('map')
  }

  return (
    <>
      {currentScreen === 'landing' && (
        <LandingPage onStartGame={handleStartGame} />
      )}
      {currentScreen === 'map' && (
        <GameMap 
          onPlayLevel={handlePlayLevel} 
          completedLevels={[...(level1Completed ? [1] : []), ...(level2Completed ? [2] : []), ...(level3Completed ? [3] : []), ...(level4Completed ? [4] : []), ...(level5Completed ? [5] : []), ...(level6Completed ? [6] : [])]}
          score={score}
        />
      )}
      {currentScreen === 'level-1' && (
        <ShapeMatchLevel onComplete={handleLevel1Complete} onBack={handleBackToMap} score={score} onScoreChange={setScore} />
      )}
      {currentScreen === 'level-2' && (
        <ShapeColorMatchLevel onComplete={handleLevel2Complete} onBack={handleBackToMap} score={score} onScoreChange={setScore} />
      )}
      {currentScreen === 'level-3' && (
        <NumberMatchLevel onComplete={handleLevel3Complete} onBack={handleBackToMap} score={score} onScoreChange={setScore} />
      )}
      {currentScreen === 'level-4' && (
        <LetterMatchLevel onComplete={handleLevel4Complete} onBack={handleBackToMap} score={score} onScoreChange={setScore} />
      )}
      {currentScreen === 'level-5' && (
        <MemoryGameLevel onComplete={handleLevel5Complete} onBack={handleBackToMap} score={score} onScoreChange={setScore} />
      )}
      {currentScreen === 'level-6' && (
        <SpellingLevel onComplete={handleLevel6Complete} onBack={handleBackToMap} score={score} onScoreChange={setScore} />
      )}
    </>
  )
}

export default App
