import React, { useState, useEffect } from 'react';
import './Timer.css'
const Timer: React.FC = () => {
  const [currentDateTime, setCurrentDateTime] = useState<string>(new Date().toLocaleString());

  
  useEffect(() => {
    console.log("Компонент монтирован или обновлен");
    setCurrentDateTime(new Date().toLocaleString());
    // const intervalId = setInterval(() => {
    //   setCurrentDateTime(new Date().toLocaleString());
    // }, 1000);

    return () => {
      console.log("Компонент размонтирован");
    //   clearInterval(intervalId); 
    };
  }, []); 

  return (
    <div className='timer-container'>
      <p className='timer-text'>{currentDateTime}</p>
    </div>
  );
};

export default Timer;
