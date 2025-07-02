import React from 'react';

interface SpecialNameDisplayProps {
  text: string;
  className?: string;
}

const SpecialNameDisplay: React.FC<SpecialNameDisplayProps> = ({ text, className = '' }) => {
  // Define the special names to highlight with their unique classes
  const specialNames = [
    { name: 'NEHA SHARMA', className: 'neha-sharma' },
    { name: 'PIYUSH RANJAN', className: 'piyush-ranjan' },
    { name: 'WORKSBEYOND', className: 'worksbeyond' }
  ];

  // Create a regex pattern that matches any of the special names
  const specialNamesRegex = new RegExp(
    specialNames.map(name => name.name).join('|'),
    'gi'
  );

  // If no special names are found, return the text as is
  if (!specialNamesRegex.test(text)) {
    return <span className={className}>{text}</span>;
  }

  // Split the text into parts, keeping the special names as separate parts
  const parts = [];
  let lastIndex = 0;
  let match;
  
  // Reset the regex state
  specialNamesRegex.lastIndex = 0;
  
  while ((match = specialNamesRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({
        text: text.substring(lastIndex, match.index),
        isSpecial: false
      });
    }
    
    // Add the matched special name
    parts.push({
      text: match[0],
      isSpecial: true
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add any remaining text after the last match
  if (lastIndex < text.length) {
    parts.push({
      text: text.substring(lastIndex),
      isSpecial: false
    });
  }
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.isSpecial) {
          // Find which special name was matched (case insensitive)
          const matchedName = specialNames.find(name => 
            name.name.toLowerCase() === part.text.toLowerCase()
          );
          
          return (
            <span key={index} className={`special-name ${matchedName?.className || ''}`}>
              {part.text}
            </span>
          );
        }
        return <React.Fragment key={index}>{part.text}</React.Fragment>;
      })}
    </span>
  );
};

export default SpecialNameDisplay;
