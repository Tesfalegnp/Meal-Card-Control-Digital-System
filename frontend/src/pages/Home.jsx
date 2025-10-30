import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Enhanced Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen animate-gradient">
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="animate-fade-in-up mb-8">
            <span className="inline-block px-4 py-2 bg-blue-600 rounded-full text-sm font-semibold mb-6 pulse-glow">
              🚀 Next Generation Meal Management
            </span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-bold mb-6 animate-fade-in-up bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            MTU Meal Card
            <span className="block text-3xl sm:text-4xl mt-2 text-white">Smart Dining Experience</span>
          </h1>
          
          <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-up">
            Revolutionizing campus dining with <span className="font-semibold text-blue-300">AI-powered</span> meal tracking, 
            <span className="font-semibold text-green-300"> real-time analytics</span>, and 
            <span className="font-semibold text-purple-300"> seamless digital experience</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up">
            <Link
              to="/verify"
              className="btn-primary text-lg px-8 py-4 flex items-center gap-2 group"
            >
              <span>🔍 Verify Student</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              to="/students"
              className="btn-secondary text-lg px-8 py-4 flex items-center gap-2"
            >
              👨‍🎓 View Students
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 animate-fade-in-up">
            {[
              { number: "5,000+", label: "Active Students" },
              { number: "15,000+", label: "Meals Daily" },
              { number: "99.9%", label: "System Uptime" },
              { number: "24/7", label: "Support" }
            ].map((stat, index) => (
              <div key={index} className="text-center glass-effect p-4 rounded-xl">
                <div className="stat-number">{stat.number}</div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute bottom-10 left-10 animate-float">
          <div className="w-6 h-6 bg-blue-500 rounded-full opacity-60"></div>
        </div>
        <div className="absolute top-20 right-20 animate-float" style={{ animationDelay: '1s' }}>
          <div className="w-8 h-8 bg-purple-500 rounded-full opacity-60"></div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Why Choose Our System?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience the future of campus dining with our comprehensive solution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "⚡",
                title: "Lightning Fast",
                description: "Process meals in seconds with our optimized system"
              },
              {
                icon: "🔒",
                title: "Military Grade Security",
                description: "Advanced encryption and secure authentication"
              },
              {
                icon: "📊",
                title: "Real-time Analytics",
                description: "Live dashboard with comprehensive insights"
              },
              {
                icon: "🌐",
                title: "Cloud Powered",
                description: "Access your data anywhere, anytime"
              },
              {
                icon: "🤖",
                title: "AI Integration",
                description: "Smart predictions and automated management"
              },
              {
                icon: "📱",
                title: "Mobile First",
                description: "Responsive design for all devices"
              },
              {
                icon: "💾",
                title: "Auto Backup",
                description: "Your data is safe with automatic backups"
              },
              {
                icon: "🛠️",
                title: "Easy Integration",
                description: "Seamlessly works with existing systems"
              }
            ].map((feature, index) => (
              <div key={index} className="feature-card glass-effect p-6 rounded-xl">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-300">Simple steps for efficient meal management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Student Registration", desc: "Quick and easy student onboarding", icon: "👨‍🎓" },
              { step: "02", title: "Meal Verification", desc: "Instant QR code or ID verification", icon: "📱" },
              { step: "03", title: "Real-time Tracking", desc: "Live monitoring and analytics", icon: "📊" }
            ].map((item, index) => (
              <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold">
                  {item.step}
                </div>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">What Users Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Dr. Alemayehu", role: "Head of Cafeteria", text: "This system reduced our workload by 70%!", avatar: "👨‍⚕️" },
              { name: "Student Union", role: "Student Representative", text: "Finally, a transparent meal system we can trust!", avatar: "👨‍🎓" },
              { name: "IT Department", role: "System Admin", text: "Rock-solid performance with zero downtime.", avatar: "👨‍💻" }
            ].map((testimonial, index) => (
              <div key={index} className="glass-effect p-6 rounded-xl animate-fade-in-up">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-blue-300">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-300 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to Transform Campus Dining?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied users experiencing the future of meal management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/verify"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Get Started Today
            </Link>
            <Link
              to="/students"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}