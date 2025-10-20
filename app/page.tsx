'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Truck, 
  Shield, 
  MapPin, 
  BarChart3,
  Zap,
  Globe,
  CheckCircle,
  ArrowRight,
  Users,
  Target,
  Award,
  TrendingUp,
  Clock,
  Smartphone,
  Settings,
  Mail,
  Phone
} from 'lucide-react';



export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Lakdhanavi
                </h1>
                <p className="text-xs text-gray-600 font-medium">Vehicle Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/login')}
                className="hidden md:flex text-gray-700 hover:text-blue-600"
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push('/login')}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-6 shadow-lg"
              >
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8 relative overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-70"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block">
                <span className="px-4 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-sm font-semibold rounded-full shadow-lg">
                  🚀 Next-Generation Fleet Management
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Lakdhanavi
                </span>
                <br />
                <span className="text-gray-900">
                  Vehicle Management System
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Empowering Sri Lanka's leading power distribution company with intelligent fleet management, 
                real-time tracking, and data-driven insights for optimal vehicle operations.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => router.push('/login')}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-8 h-14 text-lg shadow-xl"
                >
                  Start Managing Fleet
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-8 h-14 text-lg"
                >
                  Learn More
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">500+</div>
                  <div className="text-sm text-gray-600 font-medium">Vehicles</div>
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">99.9%</div>
                  <div className="text-sm text-gray-600 font-medium">Uptime</div>
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">24/7</div>
                  <div className="text-sm text-gray-600 font-medium">Support</div>
                </div>
              </div>
            </div>

{/* Hero Image/Illustration - Compact, Clipped, Landscape */}
<div className="relative lg:block hidden">
  {/* Frame */}
  <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-1.5 shadow-2xl overflow-hidden">
    <div className="bg-white rounded-xl p-4 space-y-3 w-[596px] h-[300px] overflow-hidden relative">
      {/* Browser-like Header */}
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center space-x-1.5">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
          <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
        </div>
        <div className="text-[10px] text-gray-400 font-mono">Dashboard Preview</div>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <div className="h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded w-40 animate-pulse"></div>
        <div className="h-2 bg-gray-200 rounded w-28"></div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-2.5 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-1">
            <Truck className="w-4 h-4 text-blue-600" />
            <div className="text-[9px] text-blue-600 font-semibold">+12%</div>
          </div>
          <div className="text-base font-bold text-blue-900 leading-none">245</div>
          <div className="text-[10px] text-blue-600 mt-0.5">Active Rides</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-2.5 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-1">
            <Users className="w-4 h-4 text-purple-600" />
            <div className="text-[9px] text-purple-600 font-semibold">+8%</div>
          </div>
          <div className="text-base font-bold text-purple-900 leading-none">89</div>
          <div className="text-[10px] text-purple-600 mt-0.5">Drivers</div>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-2.5 rounded-lg border border-pink-200">
          <div className="flex items-center justify-between mb-1">
            <BarChart3 className="w-4 h-4 text-pink-600" />
            <div className="text-[9px] text-pink-600 font-semibold">+25%</div>
          </div>
          <div className="text-base font-bold text-pink-900 leading-none">1.2k</div>
          <div className="text-[10px] text-pink-600 mt-0.5">km Today</div>
        </div>
      </div>

      {/* Middle Row: Map + Activity */}
      <div className="grid grid-cols-2 gap-2">
        {/* Map Preview */}
        <div className="relative h-24 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-lg overflow-hidden">
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, #3b82f6 0px, #3b82f6 1px, transparent 1px, transparent 12px),
                                repeating-linear-gradient(90deg, #3b82f6 0px, #3b82f6 1px, transparent 1px, transparent 12px)`,
              backgroundSize: '12px 12px',
            }}
          />
          {/* Vehicles (smaller bounce to avoid overflow) */}
          <div className="absolute top-3 left-3 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-md animate-bounce-sm">
            <Truck className="w-3 h-3 text-white" />
          </div>
          <div className="absolute top-9 right-6 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow-md animate-pulse-soft">
            <Truck className="w-3 h-3 text-white" />
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center shadow-md animate-bounce-sm animation-delay-2000">
            <Truck className="w-3 h-3 text-white" />
          </div>
          <div className="absolute bottom-6 right-8">
            <MapPin className="w-6 h-6 text-red-500 animate-pulse-soft" />
          </div>
        </div>

        {/* Activity List */}
        <div className="space-y-1">
          <div className="text-[10px] font-semibold text-gray-600">Recent Activity</div>
          {[
            { c: 'green', w: 'w-full', t: '2m' },
            { c: 'blue', w: 'w-4/5', t: '5m' },
            { c: 'purple', w: 'w-3/4', t: '12m' },
            { c: 'orange', w: 'w-2/3', t: '18m' },
            { c: 'pink', w: 'w-3/5', t: '25m' },
          ].map((row, i) => (
            <div key={i} className={`flex items-center space-x-2 p-1 bg-${row.c}-50 rounded border border-${row.c}-200`}>
              <div className={`w-1.5 h-1.5 bg-${row.c}-500 rounded-full animate-pulse-soft`} />
              <div className="flex-1">
                <div className={`h-1.5 bg-${row.c}-300 rounded ${row.w}`}></div>
              </div>
              <div className={`text-[9px] text-${row.c}-600 font-semibold`}>{row.t}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse-soft w-2/3"></div>
        </div>
        <span className="text-[10px] font-semibold text-gray-600">65% Active</span>
      </div>

      {/* Corner badges (kept inside the frame) */}
      <div className="absolute top-3 right-3 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-lg flex items-center justify-center animate-bounce-sm">
        <Zap className="w-6 h-6 text-white" />
      </div>
      <div className="absolute bottom-3 left-3 w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg shadow-lg flex items-center justify-center animate-pulse-soft">
        <Shield className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>


              
              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl shadow-lg flex items-center justify-center animate-bounce">
                <Zap className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-green-400 to-teal-400 rounded-2xl shadow-lg flex items-center justify-center animate-pulse">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              About <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Lakdhanavi</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Supporting Sri Lanka's premier electricity distribution company with cutting-edge fleet management technology
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-900">
                Powering Progress Through Smart Mobility
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Lakdhanavi (Lanka Electricity Company) serves millions of customers across Sri Lanka, 
                ensuring reliable power distribution. Our Vehicle Management System empowers their fleet 
                operations with real-time tracking, intelligent routing, and comprehensive analytics.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                From emergency response vehicles to routine maintenance fleets, we provide the technological 
                backbone that keeps Lakdhanavi's operations running smoothly, efficiently, and sustainably.
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold text-gray-900">ISO Certified</div>
                    <div className="text-sm text-gray-600">Quality assured operations</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold text-gray-900">Nationwide Coverage</div>
                    <div className="text-sm text-gray-600">Island-wide service</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold text-gray-900">24/7 Operations</div>
                    <div className="text-sm text-gray-600">Round-the-clock support</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold text-gray-900">Eco-Friendly</div>
                    <div className="text-sm text-gray-600">Sustainable solutions</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                  <Target className="w-10 h-10 text-blue-600 mb-4" />
                  <h4 className="font-bold text-gray-900 mb-2">Our Mission</h4>
                  <p className="text-sm text-gray-600">
                    Deliver reliable, efficient fleet management solutions that support critical utility services.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                  <Award className="w-10 h-10 text-purple-600 mb-4" />
                  <h4 className="font-bold text-gray-900 mb-2">Excellence</h4>
                  <p className="text-sm text-gray-600">
                    Committed to the highest standards in service delivery and customer satisfaction.
                  </p>
                </div>
              </div>
              <div className="space-y-6 pt-12">
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl border border-pink-200">
                  <Users className="w-10 h-10 text-pink-600 mb-4" />
                  <h4 className="font-bold text-gray-900 mb-2">Team Power</h4>
                  <p className="text-sm text-gray-600">
                    Skilled professionals dedicated to serving the nation's energy distribution needs.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                  <TrendingUp className="w-10 h-10 text-green-600 mb-4" />
                  <h4 className="font-bold text-gray-900 mb-2">Innovation</h4>
                  <p className="text-sm text-gray-600">
                    Continuously evolving with cutting-edge technology and best practices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Powerful <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage your fleet efficiently and effectively
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<MapPin className="w-8 h-8" />}
              title="Real-Time GPS Tracking"
              description="Monitor your entire fleet in real-time with precise GPS location tracking and route history."
              gradient="from-blue-600 to-purple-600"
            />
            <FeatureCard
              icon={<BarChart3 className="w-8 h-8" />}
              title="Advanced Analytics"
              description="Gain insights with comprehensive reports, fuel analysis, and performance metrics."
              gradient="from-purple-600 to-pink-600"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Enterprise Security"
              description="Bank-level encryption and multi-factor authentication to protect your data."
              gradient="from-pink-600 to-red-600"
            />
            <FeatureCard
              icon={<Smartphone className="w-8 h-8" />}
              title="Mobile Access"
              description="Manage your fleet on-the-go with our responsive mobile-friendly interface."
              gradient="from-green-600 to-teal-600"
            />
            <FeatureCard
              icon={<Settings className="w-8 h-8" />}
              title="Automated Workflows"
              description="Streamline operations with automated approvals, scheduling, and notifications."
              gradient="from-yellow-600 to-orange-600"
            />
            <FeatureCard
              icon={<Clock className="w-8 h-8" />}
              title="24/7 Support"
              description="Round-the-clock technical support and assistance whenever you need it."
              gradient="from-indigo-600 to-blue-600"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 opacity-10"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
             }}></div>
        
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Fleet Management?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join Lakdhanavi in powering efficient, sustainable vehicle operations across Sri Lanka
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/login')}
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 h-14 text-lg font-semibold shadow-xl"
            >
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white/10 px-8 h-14 text-lg font-semibold"
            >
              Contact Sales
              <Mail className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Lakdhanavi</h3>
                  <p className="text-xs text-gray-400">Vehicle Management</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Empowering Sri Lanka's utility services with intelligent fleet management solutions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">System Status</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>support@lakdhanavi.lk</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+94 11 234 5678</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>Sri Lanka</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Lakdhanavi Vehicle Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Add keyframes for animations */}
{/* Add keyframes for animations */}
<style jsx global>{`
  @keyframes blob {
    0%, 100% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
  }
  @keyframes bounce-sm {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }
  @keyframes pulse-soft {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.85; }
  }
  .animate-blob { animation: blob 7s infinite; }
  .animate-bounce-sm { animation: bounce-sm 1.6s infinite; }
  .animate-pulse-soft { animation: pulse-soft 1.8s infinite; }
  .animation-delay-2000 { animation-delay: 2s; }
  .animation-delay-4000 { animation-delay: 4s; }
`}</style>
    </div>
  );
}

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const FeatureCard = ({ icon, title, description, gradient }: FeatureCardProps) => (
  <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200">
    <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white mb-6 shadow-lg`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);