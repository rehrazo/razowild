<template>
  <div class="design-guide container">
    <h1>Design Guide</h1>
    <section>
      <h2>Color Palette</h2>
      <div class="color-swatches">
        <div v-for="color in colors" :key="color.name" class="swatch">
          <div class="swatch-box" :style="{ background: color.value }"></div>
          <div class="swatch-label">{{ color.name }}<br><span>{{ color.value }}</span></div>
        </div>
      </div>
    </section>
    <section>
      <h2>Typography</h2>
      <div class="typography-samples">
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <p>Body text example. The quick brown fox jumps over the lazy dog.</p>
        <a href="#">Link example</a>
      </div>
    </section>
    <section>
      <h2>Spacing, Section Backgrounds & Utility Classes</h2>
      <ul>
        <li><b>Section backgrounds:</b>
          <ul>
            <li><b>Featured Categories:</b> <span style="background: var(--deep-wine); color: var(--cream-white); padding: 0 0.5em; border-radius: 3px;">Deep Wine</span></li>
            <li><b>Recommended:</b> <span style="background: rgba(12,124,89,0.1); color: #222; padding: 0 0.5em; border-radius: 3px;">Sage Green Tint</span></li>
            <li><b>Welcome:</b> <span style="background: var(--color-white); color: #222; padding: 0 0.5em; border-radius: 3px;">White</span></li>
            <li><b>CTA:</b> <span style="background: var(--dark-spruce); color: var(--apricot-cream); padding: 0 0.5em; border-radius: 3px;">Dark Spruce</span></li>
          </ul>
        </li>
        <li><b>Section header color:</b> <span style="background: var(--deep-wine); color: var(--cream-white); padding: 0 0.5em; border-radius: 3px;">Cream White on Deep Wine</span></li>
        <li><b>Card link color:</b> <span style="background: var(--deep-wine); color: var(--cream-white); padding: 0 0.5em; border-radius: 3px;">Cream White on Deep Wine</span></li>
        <li><b>Section spacing:</b> <code>padding: 4rem 0;</code> <code>margin-top: 2.5rem;</code> <code>margin-bottom: 2.5rem;</code></li>
        <li><code>.mt-1</code>, <code>.mt-2</code>, <code>.mt-3</code>, <code>.mt-4</code> (margin-top)</li>
        <li><code>.mb-1</code>, <code>.mb-2</code>, <code>.mb-3</code>, <code>.mb-4</code> (margin-bottom)</li>
        <li><code>.p-1</code>, <code>.p-2</code>, <code>.p-3</code>, <code>.p-4</code> (padding)</li>
        <li><code>.text-center</code> (center text)</li>
        <li><code>.grid-2</code>, <code>.grid-3</code> (responsive grid layouts)</li>
      </ul>
    </section>
    <section>
      <h2>Buttons</h2>
      <button class="btn btn-primary">Primary Button</button>
      <button class="btn btn-secondary">Secondary Button</button>
    </section>
    <section>
      <h2>Sample Card</h2>
      <div class="sample-card">
        <h3>Card Title</h3>
        <p>This is a sample card using the main color palette and spacing utilities.</p>
        <button class="btn btn-primary">Action</button>
      </div>
    </section>
  </div>
</template>

<script setup>
const colors = [
  { name: 'Coffee Brown', value: '#412722' },
  { name: 'Deep Wine', value: '#6B0F1A' },
  { name: 'Crimson Red', value: '#A51C28' },
  { name: 'Forest Green', value: '#1B512D' },
  { name: 'Sage Green', value: '#50875f' },
  { name: 'Cream White', value: '#FFF6E6' },
  { name: 'Color White', value: '#FFFFFF' },
  { name: 'Cream White Muted', value: 'rgba(255, 246, 230, 0.35)' },
  { name: 'Text', value: 'var(--coffee-brown)' },
  { name: 'Text Muted', value: '#5E4A43' },
  { name: 'Text Subtle', value: '#7D695E' },
  { name: 'Border', value: 'rgba(65, 39, 34, 0.18)' },
  { name: 'Border Strong', value: 'rgba(65, 39, 34, 0.3)' },
  { name: 'Primary Light', value: 'var(--sage-green)' },
  { name: 'Primary Dark', value: 'var(--deep-wine)' },
  { name: 'Complement', value: 'var(--sage-green)' },
  { name: 'Accent', value: 'var(--crimson-red)' },
  { name: 'Accent Dark', value: 'var(--deep-wine)' },
  { name: 'Focus Ring', value: 'rgba(12, 124, 89, 0.18)' },
]
</script>

<style scoped>
.design-guide {
  padding: 2rem 0;
}
.color-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.swatch {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 110px;
}
.swatch-box {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-bottom: 0.5rem;
}
.swatch-label {
  font-size: 0.95rem;
  text-align: center;
}
.typography-samples h1,
.typography-samples h2,
.typography-samples h3 {
  margin-bottom: 0.5rem;
}
.typography-samples p {
  margin-bottom: 0.5rem;
}
.typography-samples a {
  color: var(--color-accent);
  text-decoration: underline;
}
ul {
  margin-bottom: 2rem;
}
.sample-card {
  background: var(--apricot-cream);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 350px;
  box-shadow: 0 2px 8px rgba(65, 39, 34, 0.08);
}
</style>
