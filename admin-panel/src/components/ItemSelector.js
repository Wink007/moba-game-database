import React, { useState, useRef, useEffect } from 'react';

function ItemSelector({ items, value, onChange, placeholder = "Виберіть предмет", compact = false, borderColor = '#3b82f6', size = 'normal' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const selectedItem = items.find(i => i.id === value);
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Size configurations
  const sizeConfig = size === 'small' 
    ? { container: 64, image: 56, border: 2, shadow: '0 2px 4px', shadowHover: '0 4px 8px' }
    : { container: 80, image: 72, border: 3, shadow: '0 4px 6px', shadowHover: '0 8px 12px' };

  // Compact mode styles
  if (compact) {
    return (
      <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            cursor: 'pointer',
            width: `${sizeConfig.container}px`,
            height: `${sizeConfig.container}px`,
            border: `${sizeConfig.border}px solid ${selectedItem ? borderColor : '#e5e7eb'}`,
            borderRadius: '10px',
            background: selectedItem ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' : '#f9fafb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            overflow: 'hidden',
            boxShadow: selectedItem ? `${sizeConfig.shadow} ${borderColor}40` : `${sizeConfig.shadow} rgba(0,0,0,0.1)`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = borderColor;
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `${sizeConfig.shadowHover} ${borderColor}60`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = selectedItem ? borderColor : '#e5e7eb';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = selectedItem ? `${sizeConfig.shadow} ${borderColor}40` : `${sizeConfig.shadow} rgba(0,0,0,0.1)`;
          }}
          title={selectedItem ? selectedItem.name : placeholder}
        >
          {selectedItem ? (
            <img
              src={selectedItem.icon_url}
              alt={selectedItem.name}
              style={{
                width: `${sizeConfig.image}px`,
                height: `${sizeConfig.image}px`,
                objectFit: 'cover'
              }}
            />
          ) : (
            <span style={{ fontSize: size === 'small' ? '1.2rem' : '1.5rem', color: '#d1d5db', fontWeight: '700' }}>{placeholder}</span>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            zIndex: 1000,
            width: '250px',
            maxHeight: '300px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Search Input */}
            <div style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Пошук..."
                autoFocus
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Items List */}
            <div style={{ overflowY: 'auto', maxHeight: '240px' }}>
              {value && (
                <div
                  onClick={() => {
                    onChange(null);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  style={{
                    padding: '8px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f3f4f6',
                    fontSize: '0.75rem',
                    color: '#ef4444',
                    background: '#fef2f2'
                  }}
                >
                  ✕ Очистити вибір
                </div>
              )}
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onChange(item.id);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    style={{
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      background: value === item.id ? '#eff6ff' : 'white',
                      borderBottom: '1px solid #f3f4f6'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = value === item.id ? '#eff6ff' : 'white'}
                  >
                    <img
                      src={item.icon_url}
                      alt={item.name}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '4px',
                        flexShrink: 0
                      }}
                    />
                    <span style={{ fontSize: '0.75rem', flex: 1 }}>{item.name}</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '0.75rem' }}>
                  Нічого не знайдено
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Original mode
  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%', minWidth: 0 }}>
      {/* Selected Item Display - Image Only */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '4px',
          border: '2px solid #d1d5db',
          borderRadius: '8px',
          cursor: 'pointer',
          background: selectedItem ? 'white' : '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '56px',
          width: '100%',
          boxSizing: 'border-box',
          minWidth: 0,
          transition: 'all 0.2s',
          position: 'relative'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = '#3b82f6';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = '#d1d5db';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title={selectedItem ? selectedItem.name : placeholder}
      >
        {selectedItem ? (
          <img
            src={selectedItem.icon_url}
            alt={selectedItem.name}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '6px',
              objectFit: 'cover'
            }}
          />
        ) : (
          <span style={{ fontSize: '1.5rem', color: '#9ca3af' }}>+</span>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          zIndex: 1000,
          maxHeight: '300px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Search Input */}
          <div style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Пошук..."
              autoFocus
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.75rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Items List */}
          <div style={{ overflowY: 'auto', maxHeight: '240px' }}>
            {value && (
              <div
                onClick={() => {
                  onChange(null);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                style={{
                  padding: '8px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '0.75rem',
                  color: '#ef4444',
                  background: '#fef2f2'
                }}
              >
                ✕ Очистити вибір
              </div>
            )}
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    onChange(item.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  style={{
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    background: value === item.id ? '#eff6ff' : 'white',
                    borderBottom: '1px solid #f3f4f6'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = value === item.id ? '#eff6ff' : 'white'}
                >
                  <img
                    src={item.icon_url}
                    alt={item.name}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '4px',
                      flexShrink: 0
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', flex: 1 }}>{item.name}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '0.75rem' }}>
                Нічого не знайдено
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemSelector;
