
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
        const numStars = 200;

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
                this.vx = (Math.random() - 0.5) * 0.2;
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
                }
            }
        }
        
        class Planet {
            cx: number;
            cy: number;
            orbitRadiusX: number;
            orbitRadiusY: number;
            angle: number;
            speed: number;
            radius: number;
            color: string;
            hasRings: boolean;
            ringColor: string;
            ringTilt: number;
            x: number;
            y: number;

            constructor(orbitRadiusX: number, orbitRadiusY: number, speed: number, radius: number, color: string, hasRings: boolean = false) {
                this.cx = canvas.width / 2;
                this.cy = canvas.height * 0.9;
                this.orbitRadiusX = orbitRadiusX;
                this.orbitRadiusY = orbitRadiusY;
                this.angle = Math.random() * Math.PI * 2;
                this.speed = speed;
                this.radius = radius;
                this.color = color;
                this.hasRings = hasRings;
                this.ringColor = 'rgba(245, 208, 153, 0.7)'; // amber-200 with transparency
                this.ringTilt = Math.random() * 0.4 - 0.2;
                this.x = 0;
                this.y = 0;
                this.updatePosition();
            }

            updatePosition() {
                this.x = this.cx + Math.cos(this.angle) * this.orbitRadiusX;
                this.y = this.cy + Math.sin(this.angle) * this.orbitRadiusY;
            }

            draw() {
                if (!ctx) return;
                
                if (this.hasRings) {
                    ctx.strokeStyle = this.ringColor;
                    ctx.lineWidth = this.radius * 0.2;
                    ctx.beginPath();
                    ctx.ellipse(this.x, this.y, this.radius * 2, this.radius * 0.5, this.ringTilt, 0, Math.PI * 2);
                    ctx.stroke();
                }

                ctx.beginPath();
                const gradient = ctx.createRadialGradient(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.1, this.x, this.y, this.radius);
                const lightColor = `rgba(255, 250, 235, 0.6)`; // amber-50 with transparency
                const darkColor = `rgba(0, 0, 0, 0.5)`;
                gradient.addColorStop(0, lightColor);
                gradient.addColorStop(0.5, this.color);
                gradient.addColorStop(1, darkColor);

                ctx.fillStyle = gradient;
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
                ctx.fill();
            }

            update() {
                this.angle += this.speed;
                this.updatePosition();
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

            planets = [
                new Planet(canvas.width * 0.6, canvas.height * 0.4, 0.0005, Math.max(15, canvas.width / 60), '#d97706'), // amber-600
                new Planet(canvas.width * 0.8, canvas.height * 0.5, 0.0003, Math.max(10, canvas.width / 80), '#a16207', true), // yellow-700
                new Planet(canvas.width * 1.2, canvas.height * 0.6, 0.0002, Math.max(5, canvas.width / 150), '#64748b'), // slate-500
            ];
        };

        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            stars.forEach(star => {
                star.update();
                star.draw();
            });
            
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
            className="fixed top-0 left-0 w-full h-full -z-10"
        />
    );
};

export default StarryNightBackground;
