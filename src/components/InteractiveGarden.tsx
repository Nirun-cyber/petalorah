import React, { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
  type: 'sparkle' | 'petal';
  angle?: number;
  spin?: number;
}

interface TrailFlower {
  x: number;
  y: number;
  scale: number;
  targetScale: number;
  color: string;
  coreColor: string;
  petalCount: number;
  life: number; // 0 to 1
  swayOffset: number;
  rotation: number;
}

interface Butterfly {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  size: number;
  angle: number;
  wingFlap: number;
  flapSpeed: number;
}

export const InteractiveGarden: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false, lastX: 0, lastY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // State lists
    let particles: Particle[] = [];
    let trailFlowers: TrailFlower[] = [];
    let butterflies: Butterfly[] = [
      { x: 100, y: 150, targetX: 200, targetY: 200, color: '#1E4E9C', size: 12, angle: 0, wingFlap: 0, flapSpeed: 0.15 },
      { x: 500, y: 300, targetX: 400, targetY: 250, color: '#A5C4F2', size: 10, angle: 0, wingFlap: 0, flapSpeed: 0.18 },
      { x: 800, y: 200, targetX: 700, targetY: 150, color: '#E6E6FA', size: 11, angle: 0, wingFlap: 0, flapSpeed: 0.12 },
    ];

    // Colors palette
    const colors = ['#1E4E9C', '#A5C4F2', '#E6E6FA', '#FFFFF0', '#F5F2EB'];
    const petalColors = ['#1E4E9C', '#A5C4F2', '#F3F3FF', '#CBE0FC'];

    // Resize canvas
    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse events
    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      const dx = mouseX - mouseRef.current.x;
      const dy = mouseY - mouseRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      mouseRef.current.x = mouseX;
      mouseRef.current.y = mouseY;
      mouseRef.current.active = true;

      const isMobile = window.innerWidth < 768;

      // Spawn trail sparkles
      if (dist > 5) {
        const sparklesCount = isMobile ? 1 : 2;
        for (let i = 0; i < sparklesCount; i++) {
          particles.push({
            x: mouseX,
            y: mouseY,
            vx: (Math.random() - 0.5) * (isMobile ? 1.2 : 2),
            vy: (Math.random() - 0.5) * (isMobile ? 1.2 : 2),
            size: Math.random() * (isMobile ? 3 : 4) + 1.5,
            alpha: 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 0,
            maxLife: (isMobile ? 25 : 30) + Math.random() * 20,
            type: 'sparkle',
          });
        }

        // Spawn a trailing flower with low probability to prevent cluttering
        const flowerProbability = isMobile ? 0.07 : 0.15;
        if (Math.random() < flowerProbability) {
          trailFlowers.push({
            x: mouseX,
            y: mouseY,
            scale: 0.1,
            targetScale: (isMobile ? 0.4 : 0.6) + Math.random() * 0.4,
            color: petalColors[Math.floor(Math.random() * petalColors.length)],
            coreColor: '#FFFFF0',
            petalCount: 5 + Math.floor(Math.random() * 3),
            life: 1.0, // decreases over time
            swayOffset: Math.random() * Math.PI * 2,
            rotation: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    // Touch events for mobile interactivity
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;

      const dx = touchX - mouseRef.current.x;
      const dy = touchY - mouseRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      mouseRef.current.x = touchX;
      mouseRef.current.y = touchY;
      mouseRef.current.active = true;

      const isMobile = window.innerWidth < 768;
      const distThreshold = isMobile ? 12 : 5;

      if (dist > distThreshold) {
        const sparklesCount = isMobile ? 1 : 2;
        for (let i = 0; i < sparklesCount; i++) {
          particles.push({
            x: touchX,
            y: touchY,
            vx: (Math.random() - 0.5) * (isMobile ? 1.2 : 2),
            vy: (Math.random() - 0.5) * (isMobile ? 1.2 : 2),
            size: Math.random() * (isMobile ? 3 : 4) + 1.5,
            alpha: 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 0,
            maxLife: (isMobile ? 20 : 30) + Math.random() * 20,
            type: 'sparkle',
          });
        }

        const flowerProbability = isMobile ? 0.06 : 0.15;
        if (Math.random() < flowerProbability) {
          trailFlowers.push({
            x: touchX,
            y: touchY,
            scale: 0.1,
            targetScale: (isMobile ? 0.4 : 0.6) + Math.random() * 0.4,
            color: petalColors[Math.floor(Math.random() * petalColors.length)],
            coreColor: '#FFFFF0',
            petalCount: 5 + Math.floor(Math.random() * 3),
            life: 1.0,
            swayOffset: Math.random() * Math.PI * 2,
            rotation: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    const handleTouchEnd = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    // Spawn random falling petals periodically
    const spawnPetalInterval = setInterval(() => {
      const isMobile = window.innerWidth < 768;
      const maxParticles = isMobile ? 12 : 30;
      if (canvas && particles.length < maxParticles) {
        particles.push({
          x: Math.random() * canvas.width,
          y: -20,
          vx: Math.random() * 1.5 - 0.75 + 0.5, // slight drift to right
          vy: Math.random() * 1.2 + 0.8,
          size: Math.random() * 8 + 6,
          alpha: 0.8,
          color: petalColors[Math.floor(Math.random() * petalColors.length)],
          life: 0,
          maxLife: 400 + Math.random() * 200,
          type: 'petal',
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.03,
        });
      }
    }, 400);

    // Main animation loop
    const render = () => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      time += 0.015;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw static background grass / leaves that sway
      const sway = Math.sin(time * 1.5) * 0.08;
      ctx.fillStyle = '#2e7d32';
      ctx.strokeStyle = '#1b5e20';
      ctx.lineWidth = 1.5;

      const isMobile = window.innerWidth < 768;
      const leafSpacing = isMobile ? 120 : 180;
      for (let x = 20; x < canvas.width; x += leafSpacing) {
        const leafH = 40 + Math.sin(x) * 15;
        const stemX = x;
        const stemY = canvas.height;
        const controlX = x + sway * 150;
        const targetX = x + sway * 300;
        const targetY = canvas.height - leafH;

        // Draw blade of grass
        ctx.beginPath();
        ctx.moveTo(stemX, stemY);
        ctx.quadraticCurveTo(controlX, (stemY + targetY) / 2, targetX, targetY);
        ctx.quadraticCurveTo(controlX - 8, (stemY + targetY) / 2, stemX, stemY);
        ctx.fill();
        ctx.stroke();

        // Draw leaf flower bud on top of some stems
        if (x % 240 === 0) {
          ctx.beginPath();
          ctx.arc(targetX, targetY, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#A5C4F2';
          ctx.fill();
          ctx.fillStyle = '#2e7d32'; // restore grass fill
        }
      }

      // 2. Update and Draw Trail Flowers
      trailFlowers = trailFlowers.filter((flower) => {
        flower.life -= 0.003; // lifetime
        if (flower.life <= 0) return false;

        // Scale up then scale down near end of life
        if (flower.life > 0.8) {
          flower.scale = flower.scale + (flower.targetScale - flower.scale) * 0.1;
        } else if (flower.life < 0.2) {
          flower.scale = flower.scale * 0.9;
        }

        const swayAngle = Math.sin(time * 2 + flower.swayOffset) * 0.15;
        const scaleVal = flower.scale;

        ctx.save();
        ctx.translate(flower.x, flower.y);
        ctx.rotate(flower.rotation + swayAngle);
        ctx.scale(scaleVal, scaleVal);

        // Draw stem connection
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 15);
        ctx.strokeStyle = '#2e7d32';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw petals
        ctx.fillStyle = flower.color;
        const radius = 10;
        for (let i = 0; i < flower.petalCount; i++) {
          const angle = (i * Math.PI * 2) / flower.petalCount;
          const px = Math.cos(angle) * radius;
          const py = Math.sin(angle) * radius;
          ctx.beginPath();
          ctx.arc(px, py, 9, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw core
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fillStyle = flower.coreColor;
        ctx.fill();
        ctx.strokeStyle = flower.color;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
        return true;
      });

      // 3. Update and Draw Particles (sparkles and falling petals)
      particles = particles.filter((p) => {
        p.life++;
        if (p.life >= p.maxLife) return false;

        // Apply velocities
        p.x += p.vx;
        p.y += p.vy;

        // Mouse avoidance physics for falling petals
        if (p.type === 'petal' && mouseRef.current.active) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            // Push force
            const force = (100 - dist) / 100;
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * force * 0.8;
            p.vy += Math.sin(angle) * force * 0.8;
          }
          // Air resistance / terminal velocity
          p.vx *= 0.95;
          p.vy = p.vy * 0.95 + 0.05 * 1.5; // gravity pull
        }

        // Fade calculation
        p.alpha = 1 - p.life / p.maxLife;

        // Render sparkle (4-point star)
        if (p.type === 'sparkle') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;

          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.quadraticCurveTo(0, 0, p.size, 0);
          ctx.quadraticCurveTo(0, 0, 0, p.size);
          ctx.quadraticCurveTo(0, 0, -p.size, 0);
          ctx.quadraticCurveTo(0, 0, 0, -p.size);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } 
        // Render falling petal
        else if (p.type === 'petal' && p.angle !== undefined && p.spin !== undefined) {
          p.angle += p.spin;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * 0.7;

          // Draw organic teardrop petal shape
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.bezierCurveTo(p.size, -p.size / 2, p.size, p.size, 0, p.size);
          ctx.bezierCurveTo(-p.size, p.size, -p.size, -p.size / 2, 0, -p.size);
          ctx.closePath();
          ctx.fill();

          // Highlight line
          ctx.strokeStyle = 'rgba(255,255,255,0.4)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.quadraticCurveTo(0, 0, 0, p.size);
          ctx.stroke();

          ctx.restore();
        }

        return true;
      });

      // 4. Update and Draw Butterflies
      butterflies.forEach((b) => {
        // AI: wandering targets
        const distToTarget = Math.sqrt((b.targetX - b.x) ** 2 + (b.targetY - b.y) ** 2);
        
        // Steering towards mouse if active and close
        if (mouseRef.current.active) {
          const distToMouse = Math.sqrt((mouseRef.current.x - b.x) ** 2 + (mouseRef.current.y - b.y) ** 2);
          if (distToMouse < 200) {
            b.targetX = mouseRef.current.x + (Math.random() - 0.5) * 40;
            b.targetY = mouseRef.current.y + (Math.random() - 0.5) * 40;
          }
        }

        // Pick new random target if close to target
        if (distToTarget < 20 || Math.random() < 0.01) {
          b.targetX = Math.random() * (canvas.width - 100) + 50;
          b.targetY = Math.random() * (canvas.height - 100) + 50;
        }

        // Steer towards target
        const dx = b.targetX - b.x;
        const dy = b.targetY - b.y;
        const angle = Math.atan2(dy, dx);
        b.angle = b.angle + (angle - b.angle) * 0.08;

        const speed = 2.0;
        b.x += Math.cos(b.angle) * speed;
        b.y += Math.sin(b.angle) * speed;

        // Wing flap oscillation
        b.wingFlap += b.flapSpeed;
        const flapWidth = Math.abs(Math.sin(b.wingFlap));

        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.angle + Math.PI / 2); // align forward facing

        // Draw body
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.ellipse(0, 0, 1.5, b.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw wings
        ctx.fillStyle = b.color;
        
        // Right wing
        ctx.beginPath();
        ctx.ellipse(b.size * 0.7 * flapWidth, -b.size * 0.2, b.size * 0.8 * flapWidth, b.size * 0.5, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(b.size * 0.5 * flapWidth, b.size * 0.3, b.size * 0.6 * flapWidth, b.size * 0.4, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Left wing
        ctx.beginPath();
        ctx.ellipse(-b.size * 0.7 * flapWidth, -b.size * 0.2, b.size * 0.8 * flapWidth, b.size * 0.5, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-b.size * 0.5 * flapWidth, b.size * 0.3, b.size * 0.6 * flapWidth, b.size * 0.4, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Details on wings
        ctx.fillStyle = '#FFFFF0';
        ctx.beginPath();
        ctx.arc(b.size * 0.7 * flapWidth, -b.size * 0.3, 2 * flapWidth, 0, Math.PI * 2);
        ctx.arc(-b.size * 0.7 * flapWidth, -b.size * 0.3, 2 * flapWidth, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Clean up
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      clearInterval(spawnPetalInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 overflow-hidden select-none pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
