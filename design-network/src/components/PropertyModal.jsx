import React, { useState } from 'react';

const PropertyModal = ({
  isOpen,
  onClose,
  onConfirm,
  propertyDefs,   // array of { name, min, max }
  discrete,
  targetType,     // 'node' or 'edge'
  mode,           // 'single' or 'all'
}) => {
  const [selectedProp, setSelectedProp] = useState('');
  const [value, setValue] = useState('');

  // When modal opens, reset selection and set default to first prop with max value
  React.useEffect(() => {
    if (isOpen && propertyDefs.length > 0) {
      const first = propertyDefs[0];
      setSelectedProp(first.name);
      setValue(discrete ? String(Math.round(first.max)) : String(first.max));
    }
  }, [isOpen, propertyDefs, discrete]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const propDef = propertyDefs.find(p => p.name === selectedProp);
    if (!propDef) return;

    const numVal = parseFloat(value);
    if (isNaN(numVal)) {
      alert('Please enter a valid number.');
      return;
    }
    if (discrete && !Number.isInteger(numVal)) {
      alert('Value must be an integer.');
      return;
    }
    if (numVal < propDef.min || numVal > propDef.max) {
      alert(`Value must be between ${propDef.min} and ${propDef.max}.`);
      return;
    }

    onConfirm(selectedProp, numVal);
    onClose();
  };

  const handlePropChange = (e) => {
    const name = e.target.value;
    setSelectedProp(name);
    const propDef = propertyDefs.find(p => p.name === name);
    if (propDef) {
      const defaultVal = discrete ? Math.round(propDef.max) : propDef.max;
      setValue(String(defaultVal));
    }
  };

  const valueType = discrete ? 'integer' : 'number';

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }} onClick={onClose}>
      <div className="modal-content" style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '28px 32px',
        minWidth: '400px',
        maxWidth: '480px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        position: 'relative',
      }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1e293b', fontSize: '1.2rem', fontWeight: 600 }}>
          {mode === 'all' ? `Set All ${targetType} Properties` : `Set ${targetType} Property`}
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: '6px', fontSize: '0.9rem', color: '#334155' }}>
            Property name
          </label>
          <select
            value={selectedProp}
            onChange={handlePropChange}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d0d8e0',
              fontSize: '0.95rem',
              background: '#fff',
            }}
          >
            {propertyDefs.map(p => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: '6px', fontSize: '0.9rem', color: '#334155' }}>
            Value
            <span style={{ fontWeight: 400, color: '#6b7a8e', marginLeft: '8px' }}>
              ({valueType}, min: {propertyDefs.find(p => p.name === selectedProp)?.min ?? '–'}, max: {propertyDefs.find(p => p.name === selectedProp)?.max ?? '–'})
            </span>
          </label>
          <input
            type="text"
            defaultValue=""
            onChange={(e) => setValue(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d0d8e0',
              fontSize: '0.95rem',
            }}
            placeholder={`Enter ${valueType}`}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: '1px solid #d0d8e0',
            background: '#f1f4f9',
            cursor: 'pointer',
            fontWeight: 500,
          }}>Cancel</button>
          <button onClick={handleConfirm} style={{
            padding: '8px 24px',
            borderRadius: '6px',
            border: 'none',
            background: '#1e3a5f',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 500,
          }}>Apply</button>
        </div>
      </div>
    </div>
  );
};

export default PropertyModal;