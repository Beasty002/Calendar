import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, FileText } from 'lucide-react';

export const NavigationButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isCalendar = location.pathname === '/';

  const toggleView = () => {
    if (isCalendar) {
      navigate('/form-builder');
    } else {
      navigate('/');
    }
  };

  return (
    <Button
      className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg z-50"
      onClick={toggleView}
      size="icon"
    >
      {isCalendar ? <FileText size={24} /> : <Calendar size={24} />}
    </Button>
  );
};
