import React, { useState, useEffect } from 'react';
import './Timer.css';

interface TimerProps {
  refreshKey: any; 
}

const Timer: React.FC<TimerProps> = ({ refreshKey }) => {
  const [currentDateTime, setCurrentDateTime] = useState<string>('21.12.2012');

  useEffect(() => {
    console.log('Компонент смонтирован с датой:', currentDateTime);
  }, []); 

  useEffect(() => {
    console.log('Компонент обновлен из-за изменения refreshKey');
    setCurrentDateTime(new Date().toLocaleString());
  }, [refreshKey]); 

  return (
    <div className="timer-container">
      <p className="timer-text">{currentDateTime}</p>
    </div>
  );
};

export default Timer;
