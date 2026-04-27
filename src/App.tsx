import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/controllers/context/AuthContext';
import { BookingProvider } from '@/controllers/context/BookingContext';
import { ThemeProvider } from '@/controllers/context/ThemeContext';
import AppRouter from "@/routes/AppRouter";

const App: React.FC = () => {
  return (
    
    <ThemeProvider>
      <AuthProvider>
        <BookingProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </BookingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;











