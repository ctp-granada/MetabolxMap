/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import { METABOLIX_TEMPLATE } from './metabolixTemplate';
import { initMetabolix } from './metabolixEngine.js';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = METABOLIX_TEMPLATE;
    initMetabolix();
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
