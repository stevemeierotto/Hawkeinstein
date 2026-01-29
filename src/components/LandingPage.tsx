import './LandingPage.css'

interface LandingPageProps {
  onStartGame: () => void
}

function LandingPage({ onStartGame }: LandingPageProps) {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <header className="landing-header">
          <div className="logo-container">
            <span className="logo-icon">🎓</span>
            <h1>Professor Hawkeinstein's<br />Educational Foundation</h1>
          </div>
        </header>

        <section className="about-section">
          <h2>About Professor Hawkeinstein</h2>
          <p>
            Professor Hawkeinstein is an AI-powered learning platform focused on creating complete 
            educational experiences—not just tutoring individual questions.
          </p>
          <p>
            Instead of relying on static lessons or prebuilt curricula, the platform uses generative 
            AI agents to design full courses from the ground up. This includes structured units, lessons, 
            practice problems, quizzes, and summaries that work together as a coherent learning experience. 
            All generated course content is reviewed and approved by a human for accuracy and quality before 
            being made available to learners. Progress is evaluated through mastery and engagement rather 
            than traditional grades.
          </p>
          <p>
            At the center of the experience is Professor Hawkeinstein, an AI learning guide who helps 
            students navigate course content, ask questions, and reflect on what they are learning. While 
            Professor Hawkeinstein serves as the student-facing advisor, the underlying system focuses on 
            generating and organizing high-quality course material in a consistent and repeatable way.
          </p>
          <p>
            Professor Hawkeinstein is part of a broader learning ecosystem. For younger children who are 
            not yet reading, foundational learning skills are introduced through Little Learners, a 
            game-based experience designed to prepare students for future text-based learning.
          </p>
          <p>
            The goal is simple: make high-quality education easier to create, easier to deliver, and 
            easier to grow.
          </p>
        </section>

        <section className="game-section">
          <h2>Little Learners</h2>
          <p>
            Start your child's learning adventure with our interactive educational game!
          </p>
          <p className="draft-notice">
            <em>Note: Little Learners is currently a rough draft. Enhanced sounds and animations are coming soon!</em>
          </p>
          <button className="start-button" onClick={onStartGame}>
            🚀 Start Learning!
          </button>
        </section>

        <footer className="landing-footer">
          <p>&copy; {new Date().getFullYear()} Professor Hawkeinstein's Educational Foundation</p>
          <p className="footer-tagline">Inspiring Young Minds, One Game at a Time</p>
        </footer>
      </div>
    </div>
  )
}

export default LandingPage
