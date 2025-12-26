'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';

// Dynamic import for Three.js scene (client-side only)
const Medical3DScene = dynamic(() => import('@/components/Medical3DScene'), {
  ssr: false,
});

export default function DoctorPortalPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mouse tracking for interactive elements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Interactive particle network canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
      });
    }

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.fill();
      });

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.2 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/40">
      {/* 3D Medical Objects Scene */}
      <Medical3DScene />

      {/* Interactive Particle Network Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-60"
      />

      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Floating Gradient Orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl animate-blob animation-delay-4000" />

      {/* Mouse Follow Gradient */}
      <div
        className="absolute w-[600px] h-[600px] bg-gradient-radial from-blue-200/30 via-cyan-200/20 to-transparent rounded-full blur-2xl pointer-events-none transition-all duration-700 ease-out"
        style={{
          left: mousePosition.x - 300,
          top: mousePosition.y - 300,
        }}
      />

      {/* Floating Medical Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { icon: '🩺', top: '10%', left: '15%', delay: 0 },
          { icon: '📋', top: '20%', right: '20%', delay: 1 },
          { icon: '💼', bottom: '30%', left: '10%', delay: 2 },
          { icon: '📊', top: '60%', right: '15%', delay: 3 },
          { icon: '⚕️', bottom: '15%', right: '25%', delay: 4 },
        ].map((item, i) => (
          <div
            key={i}
            className="absolute text-4xl opacity-10 animate-float-slow"
            style={{
              ...item,
              animationDelay: `${item.delay}s`,
              transform: `translateY(${Math.sin(scrollY * 0.01 + i) * 20}px)`,
            }}
          >
            {item.icon}
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Header - Logo and Branding */}
        <div className="text-center mb-20 animate-fade-in-up">
          {/* Logo with Parallax Effect */}
          <div
            className="inline-flex items-center justify-center mb-8 group"
            style={{
              transform: `translateY(${scrollY * 0.1}px)`,
            }}
          >
            <div className="relative">
              {/* Animated Rings */}
              <div className="absolute -inset-8 rounded-full animate-ping-slow">
                <div className="absolute inset-0 border-2 border-blue-400/30 rounded-full" />
              </div>
              <div className="absolute -inset-8 rounded-full animate-ping-slow animation-delay-1000">
                <div className="absolute inset-0 border-2 border-cyan-400/30 rounded-full" />
              </div>

              {/* Actual Logo Image */}
              <div className="relative group-hover:scale-110 transition-transform duration-500">
                <img
                  src="/logo.png"
                  alt="Mediquory Connect Logo"
                  className="w-48 h-auto drop-shadow-2xl"
                />
              </div>
            </div>
          </div>

          <h1 className="text-7xl md:text-8xl font-black mb-6 bg-gradient-to-r from-blue-900 via-cyan-600 to-blue-900 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] drop-shadow-sm">
            MEDIQUORY CONNECT
          </h1>
          <div className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full border border-blue-500/20 backdrop-blur-sm mb-4">
            <p className="text-xl font-semibold text-blue-900 tracking-wide">
              Professional Telemedicine Platform for Doctors
            </p>
          </div>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Expand your practice with our advanced digital health platform. Reach more patients, streamline consultations, and grow your revenue.
          </p>
        </div>

        {/* Features Grid - Doctor-Focused */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            {
              icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
              title: 'Patient Management',
              description: 'Organize your practice with smart patient records, appointment scheduling, and automated follow-ups',
              gradient: 'from-blue-500 to-cyan-600',
            },
            {
              icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
              title: 'HD Video Consultations',
              description: 'Professional-grade video calls with crystal-clear quality and real-time diagnostic tools',
              gradient: 'from-cyan-500 to-blue-600',
            },
            {
              icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
              title: 'Flexible Pricing Plans',
              description: 'Choose subscription plans that fit your practice size with transparent, affordable pricing',
              gradient: 'from-blue-500 to-cyan-600',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group relative bg-white/60 backdrop-blur-xl border border-blue-200/50 rounded-3xl p-8 hover:bg-white/80 hover:border-blue-400/60 hover:scale-105 hover:-translate-y-2 transition-all duration-500 shadow-lg shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/20"
              style={{
                animationDelay: `${i * 100}ms`,
              }}
            >
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl mb-6 shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 group-hover:scale-110 transition-all duration-500`}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-3 group-hover:text-cyan-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section - Doctor Portal */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/60 backdrop-blur-xl border border-blue-200/50 rounded-3xl p-10 shadow-2xl shadow-blue-500/20">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-blue-900 mb-4">Join Mediquory Connect</h2>
              <p className="text-gray-700 text-lg">
                Start your digital practice today. Trusted by thousands of healthcare professionals.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Link href="/doctor/login" className="block">
                <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-3 group/btn">
                  <svg className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Doctor Login
                </button>
              </Link>
              <Link href="/doctor/signup" className="block">
                <button className="w-full bg-white/80 hover:bg-white text-blue-600 hover:text-blue-700 font-semibold px-8 py-4 rounded-xl border-2 border-blue-500/30 hover:border-blue-500/60 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-3 group/btn">
                  <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Register as Doctor
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mt-20 grid md:grid-cols-4 gap-6 text-center">
          {[
            { number: '10K+', label: 'Consultations' },
            { number: '500+', label: 'Doctors' },
            { number: '99.9%', label: 'Uptime' },
            { number: '4.9/5', label: 'Rating' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/40 backdrop-blur-sm border border-blue-200/30 rounded-2xl p-6">
              <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-gray-700 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center text-sm text-gray-600">
          <p>Secure • HIPAA Compliant • 24/7 Support</p>
        </div>
      </div>
    </main>
  );
}
