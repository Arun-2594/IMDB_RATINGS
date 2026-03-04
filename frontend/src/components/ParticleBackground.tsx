"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ParticleBackground() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        // Setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: true,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        // Purple particles
        const purpleCount = 600;
        const purplePositions = new Float32Array(purpleCount * 3);
        const purpleOriginal = new Float32Array(purpleCount * 3);

        for (let i = 0; i < purpleCount; i++) {
            const x = (Math.random() - 0.5) * 20;
            const y = (Math.random() - 0.5) * 20;
            const z = (Math.random() - 0.5) * 10;
            purplePositions[i * 3] = x;
            purplePositions[i * 3 + 1] = y;
            purplePositions[i * 3 + 2] = z;
            purpleOriginal[i * 3] = x;
            purpleOriginal[i * 3 + 1] = y;
            purpleOriginal[i * 3 + 2] = z;
        }

        const purpleGeometry = new THREE.BufferGeometry();
        purpleGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(purplePositions, 3)
        );

        const purpleMaterial = new THREE.PointsMaterial({
            size: 0.03,
            color: new THREE.Color("#7C3AED"),
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const purplePoints = new THREE.Points(purpleGeometry, purpleMaterial);
        scene.add(purplePoints);

        // Cyan particles
        const cyanCount = 200;
        const cyanPositions = new Float32Array(cyanCount * 3);

        for (let i = 0; i < cyanCount; i++) {
            cyanPositions[i * 3] = (Math.random() - 0.5) * 25;
            cyanPositions[i * 3 + 1] = (Math.random() - 0.5) * 25;
            cyanPositions[i * 3 + 2] = (Math.random() - 0.5) * 8;
        }

        const cyanGeometry = new THREE.BufferGeometry();
        cyanGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(cyanPositions, 3)
        );

        const cyanMaterial = new THREE.PointsMaterial({
            size: 0.02,
            color: new THREE.Color("#06B6D4"),
            transparent: true,
            opacity: 0.4,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const cyanPoints = new THREE.Points(cyanGeometry, cyanMaterial);
        scene.add(cyanPoints);

        // Mouse tracking
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener("mousemove", handleMouseMove, { passive: true });

        // Resize handler
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", handleResize, { passive: true });

        // Animation loop
        let animationId: number;
        const clock = new THREE.Clock();

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            const time = clock.getElapsedTime();

            // Animate purple particles
            const posArray = purpleGeometry.attributes.position
                .array as Float32Array;
            const mx = mouseRef.current.x * 5;
            const my = mouseRef.current.y * 5;

            for (let i = 0; i < purpleCount; i++) {
                const i3 = i * 3;
                const origX = purpleOriginal[i3];
                const origY = purpleOriginal[i3 + 1];

                posArray[i3] = origX + Math.sin(time * 0.3 + i * 0.1) * 0.15;
                posArray[i3 + 1] = origY + Math.cos(time * 0.2 + i * 0.15) * 0.15;

                // Mouse repulsion
                const dx = posArray[i3] - mx;
                const dy = posArray[i3 + 1] - my;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 3) {
                    const force = (3 - dist) * 0.03;
                    posArray[i3] += (dx / dist) * force;
                    posArray[i3 + 1] += (dy / dist) * force;
                }
            }
            purpleGeometry.attributes.position.needsUpdate = true;
            purplePoints.rotation.z = time * 0.02;

            // Animate cyan particles
            cyanPoints.rotation.z = -time * 0.01;
            cyanPoints.rotation.x = Math.sin(time * 0.1) * 0.05;

            renderer.render(scene, camera);
        };

        animate();

        // Cleanup
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("resize", handleResize);
            renderer.dispose();
            purpleGeometry.dispose();
            purpleMaterial.dispose();
            cyanGeometry.dispose();
            cyanMaterial.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div ref={containerRef} className="three-canvas-container" />;
}
