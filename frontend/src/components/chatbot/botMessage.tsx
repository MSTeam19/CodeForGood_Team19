import React from 'react';

function BotMessage({ text }: { text: string }) {
  const containsList = text.includes('\n\n•');

  if (!containsList) {
    return <div dangerouslySetInnerHTML={{ __html: text }} />;
  }

  const parts = text.split('\n\n');
  const intro = parts[0];
  
  const listItems = parts[1].split('\n').filter(item => item.trim() !== '');

  return (
    <div>
      <p dangerouslySetInnerHTML={{ __html: intro }} />

      <ul className="bot-list">
        {listItems.map((item, index) => (
          <li key={index}>{item.substring(2)}</li>
        ))}
      </ul>
    </div>
  );
}

export default BotMessage;