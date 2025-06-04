import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Brain, UserPlus, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '../../store/authStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card, { CardContent } from '../../components/ui/Card';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, error, clearError, loading } = useAuthStore();
  const { t } = useTranslation(['auth', 'common']);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const validateForm = (): boolean => {
    let isValid = true;
    
    // Clear previous errors
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    clearError();
    
    // Validate name
    if (!name.trim()) {
      setNameError(t('validation.required', { field: t('register.name') }));
      isValid = false;
    }
    
    // Validate email
    if (!email.trim()) {
      setEmailError(t('validation.required', { field: t('register.email') }));
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(t('validation.email'));
      isValid = false;
    }
    
    // Validate password
    if (!password.trim()) {
      setPasswordError(t('validation.required', { field: t('register.password') }));
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError(t('validation.passwordLength'));
      isValid = false;
    }
    
    // Validate confirm password
    if (password !== confirmPassword) {
      setConfirmPasswordError(t('validation.passwordMatch'));
      isValid = false;
    }
    
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await register({ name, email, password });
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
          {t('register.title')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('register.subtitle')}{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            {t('login.title')}
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
                  label={t('register.name')}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('register.name')}
                  leftIcon={<User size={18} />}
                  error={nameError}
                  fullWidth
                  autoFocus
                />
                
                <Input
                  label={t('register.email')}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('register.email')}
                  leftIcon={<Mail size={18} />}
                  error={emailError}
                  fullWidth
                />
                
                <Input
                  label={t('register.password')}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('register.password')}
                  leftIcon={<Lock size={18} />}
                  error={passwordError}
                  fullWidth
                />
                
                <Input
                  label={t('register.confirmPassword')}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('register.confirmPassword')}
                  leftIcon={<Lock size={18} />}
                  error={confirmPasswordError}
                  fullWidth
                />
                
                <div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    leftIcon={<UserPlus size={18} />}
                    isLoading={loading}
                    fullWidth
                  >
                    {t('register.submit')}
                  </Button>
                </div>
              </form>
              
              <div className="mt-6">
                <p className="text-center text-sm text-gray-600">
                  {t('register.terms')}{' '}
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                    {t('register.termsLink')}
                  </a>{' '}
                  {t('register.and')}{' '}
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                    {t('register.privacyLink')}
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;