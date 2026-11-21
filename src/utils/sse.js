const RESET_CHARS = 1000000;

function stripFieldValue(raw) {
  return raw.startsWith(' ') ? raw.slice(1) : raw;
}

export function openSse(url, {
  headers,
  onOpen,
  onEvent,
  onActivity,
  onClose,
  onError,
} = {}) {
  const xhr = new XMLHttpRequest();
  let seen = 0;
  let buffer = '';
  let eventName = '';
  let dataLines = [];
  let httpStatus = 0;
  let opened = false;
  let finished = false;
  let closedByUs = false;

  function resetEvent() {
    eventName = '';
    dataLines = [];
  }

  function dispatchEvent() {
    if (dataLines.length === 0) {
      resetEvent();
      return;
    }
    const message = {
      event: eventName || 'message',
      data: dataLines.join('\n'),
    };
    resetEvent();
    onEvent?.(message);
  }

  function consumeLine(line) {
    if (line === '') {
      dispatchEvent();
      return;
    }
    if (line.startsWith(':')) return;
    const colon = line.indexOf(':');
    const field = colon === -1 ? line : line.slice(0, colon);
    const value = colon === -1 ? '' : stripFieldValue(line.slice(colon + 1));
    if (field === 'event') eventName = value;
    else if (field === 'data') dataLines.push(value);
  }

  function emitClose(status) {
    if (finished || closedByUs) return;
    finished = true;
    onClose?.(status);
    // Aborting a request that already reached DONE clears the error flag
    // before XMLHttpRequest dispatches onerror. Only cut it off early.
    if (!closedByUs && xhr.readyState !== 4) {
      try {
        xhr.abort();
      } catch {
        // The request is already finished.
      }
    }
  }

  function pump(forceActivity) {
    if (finished || closedByUs) return;
    if (httpStatus && httpStatus !== 200) {
      if (forceActivity) onActivity?.();
      return;
    }
    let text = '';
    try {
      text = xhr.responseText || '';
    } catch {
      return;
    }
    if (text.length < seen) {
      seen = 0;
      buffer = '';
      resetEvent();
    }
    let received = false;
    if (text.length > seen) {
      buffer += text.slice(seen);
      seen = text.length;
      received = true;
      const lines = buffer.split(/\r\n|\r|\n/);
      buffer = lines.pop() ?? '';
      for (let i = 0; i < lines.length; i += 1) {
        if (finished || closedByUs) return;
        consumeLine(lines[i]);
      }
    }
    if (finished || closedByUs) return;
    if (seen > RESET_CHARS) {
      emitClose(200);
      return;
    }
    if (forceActivity || received) onActivity?.();
  }

  xhr.open('GET', url);
  Object.entries(headers || {}).forEach(([key, value]) => {
    if (value == null) return;
    const name = key.toLowerCase();
    if (name === 'accept' || name === 'cache-control') return;
    xhr.setRequestHeader(key, String(value));
  });
  xhr.setRequestHeader('Accept', 'text/event-stream');
  xhr.setRequestHeader('Cache-Control', 'no-cache');

  xhr.onprogress = () => {
    pump(true);
  };

  xhr.onreadystatechange = () => {
    if (xhr.readyState === 2) {
      httpStatus = xhr.status;
      if (xhr.status === 200 && !opened && !finished && !closedByUs) {
        opened = true;
        onOpen?.();
      }
      return;
    }
    if (xhr.readyState === 3) {
      pump(false);
      return;
    }
    if (xhr.readyState === 4 && !closedByUs && !finished) {
      emitClose(httpStatus || xhr.status || 0);
    }
  };

  xhr.onerror = () => {
    if (closedByUs) return;
    onError?.();
    if (!finished) emitClose(httpStatus || 0);
  };

  xhr.send();

  return function close() {
    if (closedByUs) return;
    closedByUs = true;
    finished = true;
    try {
      xhr.abort();
    } catch {
      // Already aborted.
    }
  };
}
