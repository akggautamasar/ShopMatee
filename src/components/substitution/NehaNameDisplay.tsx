
import React from 'react';

interface NehaNameDisplayProps {
  text: string;
  className?: string;
}

const NehaNameDisplay: React.FC<NehaNameDisplayProps> = ({ text, className = '' }) => {
  // Check if the text contains "NEHA SHARMA" (case insensitive)
  const nehaRegex = /NEHA\s+SHARMA/gi;
  
  if (!nehaRegex.test(text)) {
    return <span className={className}>{text}</span>;
  }
  
  // Replace all instances of NEHA SHARMA with the special styled version
  const parts = text.split(nehaRegex);
  const matches = text.match(nehaRegex) || [];
  
  return (
    <span className={className}>
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {part}
          {matches[index] && (
            <span className="neha-sharma-special">
              {matches[index]}
            </span>
          )}
        </React.Fragment>
      ))}
    </span>
  );
};

export default NehaNameDisplay;
