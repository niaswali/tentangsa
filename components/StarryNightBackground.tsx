import React, { useRef, useEffect } from 'react';

const StarryNightBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let stars: Star[] = [];
        let planets: Planet[] = [];
        let sun: Sun;
        const numStars = 250;

        class Star {
            x: number;
            y: number;
            radius: number;
            vx: number;
            opacity: number;
            opacityDirection: number;

            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.radius = Math.random() * 1.5 + 0.5;
                this.vx = (Math.random() - 0.5) * 0.15;
                this.opacity = Math.random() * 0.5 + 0.2;
                this.opacityDirection = 1;
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
                ctx.fillStyle = `rgba(254, 243, 199, ${this.opacity})`; // amber-100
                ctx.fill();
            }

            update() {
                this.x += this.vx;
                if (this.opacity > 0.7 || this.opacity < 0.2) {
                    this.opacityDirection *= -1;
                }
                this.opacity += 0.005 * this.opacityDirection;
                if (this.x < -this.radius) {
                    this.x = canvas.width + this.radius;
                } else if (this.x > canvas.width + this.radius) {
                    this.x = -this.radius;
                }
            }
        }

        class Sun {
            x: number;
            y: number;
            radius: number;

            constructor(x: number, y: number, radius: number) {
                this.x = x;
                this.y = y;
                this.radius = radius;
            }

            draw() {
                if (!ctx) return;
                // Outer glow
                const glow = ctx.createRadialGradient(this.x, this.y, this.radius, this.x, this.y, this.radius * 2.5);
                glow.addColorStop(0, 'rgba(253, 186, 116, 0.6)'); // orange-300
                glow.addColorStop(0.5, 'rgba(251, 146, 60, 0.2)'); // orange-400
                glow.addColorStop(1, 'rgba(249, 115, 22, 0)'); // orange-500
                ctx.fillStyle = glow;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Sun body
                const gradient = ctx.createRadialGradient(this.x, this.y, this.radius * 0.1, this.x, this.y, this.radius);
                gradient.addColorStop(0, '#FFFFFF');
                gradient.addColorStop(0.5, '#FDE047'); // yellow-300
                gradient.addColorStop(1, '#F97316'); // orange-500
                
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
                ctx.fillStyle = gradient;
                ctx.fill();
            }
        }
        
        class Planet {
            sunX: number;
            sunY: number;
            orbitRadiusX: number;
            orbitRadiusY: number;
            angle: number;
            speed: number;
            radius: number;
            color: string;
            rings?: { radiusX: number; radiusY: number; tilt: number; color: string; };

            constructor(sunX: number, sunY: number, orbitRadiusX: number, orbitRadiusY: number, speed: number, radius: number, color: string, rings?: { radiusX: number; radiusY: number; tilt: number; color: string; }) {
                this.sunX = sunX;
                this.sunY = sunY;
                this.orbitRadiusX = orbitRadiusX;
                this.orbitRadiusY = orbitRadiusY;
                this.angle = Math.random() * Math.PI * 2;
                this.speed = speed;
                this.radius = radius;
                this.color = color;
                this.rings = rings;
            }

            getPosition() {
                const x = this.sunX + Math.cos(this.angle) * this.orbitRadiusX;
                const y = this.sunY + Math.sin(this.angle) * this.orbitRadiusY;
                return { x, y };
            }

            draw() {
                if (!ctx) return;
                const { x, y } = this.getPosition();

                // Rings first, to be behind the planet
                if (this.rings) {
                    ctx.strokeStyle = this.rings.color;
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.ellipse(x, y, this.rings.radiusX, this.rings.radiusY, this.rings.tilt, 0, Math.PI * 2);
                    ctx.stroke();
                }

                // Planet body with lighting effect
                const gradient = ctx.createRadialGradient(x - this.radius * 0.3, y - this.radius * 0.3, this.radius * 0.1, x, y, this.radius);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
                gradient.addColorStop(1, this.color);

                ctx.beginPath();
                ctx.arc(x, y, this.radius, 0, Math.PI * 2, false);
                ctx.fillStyle = gradient;
                ctx.fill();
            }

            update() {
                this.angle += this.speed;
            }
        }

        const handleResize = () => {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            stars = [];
            for (let i = 0; i < numStars; i++) {
                stars.push(new Star());
            }

            const sunX = canvas.width / 2;
            const sunY = canvas.height / 2;
            const sunRadius = Math.min(canvas.width, canvas.height) / 20;
            sun = new Sun(sunX, sunY, sunRadius);

            const baseOrbitX = canvas.width / 10;
            const baseOrbitY = canvas.height / 10;
            const isMobile = canvas.width < 768;

            planets = [
                // Mercury
                new Planet(sunX, sunY, (baseOrbitX * 0.8) + sunRadius, (baseOrbitY * 0.8) + sunRadius, 0.01, isMobile ? 1.5 : 2, '#8C8C8C'),
                // Venus
                new Planet(sunX, sunY, (baseOrbitX * 1.3) + sunRadius, (baseOrbitY * 1.3) + sunRadius, 0.007, isMobile ? 3 : 4, '#D2B48C'),
                // Earth
                new Planet(sunX, sunY, (baseOrbitX * 1.9) + sunRadius, (baseOrbitY * 1.9) + sunRadius, 0.005, isMobile ? 3.5 : 5, '#4682B4'),
                // Mars
                new Planet(sunX, sunY, (baseOrbitX * 2.6) + sunRadius, (baseOrbitY * 2.6) + sunRadius, 0.004, isMobile ? 2.5 : 3, '#C1440E'),
                // Jupiter
                new Planet(sunX, sunY, (baseOrbitX * 4.0) + sunRadius, (baseOrbitY * 4.0) + sunRadius, 0.002, isMobile ? 8 : 12, '#D8CA9D'),
                // Saturn
                new Planet(sunX, sunY, (baseOrbitX * 5.5) + sunRadius, (baseOrbitY * 5.5) + sunRadius, 0.0015, isMobile ? 7 : 10, '#E3D7B1', { radiusX: isMobile ? 12 : 18, radiusY: isMobile ? 4 : 6, tilt: 0.5, color: 'rgba(227, 215, 177, 0.7)' }),
                // Uranus
                new Planet(sunX, sunY, (baseOrbitX * 6.8) + sunRadius, (baseOrbitY * 6.8) + sunRadius, 0.001, isMobile ? 5 : 7, '#C9EAF2'),
                // Neptune
                new Planet(sunX, sunY, (baseOrbitX * 8.0) + sunRadius, (baseOrbitY * 8.0) + sunRadius, 0.0008, isMobile ? 4.5 : 6, '#3A5FCD'),
            ];
        };

        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            stars.forEach(star => {
                star.update();
                star.draw();
            });
            
            sun.draw();
            
            // Draw orbits
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 0.5;
            planets.forEach(planet => {
                ctx.beginPath();
                ctx.ellipse(planet.sunX, planet.sunY, planet.orbitRadiusX, planet.orbitRadiusY, 0, 0, Math.PI * 2);
                ctx.stroke();
            });
            ctx.restore();

            planets.forEach(planet => {
                planet.update();
                planet.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };
        
        handleResize();
        animate();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas 
            ref={canvasRef} 
            className="fixed top-0 left-0 w-full h-full -z-10 bg-stone-900"
        />
    );
};

export default StarryNightBackground;