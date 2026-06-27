// src/WaveformDisplay.js
import React, { useRef, useEffect, useState } from 'react';

const WaveformDisplay = ({ text, start = 0, end = 10 }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [parsedData, setParsedData] = useState([]);

  // Fixed width per time step (pixels)
  const BIT_WIDTH = 30;

  // Parse the text content (same as before)
  useEffect(() => {
    if (!text) return;
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const data = [];
    const regex = /^(\d+)(?:\(([^)]+)\))?\s+(\w+)\s+:\s+([01]+)$/;
    for (const line of lines) {
      const trimmed = line.trim();
      const match = trimmed.match(regex);
      if (match) {
        const index = parseInt(match[1]);
        const label = match[2] || `Node ${index}`;
        const type = match[3];
        const binary = match[4];
        data.push({ index, label, type, binary });
      }
    }
    setParsedData(data);
  }, [text]);

  // Draw the waveform based on parsedData and start/end range
  useEffect(() => {
    if (parsedData.length === 0) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Clamp and validate start/end
    let s = Math.max(0, start);
    let e = Math.max(s, end);
    const numTimePoints = e - s + 1; // inclusive

    // ---- Configuration ----
    const rowHeight = 32;
    const labelWidth = 150;
    const topMargin = 30;
    const bottomMargin = 25;
    const leftMargin = 10;
    const rightMargin = 10;

    const numSignals = parsedData.length;

    // Total width based on fixed BIT_WIDTH
    const totalWidth = labelWidth + numTimePoints * BIT_WIDTH + leftMargin + rightMargin;
    const totalHeight = topMargin + numSignals * rowHeight + bottomMargin;

    canvas.width = totalWidth;
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, totalWidth, totalHeight);

    // ---- Color palette ----
    const typeColors = {
      INPUT: '#2e7d32',
      HIDDEN: '#ed6c02',
      OUTPUT: '#c62828',
    };
    const defaultColor = '#1976d2';

    // ---- Grid lines ----
    ctx.strokeStyle = '#eef2f7';
    ctx.lineWidth = 1;
    for (let i = 0; i <= numSignals; i++) {
      const y = topMargin + i * rowHeight;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(totalWidth, y);
      ctx.stroke();
    }

    // ---- Draw each signal ----
    parsedData.forEach((signal, rowIndex) => {
      const yBase = topMargin + rowIndex * rowHeight + rowHeight / 2;
      const yTop = topMargin + rowIndex * rowHeight;

      // Label
      ctx.font = '13px "Inter", "Segoe UI", sans-serif';
      ctx.fillStyle = '#1e2b3c';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const label = `${signal.label} (${signal.type})`;
      ctx.fillText(label, labelWidth - 8, yBase);

      // Build the displayed binary string (slice + pad)
      const fullBinary = signal.binary;
      let displayedBits = '';
      for (let i = s; i <= e; i++) {
        displayedBits += (i < fullBinary.length ? fullBinary[i] : '0');
      }

      // Draw pulses (each BIT_WIDTH wide)
      const bits = displayedBits.split('');
      bits.forEach((bit, colIndex) => {
        const x = labelWidth + colIndex * BIT_WIDTH;
        const isHigh = bit === '1';
        ctx.fillStyle = isHigh ? (typeColors[signal.type] || defaultColor) : '#e9edf4';
        ctx.fillRect(x, yTop + 3, BIT_WIDTH - 1, rowHeight - 6);

        ctx.strokeStyle = '#d0d8e3';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, yTop + 3, BIT_WIDTH - 1, rowHeight - 6);
      });
    });

    // ---- Time axis (from s to e) ----
    ctx.font = '11px "Inter", sans-serif';
    ctx.fillStyle = '#5e6f88';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const timeY = topMargin + numSignals * rowHeight + 4;
    for (let i = 0; i <= numTimePoints; i++) {
      const x = labelWidth + i * BIT_WIDTH;
      const timeLabel = s + i;
      ctx.fillText(timeLabel, x, timeY);
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = '#5e6f88';
    ctx.font = '10px "Inter", sans-serif';
    ctx.fillText('Time step', labelWidth, topMargin - 18);

    // Set canvas size and ensure it's displayed
    canvas.style.width = totalWidth + 'px';
    canvas.style.height = totalHeight + 'px';

  }, [parsedData, start, end]);

  if (parsedData.length === 0) {
    return <div className="waveform-placeholder">No waveform data available.</div>;
  }

  return (
    <div ref={containerRef} className="waveform-container">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default WaveformDisplay;