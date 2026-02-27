<template>
  <div class="background-layer">
    <!-- Base gradient -->
    <div class="bg-gradient"></div>

    <!-- Decorative pattern overlay -->
    <div class="bg-pattern"></div>

    <!-- Corner decorations -->
    <svg class="corner-decor corner-top-left" width="120" height="120" viewBox="0 0 120 120">
      <path d="M0,0 Q60,10 50,50 T0,100" fill="none" stroke="var(--decor-gold)" stroke-width="1.5" opacity="0.3" />
      <path d="M0,20 Q40,25 35,55 T0,90" fill="none" stroke="var(--decor-rose)" stroke-width="1" opacity="0.2" />
      <circle cx="20" cy="20" r="3" fill="var(--decor-gold)" opacity="0.4" />
    </svg>

    <svg class="corner-decor corner-top-right" width="120" height="120" viewBox="0 0 120 120">
      <path d="M120,0 Q60,10 70,50 T120,100" fill="none" stroke="var(--decor-gold)" stroke-width="1.5" opacity="0.3" />
      <path d="M120,20 Q80,25 85,55 T120,90" fill="none" stroke="var(--decor-rose)" stroke-width="1" opacity="0.2" />
      <circle cx="100" cy="20" r="3" fill="var(--decor-gold)" opacity="0.4" />
    </svg>

    <svg class="corner-decor corner-bottom-left" width="120" height="120" viewBox="0 0 120 120">
      <path d="M0,120 Q60,110 50,70 T0,20" fill="none" stroke="var(--decor-gold)" stroke-width="1.5" opacity="0.3" />
      <path d="M0,100 Q40,95 35,65 T0,30" fill="none" stroke="var(--decor-rose)" stroke-width="1" opacity="0.2" />
      <circle cx="20" cy="100" r="3" fill="var(--decor-gold)" opacity="0.4" />
    </svg>

    <svg class="corner-decor corner-bottom-right" width="120" height="120" viewBox="0 0 120 120">
      <path
        d="M120,120 Q60,110 70,70 T120,20"
        fill="none"
        stroke="var(--decor-gold)"
        stroke-width="1.5"
        opacity="0.3"
      />
      <path d="M120,100 Q80,95 85,65 T120,30" fill="none" stroke="var(--decor-rose)" stroke-width="1" opacity="0.2" />
      <circle cx="100" cy="100" r="3" fill="var(--decor-gold)" opacity="0.4" />
    </svg>

    <!-- Floating particles -->
    <div class="particles">
      <div v-for="i in 6" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
function getParticleStyle(index: number) {
  const positions = [
    { left: '10%', top: '20%', delay: '0s', duration: '4s' },
    { left: '80%', top: '15%', delay: '1s', duration: '5s' },
    { left: '25%', top: '70%', delay: '2s', duration: '4.5s' },
    { left: '70%', top: '60%', delay: '0.5s', duration: '5.5s' },
    { left: '50%', top: '40%', delay: '1.5s', duration: '4s' },
    { left: '35%', top: '85%', delay: '2.5s', duration: '5s' },
  ];
  const pos = positions[index - 1] || positions[0];
  return {
    left: pos.left,
    top: pos.top,
    animationDelay: pos.delay,
    animationDuration: pos.duration,
  };
}
</script>

<style lang="scss" scoped>
.background-layer {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--primary-bg) 0%, var(--secondary-bg) 50%, var(--primary-bg) 100%);
}

.bg-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a86c' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.corner-decor {
  position: absolute;
  opacity: 0.6;
  transition: opacity var(--transition-slow);

  &.corner-top-left {
    top: 0;
    left: 0;
  }

  &.corner-top-right {
    top: 0;
    right: 0;
    transform: scaleX(-1);
  }

  &.corner-bottom-left {
    bottom: 0;
    left: 0;
    transform: scaleY(-1);
  }

  &.corner-bottom-right {
    bottom: 0;
    right: 0;
    transform: scale(-1, -1);
  }
}

.particles {
  position: absolute;
  inset: 0;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--decor-gold);
  border-radius: 50%;
  opacity: 0;
  animation: particleFloat 4s ease-in-out infinite;

  &::before {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    background: radial-gradient(circle, var(--decor-gold) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(-2px, -2px);
  }
}

@keyframes particleFloat {
  0%,
  100% {
    opacity: 0;
    transform: translateY(0) scale(0.5);
  }
  50% {
    opacity: 0.6;
    transform: translateY(-30px) scale(1);
  }
}

// Responsive adjustments
@media (max-width: 767px) {
  .corner-decor {
    width: 80px;
    height: 80px;
    opacity: 0.4;
  }

  .particle {
    display: none;
  }
}
</style>
