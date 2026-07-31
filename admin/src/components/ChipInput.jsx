import React, { useState } from 'react';
import { X } from 'lucide-react';

const ChipInput = ({ label, items, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = inputValue.trim();
      if (val && !items.includes(val)) {
        onChange([...items, val]);
        setInputValue('');
      }
    }
  };

  const removeChip = (indexToRemove) => {
    onChange(items.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="chip-container">
        {items.map((item, index) => (
          <div key={index} className="chip">
            <span>{item}</span>
            <button type="button" onClick={() => removeChip(index)} className="chip-remove">
              <X size={12} />
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={items.length === 0 ? placeholder : 'Add details...'}
          className="chip-input-field"
        />
      </div>
      <small style={{color: 'var(--text-muted)', fontSize: '11px', marginTop: '6px', display: 'block'}}>
        Type value and press <kbd style={{background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '2px 4px', borderRadius: '3px', fontFamily: 'sans-serif', fontSize: '10px'}}>Enter</kbd> to insert
      </small>
    </div>
  );
};

export default ChipInput;
