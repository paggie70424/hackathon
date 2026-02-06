<template>
  <header class="header">
    <div class="header-content">
      <div class="right-section">
        <a href="#" class="header-link">About Us</a>
        <a href="#" class="header-link">Sign In</a>
        <a href="#" class="header-link account-btn">Account</a>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  height: 4rem;
  background-color: var(--c-bg);
  border-bottom: 1px solid var(--c-border);
  position: sticky;
  top: 0;
  z-index: 5;
  padding: 0 2rem;
}

.header-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.header-link {
  color: var(--c-text);
  font-weight: 500;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.header-link:hover {
  color: var(--c-brand);
}

.account-btn {
  padding: 0.5rem 1rem;
  background-color: var(--c-brand);
  color: white;
  border-radius: 4px;
}

.account-btn:hover {
  background-color: var(--c-brand-light);
  color: white;
}
</style>
