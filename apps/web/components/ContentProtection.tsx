'use client';

import { useEffect } from 'react';

function isEditableElement(el: EventTarget | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false;
  const tagName = el.tagName.toUpperCase();
  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') return true;
  if (el.isContentEditable) return true;
  if (el.closest('input, textarea, select, [contenteditable="true"]')) return true;
  return false;
}

export default function ContentProtection() {
  useEffect(() => {
    // 1. Prevent selecting text outside form inputs
    const handleSelectStart = (e: Event) => {
      if (!isEditableElement(e.target)) {
        e.preventDefault();
      }
    };

    // 2. Prevent copying text outside form inputs
    const handleCopy = (e: ClipboardEvent) => {
      if (!isEditableElement(e.target)) {
        e.preventDefault();
      }
    };

    // 3. Prevent cutting text outside form inputs
    const handleCut = (e: ClipboardEvent) => {
      if (!isEditableElement(e.target)) {
        e.preventDefault();
      }
    };

    // 4. Prevent dragging images or text
    const handleDragStart = (e: DragEvent) => {
      if (!isEditableElement(e.target)) {
        e.preventDefault();
      }
    };

    // 5. Intercept Ctrl+C / Cmd+C when outside editable elements
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'c' || e.key === 'C' || e.key === 'x' || e.key === 'X')
      ) {
        if (!isEditableElement(e.target)) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
}
