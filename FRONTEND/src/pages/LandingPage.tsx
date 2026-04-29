import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Users, 
  BarChart3, 
  Shield, 
  Clock, 
  TrendingUp,
  Star,
  ChevronRight,
  Mail,
  Sparkles,
  Play
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { useState } from 'react'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setTimeout(() => setSubscribed(false), 3000)
      setEmail('')
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass backdrop-blur-lg">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold gradient-text">Nexus CRM</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="hover:scale-105 transition-transform">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="hover:scale-105 hover:shadow-glow transition-all">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 section-padding relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6 animate-slide-down hover:scale-105 transition-transform cursor-pointer">
              <Sparkles size={16} className="animate-pulse" />
              <span>Trusted by 10,000+ businesses worldwide</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-dark-900 dark:text-dark-50 mb-6 animate-slide-up leading-tight">
              Customer Relationships,{' '}
              <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-600">
                Simplified
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-dark-600 dark:text-dark-400 mb-8 max-w-3xl mx-auto animate-fade-in">
              The modern CRM platform that helps you manage customers, close deals, and grow your business—all in one beautiful interface.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="group hover:scale-105 hover:shadow-glow transition-all duration-300"
                >
                  Start Free Trial
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline"
                className="group hover:scale-105 hover:border-primary-600 hover:text-primary-600 transition-all duration-300"
              >
                <Play size={20} className="group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>
            
            <p className="text-sm text-dark-500 mt-6 animate-fade-in">
              <CheckCircle2 size={16} className="inline mr-1 text-success-500" />
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
          
          {/* Hero Image / Dashboard Preview */}
          <div className="mt-16 relative animate-float group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-500/20 blur-3xl group-hover:blur-2xl transition-all"></div>
            <div className="relative card p-2 shadow-soft-xl group-hover:shadow-glow transition-all duration-300 transform group-hover:scale-[1.02]">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2000&q=80" 
                alt="Dashboard Preview" 
                className="w-full rounded-lg"
              />
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-20 h-20 rounded-full bg-white/90 dark:bg-dark-900/90 flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                  <Play size={32} className="text-primary-600 ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-dark-50 dark:bg-dark-900">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-dark-900 dark:text-dark-50 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
              Powerful features designed for modern teams
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="card p-8 card-hover group cursor-pointer transform hover:-translate-y-2 hover:shadow-glow transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <feature.icon size={24} className="text-primary-600 group-hover:text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold text-dark-900 dark:text-dark-50 mb-2 group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-dark-600 dark:text-dark-400 mb-4">
                  {feature.description}
                </p>
                <button className="text-primary-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all group-hover:translate-x-1">
                  Learn more <ChevronRight size={16} className="group-hover:animate-pulse" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-900 dark:text-dark-50 mb-4">
              Loved by teams everywhere
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="card p-8 hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      className="text-warning-500 fill-current group-hover:scale-110 transition-transform" 
                      style={{ transitionDelay: `${i * 50}ms` }}
                    />
                  ))}
                </div>
                <p className="text-dark-700 dark:text-dark-300 mb-6 italic group-hover:text-dark-900 dark:group-hover:text-dark-100 transition-colors">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author} 
                    className="w-12 h-12 rounded-full ring-2 ring-transparent group-hover:ring-primary-500 transition-all"
                  />
                  <div>
                    <p className="font-semibold text-dark-900 dark:text-dark-50 group-hover:text-primary-600 transition-colors">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-dark-500">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section-padding bg-white dark:bg-dark-950">
        <div className="container-custom">
          {/* Heading */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-dark-900 dark:text-dark-50 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-dark-600 dark:text-dark-400">
              Choose the perfect plan for your growing team. No hidden fees, cancel anytime.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {/* Starter */}
            <div className="card p-8 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary-200 dark:hover:border-primary-900">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-2">
                  Starter
                </h3>
                <p className="text-dark-600 dark:text-dark-400">
                  Perfect for individuals
                </p>
              </div>
              
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-dark-900 dark:text-dark-50">$29</span>
                  <span className="text-dark-500 dark:text-dark-400">/month</span>
                </div>
              </div>

              <Link to="/register">
                <Button className="w-full mb-8" variant="outline">
                  Get Started
                </Button>
              </Link>

              <div className="space-y-4">
                {['Up to 500 contacts', 'Basic analytics', 'Email support', '5 GB storage', 'Mobile app access'].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-primary-600 shrink-0 mt-0.5" />
                    <span className="text-dark-700 dark:text-dark-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Professional - Most Popular */}
            <div className="card p-8 hover:shadow-2xl transition-all duration-300 border-2 border-primary-500 relative transform md:scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-600 text-white text-sm font-semibold rounded-full">
                Most Popular
              </div>
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-2">
                  Professional
                </h3>
                <p className="text-dark-600 dark:text-dark-400">
                  For growing businesses
                </p>
              </div>
              
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-primary-600">$79</span>
                  <span className="text-dark-500 dark:text-dark-400">/month</span>
                </div>
              </div>

              <Link to="/register">
                <Button className="w-full mb-8">
                  Get Started
                </Button>
              </Link>

              <div className="space-y-4">
                {['Up to 5,000 contacts', 'Advanced analytics & reports', 'Priority support', '50 GB storage', 'Team collaboration tools', 'Custom fields & tags', 'API access'].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-primary-600 shrink-0 mt-0.5" />
                    <span className="text-dark-700 dark:text-dark-300 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Enterprise */}
            <div className="card p-8 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary-200 dark:hover:border-primary-900">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-2">
                  Enterprise
                </h3>
                <p className="text-dark-600 dark:text-dark-400">
                  For larger teams
                </p>
              </div>
              
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-dark-900 dark:text-dark-50">$199</span>
                  <span className="text-dark-500 dark:text-dark-400">/month</span>
                </div>
              </div>

              <Link to="/register">
                <Button className="w-full mb-8" variant="outline">
                  Contact Sales
                </Button>
              </Link>

              <div className="space-y-4">
                {['Unlimited contacts', 'Enterprise analytics', '24/7 dedicated support', 'Unlimited storage', 'Advanced security & SSO', 'Custom integrations', 'SLA & compliance'].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-primary-600 shrink-0 mt-0.5" />
                    <span className="text-dark-700 dark:text-dark-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-dark-600 dark:text-dark-400 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>7-day free trial</span>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="section-padding bg-primary-50 dark:bg-dark-900">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
              <Mail size={16} />
              <span>Join 50,000+ subscribers</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-dark-900 dark:text-dark-50 mb-4">
              Stay ahead of the curve
            </h2>
            <p className="text-xl text-dark-600 dark:text-dark-400 mb-8">
              Get weekly insights, tips, and exclusive content delivered to your inbox
            </p>
            
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-xl border-2 border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-950 text-dark-900 dark:text-dark-50 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 outline-none transition-all"
                  required
                />
                <Button 
                  type="submit"
                  size="lg"
                  className="whitespace-nowrap hover:scale-105 hover:shadow-glow transition-all"
                  disabled={subscribed}
                >
                  {subscribed ? (
                    <>
                      <CheckCircle2 size={20} />
                      Subscribed!
                    </>
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight size={20} />
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-dark-500 mt-4">
                <CheckCircle2 size={14} className="inline mr-1" />
                No spam. Unsubscribe at any time.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-dark-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container-custom text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to transform your business?
          </h2>
          <p className="text-xl mb-8 text-dark-300 max-w-2xl mx-auto">
            Join thousands of companies already using Nexus CRM to grow faster
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button 
                size="lg" 
                variant="secondary" 
                className="group hover:scale-105 hover:shadow-glow transition-all"
              >
                Start Free Trial
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/login">
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-dark-900 hover:scale-105 transition-all"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-950 text-dark-400 py-12 border-t border-dark-800">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors">Nexus CRM</span>
            </div>
            <p className="text-sm">
              © 2026 Nexus CRM. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: Users,
    title: 'Customer Management',
    description: 'Organize and track all your customer interactions in one place.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Get insights with beautiful, real-time dashboards and reports.',
  },
  {
    icon: Clock,
    title: 'Activity Tracking',
    description: 'Never miss a follow-up with automated activity tracking.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level security to keep your data safe and compliant.',
  },
  {
    icon: TrendingUp,
    title: 'Sales Pipeline',
    description: 'Visualize and optimize your sales process from lead to close.',
  },
  {
    icon: Zap,
    title: 'Automation',
    description: 'Automate repetitive tasks and focus on what matters most.',
  },
]

const testimonials = [
  {
    quote: 'Nexus CRM transformed how we manage customer relationships. Our team productivity increased by 40%.',
    author: 'Sarah Johnson',
    role: 'CEO at TechCorp',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=0ea5e9&color=fff'
  },
  {
    quote: 'The best CRM we\'ve used. Clean interface, powerful features, and excellent support.',
    author: 'Michael Chen',
    role: 'Sales Director at Growth Inc',
    avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=d946ef&color=fff'
  },
  {
    quote: 'Intuitive and beautiful. Our team adopted it in days, not months.',
    author: 'Emily Rodriguez',
    role: 'Operations Manager at Startup Co',
    avatar: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=22c55e&color=fff'
  },
]
