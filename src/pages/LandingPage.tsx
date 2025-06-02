import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, CheckCircle, BarChart, Sparkles, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-accent-50 opacity-70"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo and Auth Buttons */}
          <div className="flex justify-end items-center py-4 space-x-4">
            <Link to="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary">Sign up</Button>
            </Link>
          </div>
          <div className="absolute top-20 right-8">
            <img src="/boltLogo.jpg" alt="Bolt Logo" className="w-12 h-12" />
          </div>
          
          <div className="text-center py-24 md:py-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight">
                <span className="block">Transform Your Productivity with</span>
                <span className="block text-primary-600">AI-Powered Task Planning</span>
              </h1>
              
              <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
                TaskMind uses advanced AI to organize your tasks, identify priorities, and optimize your workflow based on your personal habits and preferences.
              </p>
              
              <div className="mt-10 flex justify-center gap-4">
                <Link to="/register">
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
                    Get Started
                  </Button>
                </Link>
                
                <Link to="/login">
                  <Button variant="ghost" size="lg">
                    Sign In
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Intelligent Features</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              TaskMind adapts to your working style and gets smarter the more you use it.
            </p>
          </div>
          
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
            >
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">AI Task Prioritization</h3>
              <p className="mt-2 text-gray-600">
                Our intelligent algorithm analyzes your tasks and automatically prioritizes them based on deadlines, importance, and your work patterns.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
            >
              <div className="h-12 w-12 rounded-full bg-secondary-100 flex items-center justify-center mb-4">
                <BarChart className="h-6 w-6 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Productivity Insights</h3>
              <p className="mt-2 text-gray-600">
                Get personalized insights into your productivity patterns, with suggestions to optimize your workflow and increase efficiency.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
            >
              <div className="h-12 w-12 rounded-full bg-accent-100 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Adaptive Learning</h3>
              <p className="mt-2 text-gray-600">
                TaskMind learns from your behavior and preferences over time, making increasingly accurate suggestions that align with your working style.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Testimonials */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">What Our Users Say</h2>
          </div>
          
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                  JD
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">John Doe</h4>
                  <p className="text-sm text-gray-600">Product Manager</p>
                </div>
              </div>
              <p className="text-gray-600">
                "TaskMind has completely transformed how I manage my team's projects. The AI suggestions are surprisingly accurate and have helped us optimize our workflow."
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-700 font-bold">
                  AS
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Alice Smith</h4>
                  <p className="text-sm text-gray-600">Freelance Designer</p>
                </div>
              </div>
              <p className="text-gray-600">
                "As a freelancer juggling multiple clients, TaskMind helps me prioritize effectively. I love how it adapts to my working style and suggests optimal time slots."
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-bold">
                  MJ
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Michael Johnson</h4>
                  <p className="text-sm text-gray-600">Software Engineer</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The productivity insights are game-changing. TaskMind identified that I'm most productive in the morning, so I now schedule my most demanding tasks before noon."
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Transform Your Productivity?</h2>
          <p className="mt-4 text-xl text-primary-100 max-w-2xl mx-auto">
            Join thousands of professionals who use TaskMind to work smarter, not harder.
          </p>
          
          <div className="mt-8">
            <Link to="/register">
              <Button variant="secondary" size="lg">
                Get Started for Free
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 flex justify-center space-x-8">
            <div className="flex items-center text-primary-100">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Free 14-day trial</span>
            </div>
            <div className="flex items-center text-primary-100">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center text-primary-100">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">TaskMind</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Guides</a></li>
                <li><a href="#" className="hover:text-white">API Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white">GDPR</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-white">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white">Facebook</a></li>
                <li><a href="#" className="hover:text-white">GitHub</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-primary-500 mr-2" />
              <span className="text-lg font-bold text-white">TaskMind</span>
            </div>
            
            <p className="mt-4 md:mt-0 text-sm">
              &copy; {new Date().getFullYear()} TaskMind. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;