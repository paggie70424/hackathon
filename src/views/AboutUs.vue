<template>
  <div class="about-us">
    <div class="page-header">
      <h1 class="page-title">About LifeMetrics</h1>
      <p class="page-subtitle">Unified student data tracking and insights.</p>
    </div>

    <div class="content-section">
      <h2>Purpose</h2>
      <p>
        The LifeMetrics Dashboard is designed to aggregate data from various educational and personal sources to provide a holistic view of a student's life. By correlating academic performance with health and lifestyle metrics, we aim to uncover insights that can improve student well-being and success.
      </p>
    </div>

    <div class="content-section">
      <h2>Data Resources</h2>
      <div class="resources-grid">
        <div class="resource-card">
          <h3>Whoop</h3>
          <p>
            <strong>Type:</strong> Health & Fitness<br>
            <strong>Purpose:</strong> Tracks sleep, recovery, and daily strain. Used to analyze the impact of physical well-being on academic focus.
          </p>
        </div>
        
        <div class="resource-card">
          <h3>Canvas</h3>
          <p>
            <strong>Type:</strong> Educational LMS<br>
            <strong>Purpose:</strong> Source of assignment grades, course schedules, and submission timelines.
          </p>
        </div>

        <div class="resource-card">
          <h3>School System</h3>
          <p>
            <strong>Type:</strong> Administrative<br>
            <strong>Purpose:</strong> Official transcripts, attendance records, and enrollment status.
          </p>
        </div>

        <div class="resource-card">
          <h3>Apple Health</h3>
          <p>
            <strong>Type:</strong> Health<br>
            <strong>Purpose:</strong> Supplementary activity data, step counts, and mindfulness minutes.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 3rem;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--c-text);
}

.page-subtitle {
  color: var(--c-text-light);
  font-size: 1.25rem;
}

.content-section {
  max-width: 800px;
  margin: 0 auto 3rem;
}

.content-section h2 {
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  color: var(--c-text);
  border-bottom: 2px solid var(--c-brand);
  padding-bottom: 0.5rem;
  display: inline-block;
}

.content-section p {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--c-text);
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.resource-card {
  background: var(--c-bg);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--c-border);
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}

.resource-card:hover {
  transform: translateY(-5px);
}

.resource-card h3 {
  color: var(--c-brand);
  font-size: 1.25rem;
  margin-bottom: 1rem;
}
</style>
