import { createContext } from 'react';
import React, { useState } from 'react';
import { lightTheme, darkTheme } from '../themes';


const ThemeContext = createContext();


export const  ThemeProvider =  ThemeContext.Provider// ({ children }) => {
/*   const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider 
    >
      {children}
    </ThemeContext.Provider>
  );
};
 */

export default ThemeContext