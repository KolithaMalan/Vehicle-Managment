'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Truck, 
  AlertCircle, 
  Loader2, 
  Shield, 
  MapPin, 
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  CheckCircle,
  Globe,
  BarChart3,
  Zap,
  Clock,
  Home
} from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/dashboard/${data.user.role}`);
        router.refresh();
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '' });
    setError('');
    setShowPassword(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-2 min-h-screen relative">
        {/* Left Side - Branding & Features */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-12 flex items-center justify-center relative overflow-hidden">
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-10"
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               }}></div>

          <div className="max-w-xl w-full relative z-10 space-y-10">
            {/* Logo & Title */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl">
                  <Truck className="w-11 h-11 text-white" />
                </div>
              </div>
              <h1 className="text-5xl font-bold text-white mb-4">
                Lakdhanavi
              </h1>
              <p className="text-2xl text-blue-100 font-light">
                Vehicle Management System
              </p>
              <p className="text-lg text-blue-200 mt-3">
                Empowering Sri Lanka's Utility Services
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
              <FeatureBox
                icon={<MapPin className="w-7 h-7" />}
                title="Real-Time Tracking"
                description="GPS monitoring & route optimization"
              />
              <FeatureBox
                icon={<Shield className="w-7 h-7" />}
                title="Enterprise Security"
                description="Bank-level data protection"
              />
              <FeatureBox
                icon={<BarChart3 className="w-7 h-7" />}
                title="Advanced Analytics"
                description="Comprehensive reporting"
              />
              <FeatureBox
                icon={<Zap className="w-7 h-7" />}
                title="Instant Updates"
                description="Real-time notifications"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">500+</div>
                <div className="text-sm text-blue-100">Vehicles</div>
              </div>
              <div className="text-center border-x border-white/20">
                <div className="text-3xl font-bold text-white">99.9%</div>
                <div className="text-sm text-blue-100">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-sm text-blue-100">Support</div>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="flex items-center justify-center space-x-2 text-blue-100">
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium">Copyright 2025 © Vehicle Management System</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white p-12 flex items-center justify-center relative">
          {/* Back to Home Button */}
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="absolute top-8 left-8 text-gray-600 hover:text-blue-600"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="w-full max-w-md">
            <AuthForm
              isLogin={isLogin}
              showPassword={showPassword}
              formData={formData}
              loading={loading}
              error={error}
              onSubmit={handleSubmit}
              onInputChange={handleInputChange}
              onTogglePassword={togglePasswordVisibility}
              onToggleMode={toggleMode}
            />
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen relative">
        {/* Mobile Header with Gradient */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 px-6 pt-8 pb-12">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="text-white hover:bg-white/10 mb-8"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                <Truck className="w-9 h-9 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Lakdhanavi
            </h1>
            <p className="text-lg text-blue-100">
              Vehicle Management System
            </p>
          </div>
        </div>

        {/* Mobile Form */}
        <div className="bg-white px-6 py-8 min-h-screen -mt-6 rounded-t-3xl relative">
          <AuthForm
            isLogin={isLogin}
            showPassword={showPassword}
            formData={formData}
            loading={loading}
            error={error}
            onSubmit={handleSubmit}
            onInputChange={handleInputChange}
            onTogglePassword={togglePasswordVisibility}
            onToggleMode={toggleMode}
          />
        </div>
      </div>
{/* Animations */}
      {/* Animations */}
      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

// Feature Box Component for Left Panel
interface FeatureBoxProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureBox = ({ icon, title, description }: FeatureBoxProps) => (
  <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
    <div className="text-blue-100 mb-3">{icon}</div>
    <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
    <p className="text-blue-200 text-xs leading-relaxed">{description}</p>
  </div>
);

// Auth Form Component
interface AuthFormProps {
  isLogin: boolean;
  showPassword: boolean;
  formData: {
    name: string;
    email: string;
    password: string;
  };
  loading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTogglePassword: () => void;
  onToggleMode: () => void;
}

const AuthForm = ({
  isLogin,
  showPassword,
  formData,
  loading,
  error,
  onSubmit,
  onInputChange,
  onTogglePassword,
  onToggleMode
}: AuthFormProps) => (
  <div className="space-y-8">
    {/* Form Header */}
    <div className="text-center">
      <h2 className="text-4xl font-bold mb-3">
        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </span>
      </h2>
      <p className="text-gray-600 text-lg">
        {isLogin 
          ? 'Sign in to access your dashboard' 
          : 'Join our fleet management platform'
        }
      </p>
    </div>

    {/* Error Alert */}
    {error && (
      <Alert variant="destructive" className="border-red-200 bg-red-50 animate-shake">
        <AlertCircle className="h-5 w-5" />
        <AlertDescription className="text-red-700 font-medium">{error}</AlertDescription>
      </Alert>
    )}

    {/* Form Card */}
    <Card className="border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <CardContent className="p-8">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Name Field (Register Only) */}
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center">
                <User className="w-4 h-4 mr-2 text-purple-600" />
                Full Name
              </Label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={onInputChange('name')}
                  required={!isLogin}
                  className="h-12 pl-4 text-base border-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl relative"
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center">
              <Mail className="w-4 h-4 mr-2 text-blue-600" />
              Email Address
            </Label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={onInputChange('email')}
                required
                className="h-12 pl-4 text-base border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl relative"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center">
              <Lock className="w-4 h-4 mr-2 text-pink-600" />
              Password
            </Label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={onInputChange('password')}
                required
                className="h-12 pl-4 pr-12 text-base border-2 border-gray-300 focus:border-pink-500 focus:ring-pink-500 rounded-xl relative"
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={onTogglePassword}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold text-base rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl" 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </div>
            ) : (
              <div className="flex items-center justify-center">
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>

    {/* Toggle Login/Register */}
    <div className="text-center">
      <p className="text-gray-600 mb-3">
        {isLogin ? "Don't have an account?" : 'Already have an account?'}
      </p>
      <button
        type="button"
        onClick={onToggleMode}
        className="text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text font-semibold text-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all"
      >
        {isLogin ? 'Create new account →' : '← Sign in instead'}
      </button>
    </div>

    {/* Trust Badges */}
    <div className="flex items-center justify-center flex-wrap gap-6 text-gray-500 text-sm pt-4">
      <div className="flex items-center">
        <Shield className="w-4 h-4 mr-1.5 text-green-600" />
        <span>Secure</span>
      </div>
      <div className="flex items-center">
        <CheckCircle className="w-4 h-4 mr-1.5 text-blue-600" />
        <span>Verified</span>
      </div>
      <div className="flex items-center">
        <Clock className="w-4 h-4 mr-1.5 text-purple-600" />
        <span>24/7 Support</span>
      </div>
    </div>
  </div>
);