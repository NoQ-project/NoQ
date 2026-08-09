import React from 'react';
import { Calendar } from 'lucide-react';

export default function DatePicker({ value, onChange, minDate }) {
  return (
    <div style={{ marginTop: '1rem' }}>
      <label 
        className="form-label" 
        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600' }}
      >
        <Calendar size={15} /> Select Booking Date
      </label>
      <input 
        type="date" 
        value={value}
        min={minDate || new Date().toISOString().split('T')[0]}
        onChange={(e) => onChange(e.target.value)}
        required
        className="form-input"
        style={{
          width: '100%',
          padding: '0.6rem 0.8rem',
          borderRadius: '6px',
          border: '1px solid #d1d5db',
          marginTop: '0.3rem'
        }}
      />
    </div>
  );
}