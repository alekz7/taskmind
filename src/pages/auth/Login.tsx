import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Brain, LogIn, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '../../store/authStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card, { CardContent } from '../../components/ui/Card';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, error, clearError, loading } = useAuthStore();
  const { t } = useTranslation(['auth', 'common']);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const validateForm = (): boolean => {
    let isValid = true;
    
    // Clear previous errors
    setEmailError('');
    setPasswordError('');
    clearError();
    
    // Validate email
    if (!email.trim()) {
      setEmailError(t('validation.required', { field: t('login.email') }));
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(t('validation.email'));
      isValid = false;
    }
    
    // Validate password
    if (!password.trim()) {
      setPasswordError(t('validation.required', { field: t('login.password') }));
      isValid = false;
    }
    
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the store
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center">
            <Brain className="h-12 w-12 text-primary-500" />
          </Link>
        </div>
        <h2 className="mt-3 text-center text-3xl font-bold text-gray-900">
          {t('login.title')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('login.subtitle')}{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            {t('register.title')}
          </Link>
        </p>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="px-4 py-8 sm:px-10">
              {error && (
                <div className="mb-4 p-3 bg-error-50 text-error-800 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                  label={t('login.email')}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('login.email')}
                  leftIcon={<Mail size={18} />}
                  error={emailError}
                  fullWidth
                  autoFocus
                />
                
                <Input
                  label={t('login.password')}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.password')}
                  leftIcon={<Lock size={18} />}
                  error={passwordError}
                  fullWidth
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      {t('login.rememberMe')}
                    </label>
                  </div>
                  
                  <div className="text-sm">
                    <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                      {t('login.forgotPassword')}
                    </a>
                  </div>
                </div>
                
                <div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    leftIcon={<LogIn size={18} />}
                    isLoading={loading}
                    fullWidth
                  >
                    {t('login.submit')}
                  </Button>
                </div>
              </form>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      {t('login.demoAccount.title')}
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 text-center text-sm text-gray-600">
                  <p>{t('login.demoAccount.email')}</p>
                  <p>{t('login.demoAccount.password')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;