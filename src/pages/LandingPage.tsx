import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, CheckCircle, BarChart, Sparkles, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button';

const LandingPage: React.FC = () => {
  const { t } = useTranslation(['landing', 'common']);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-accent-50 opacity-70"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight">
                <span className="block">{t('hero.title.line1')}</span>
                <span className="block text-primary-600">{t('hero.title.line2')}</span>
              </h1>
              
              <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
                {t('hero.description')}
              </p>
              
              <div className="mt-10 flex justify-center gap-4">
                <Link to="/register">
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
                    {t('common:navigation.signUp')}
                  </Button>
                </Link>
                
                <Link to="/login">
                  <Button variant="ghost" size="lg">
                    {t('common:navigation.signIn')}
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
            <h2 className="text-3xl font-bold text-gray-900">{t('features.title')}</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              {t('features.subtitle')}
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
              <h3 className="text-xl font-semibold text-gray-900">{t('features.aiPrioritization.title')}</h3>
              <p className="mt-2 text-gray-600">{t('features.aiPrioritization.description')}</p>
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
              <h3 className="text-xl font-semibold text-gray-900">{t('features.productivityInsights.title')}</h3>
              <p className="mt-2 text-gray-600">{t('features.productivityInsights.description')}</p>
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
              <h3 className="text-xl font-semibold text-gray-900">{t('features.adaptiveLearning.title')}</h3>
              <p className="mt-2 text-gray-600">{t('features.adaptiveLearning.description')}</p>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Testimonials */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">{t('testimonials.title')}</h2>
          </div>
          
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                  JD
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">{t('testimonials.users.john.name')}</h4>
                  <p className="text-sm text-gray-600">{t('testimonials.users.john.role')}</p>
                </div>
              </div>
              <p className="text-gray-600">{t('testimonials.users.john.quote')}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-700 font-bold">
                  AS
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">{t('testimonials.users.alice.name')}</h4>
                  <p className="text-sm text-gray-600">{t('testimonials.users.alice.role')}</p>
                </div>
              </div>
              <p className="text-gray-600">{t('testimonials.users.alice.quote')}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-bold">
                  MJ
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">{t('testimonials.users.michael.name')}</h4>
                  <p className="text-sm text-gray-600">{t('testimonials.users.michael.role')}</p>
                </div>
              </div>
              <p className="text-gray-600">{t('testimonials.users.michael.quote')}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">{t('cta.title')}</h2>
          <p className="mt-4 text-xl text-primary-100 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>
          
          <div className="mt-8">
            <Link to="/register">
              <Button variant="secondary" size="lg">
                {t('cta.button')}
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 flex justify-center space-x-8">
            <div className="flex items-center text-primary-100">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>{t('cta.features.trial')}</span>
            </div>
            <div className="flex items-center text-primary-100">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>{t('cta.features.noCard')}</span>
            </div>
            <div className="flex items-center text-primary-100">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>{t('cta.features.cancel')}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">{t('footer.sections.company.title')}</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">{t('footer.sections.company.links.about')}</a></li>
                <li><a href="#" className="hover:text-white">{t('footer.sections.company.links.features')}</a></li>
                <li><a href="#" className="hover:text-white">{t('footer.sections.company.links.pricing')}</a></li>
                <li><a href="#" className="hover:text-white">{t('footer.sections.company.links.careers')}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">{t('footer.sections.resources.title')}</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">{t('footer.sections.resources.links.blog')}</a></li>
                <li><a href="#" className="hover:text-white">{t('footer.sections.resources.links.help')}</a></li>
                <li><a href="#" className="hover:text-white">{t('footer.sections.resources.links.guides')}</a></li>
                <li><a href="#" className="hover:text-white">{t('footer.sections.resources.links.api')}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">{t('footer.sections.legal.title')}</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">{t('footer.sections.legal.links.privacy')}</a></li>
                <li><a href="#" className="hover:text-white">{t('footer.sections.legal.links.terms')}</a></li>
                <li><a href="#" className="hover:text-white">{t('footer.sections.legal.links.cookie')}</a></li>
                <li><a href="#" className="hover:text-white">{t('footer.sections.legal.links.gdpr')}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">{t('footer.sections.connect.title')}</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">{t('footer.sections.connect.links.twitter')}</a></li>
                <li><a href="#" className="hover:text-white">{t('footer.sections.connect.links.linkedin')}</a></li>
                <li><a href="#" className="hover:text-white">{t('footer.sections.connect.links.facebook')}</a></li>
                <li><a href="#" className="hover:text-white">{t('footer.sections.connect.links.github')}</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-primary-500 mr-2" />
              <span className="text-lg font-bold text-white">{t('common:app.name')}</span>
            </div>
            
            <p className="mt-4 md:mt-0 text-sm">
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;