import yaml from 'js-yaml';

// YAML/JSON conversion
export function yamlToJson(yamlString: string): string {
  try {
    const parsed = yaml.load(yamlString);
    return JSON.stringify(parsed, null, 2);
  } catch (error) {
    throw new Error(`YAML parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function jsonToYaml(jsonString: string): string {
  try {
    const parsed = JSON.parse(jsonString);
    return yaml.dump(parsed, { indent: 2 });
  } catch (error) {
    throw new Error(`JSON parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// CSV/JSON conversion
export function jsonToCsv(jsonString: string): string {
  try {
    const data = JSON.parse(jsonString);
    if (!Array.isArray(data)) {
      throw new Error('JSON must be an array of objects');
    }

    if (data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && (value.includes(',') || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  } catch (error) {
    throw new Error(`JSON to CSV conversion error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function csvToJson(csvString: string): string {
  try {
    const lines = csvString.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const obj: any = {};

      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });

      result.push(obj);
    }

    return JSON.stringify(result, null, 2);
  } catch (error) {
    throw new Error(`CSV to JSON conversion error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Color conversion utilities
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error('Invalid hex color');
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

// Lorem Ipsum generator
export function generateLoremIpsum(paragraphs: number, wordsPerParagraph: number): string {
  const words = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
  ];

  const result = [];

  for (let p = 0; p < paragraphs; p++) {
    const paragraph = [];
    for (let w = 0; w < wordsPerParagraph; w++) {
      const word = words[Math.floor(Math.random() * words.length)];
      paragraph.push(w === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word);
    }
    result.push(paragraph.join(' ') + '.');
  }

  return result.join('\n\n');
}

// String analysis
export function analyzeString(text: string) {
  const lines = text.split('\n');
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;

  // Calculate byte size (UTF-8 encoding)
  const byteSize = new TextEncoder().encode(text).length;

  // Character frequency
  const charFreq: { [key: string]: number } = {};
  for (const char of text) {
    charFreq[char] = (charFreq[char] || 0) + 1;
  }

  return {
    characters,
    charactersNoSpaces,
    words: words.length,
    lines: lines.length,
    sentences: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
    averageWordsPerSentence: words.length / text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 0,
    mostFrequentChar: Object.entries(charFreq).sort(([,a], [,b]) => b - a)[0]?.[0] || '',
    charFrequency: charFreq,
    byteSize
  };
}

// HTML to JSX conversion
export function htmlToJsx(html: string): string {
  let jsx = html;

  // Convert HTML comments to JSX comments
  jsx = jsx.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');

  // Convert inline style strings to JSX style objects
  jsx = jsx.replace(/style="([^"]*)"/g, (_match, styleStr: string) => {
    const props = styleStr.split(';').filter(Boolean).map(prop => {
      const [key, ...vals] = prop.split(':');
      if (!key || vals.length === 0) return '';
      const camelKey = key.trim().replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase());
      const val = vals.join(':').trim();
      const numVal = parseFloat(val);
      if (!isNaN(numVal) && String(numVal) === val) {
        return `${camelKey}: ${numVal}`;
      }
      return `${camelKey}: "${val}"`;
    }).filter(Boolean);
    return `style={{${props.join(', ')}}}`;
  });

  // Convert event handler attributes (onclick, onchange, etc.)
  jsx = jsx.replace(/\bon([a-z]+)=/gi, (_match, event: string) => {
    return `on${event.charAt(0).toUpperCase()}${event.slice(1)}=`;
  });

  // Self-closing void elements
  const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
  for (const tag of voidElements) {
    jsx = jsx.replace(new RegExp(`<(${tag})(\\s[^>]*)?>(?!\\s*<\\/${tag}>)`, 'gi'), `<$1$2 />`);
  }

  // HTML attribute to JSX attribute renames
  const attrMap: Record<string, string> = {
    'class': 'className', 'for': 'htmlFor', 'tabindex': 'tabIndex',
    'readonly': 'readOnly', 'maxlength': 'maxLength', 'cellpadding': 'cellPadding',
    'cellspacing': 'cellSpacing', 'rowspan': 'rowSpan', 'colspan': 'colSpan',
    'usemap': 'useMap', 'frameborder': 'frameBorder', 'contenteditable': 'contentEditable',
    'crossorigin': 'crossOrigin', 'datetime': 'dateTime', 'enctype': 'encType',
    'formaction': 'formAction', 'formenctype': 'formEncType', 'formmethod': 'formMethod',
    'formnovalidate': 'formNoValidate', 'formtarget': 'formTarget',
    'marginheight': 'marginHeight', 'marginwidth': 'marginWidth',
    'novalidate': 'noValidate', 'radiogroup': 'radioGroup', 'spellcheck': 'spellCheck',
    'srcdoc': 'srcDoc', 'srclang': 'srcLang', 'srcset': 'srcSet',
    'autofocus': 'autoFocus', 'autoplay': 'autoPlay', 'controlslist': 'controlsList',
    'autocomplete': 'autoComplete', 'charset': 'charSet', 'accesskey': 'accessKey',
  };
  for (const [html_attr, jsxAttr] of Object.entries(attrMap)) {
    jsx = jsx.replace(new RegExp(`\\b${html_attr}=`, 'g'), `${jsxAttr}=`);
  }

  return jsx;
}

// Cron expression parser
export function parseCronExpression(expression: string): string {
  const cronParts = expression.trim().split(/\s+/);

  if (cronParts.length !== 5) {
    throw new Error('Invalid cron expression. Expected exactly 5 fields (minute, hour, day of month, month, day of week).');
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = cronParts;

  // Helper to validate a cron field
  const validateField = (value: string, min: number, max: number, fieldName: string) => {
    // Accept *, single number, ranges, lists, steps
    const valid = /^\*|(\d+)(-(\d+))?(,\d+)*|(\*|\d+)(\/(\d+))?$/.test(value);
    if (!valid) throw new Error(`Invalid value for ${fieldName}: '${value}'`);
    // Check all numbers in the field are within range
    const numbers = value.split(/[^\d]+/).filter(Boolean).map(Number);
    for (const n of numbers) {
      if (isNaN(n) || n < min || n > max) {
        throw new Error(`Value for ${fieldName} out of range (${min}-${max}): '${n}'`);
      }
    }
  };

  validateField(minute, 0, 59, 'minute');
  validateField(hour, 0, 23, 'hour');
  validateField(dayOfMonth, 1, 31, 'day of month');
  validateField(month, 1, 12, 'month');
  validateField(dayOfWeek, 0, 6, 'day of week');

  // Helper functions for readable formatting
  const formatTime = (h: string, m: string) => {
    if (h === '*' || m === '*') return null;
    const hourNum = parseInt(h);
    const minuteNum = parseInt(m);
    
    if (hourNum === 0 && minuteNum === 0) return 'midnight';
    if (hourNum === 12 && minuteNum === 0) return 'noon';
    
    const hour12 = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const minuteStr = minuteNum.toString().padStart(2, '0');
    
    return `${hour12}:${minuteStr} ${ampm}`;
  };

  const getDayName = (day: string) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[parseInt(day)];
  };

  const getMonthName = (month: string) => {
    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[parseInt(month)];
  };

  const getOrdinal = (num: number) => {
    const suffix = num % 10 === 1 && num !== 11 ? 'st' : 
                   num % 10 === 2 && num !== 12 ? 'nd' : 
                   num % 10 === 3 && num !== 13 ? 'rd' : 'th';
    return `${num}${suffix}`;
  };

  // Handle day of week patterns
  const parseDayOfWeek = (dow: string) => {
    if (dow === '*') return null;
    if (dow === '1-5') return 'Monday through Friday';
    if (dow === '0,6') return 'Saturday and Sunday';
    
    if (dow.includes('/')) {
      const [range, step] = dow.split('/');
      if (range === '*') {
        return `every ${getOrdinal(parseInt(step))} day of the week`;
      } else {
        return `every ${getOrdinal(parseInt(step))} day of the week starting from ${getDayName(range)}`;
      }
    }
    
    if (dow.includes('-')) {
      const [start, end] = dow.split('-');
      const startDay = getDayName(start);
      const endDay = getDayName(end);
      return `${startDay} through ${endDay}`;
    }
    
    if (dow.includes(',')) {
      const days = dow.split(',').map(d => getDayName(d));
      return days.length === 2 ? days.join(' and ') : 
             days.slice(0, -1).join(', ') + ', and ' + days[days.length - 1];
    }
    
    return getDayName(dow);
  };

  // Parse day of month
  const parseDayOfMonth = (dom: string) => {
    if (dom === '*') return null;
    if (dom.includes('/')) {
      const [range, step] = dom.split('/');
      if (range === '*') {
        return `every ${getOrdinal(parseInt(step))} day`;
      } else {
        return `every ${getOrdinal(parseInt(step))} day starting from day ${range}`;
      }
    }
    if (dom.includes(',')) {
      const days = dom.split(',').map(d => getOrdinal(parseInt(d)));
      return days.length === 2 ? days.join(' and ') : 
             days.slice(0, -1).join(', ') + ', and ' + days[days.length - 1];
    }
    if (dom.includes('-')) {
      const [start, end] = dom.split('-');
      return `${getOrdinal(parseInt(start))} through ${getOrdinal(parseInt(end))}`;
    }
    return getOrdinal(parseInt(dom));
  };

  // Parse month
  const parseMonth = (m: string) => {
    if (m === '*') return null;
    if (m.includes('/')) {
      const [range, step] = m.split('/');
      if (range === '*') {
        return `every ${getOrdinal(parseInt(step))} month`;
      } else {
        return `every ${getOrdinal(parseInt(step))} month starting from ${getMonthName(range)}`;
      }
    }
    if (m.includes(',')) {
      const months = m.split(',').map(mo => getMonthName(mo));
      return months.length === 2 ? months.join(' and ') : 
             months.slice(0, -1).join(', ') + ', and ' + months[months.length - 1];
    }
    if (m.includes('-')) {
      const [start, end] = m.split('-');
      return `${getMonthName(start)} through ${getMonthName(end)}`;
    }
    return getMonthName(m);
  };

  // Build comprehensive description
  const timeStr = formatTime(hour, minute);
  const dayOfWeekStr = parseDayOfWeek(dayOfWeek);
  const dayOfMonthStr = parseDayOfMonth(dayOfMonth);
  const monthStr = parseMonth(month);

  // Handle frequency patterns first
  if (minute.includes('/') && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    const step = minute.split('/')[1];
    return `Every ${step} minutes`;
  }
  
  if (minute === '*' && hour.includes('/') && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    const step = hour.split('/')[1];
    return `Every ${step} hours`;
  }

  if (minute !== '*' && hour.includes('/') && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    const step = hour.split('/')[1];
    const stepNum = parseInt(step);
    if (stepNum === 1) {
      return `At minute ${minute} past every hour.`;
    } else {
      return `At minute ${minute} past every ${getOrdinal(stepNum)} hour.`;
    }
  }

  if (minute === '0' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every hour';
  }

  // Build description parts
  let descriptionParts: string[] = [];
  
  if (timeStr) {
    descriptionParts.push(`At ${timeStr}`);
  } else if (minute !== '*' && hour !== '*') {
    const hourNum = parseInt(hour);
    const minuteNum = parseInt(minute);
    const hour12 = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    descriptionParts.push(`At ${hour12}:${minuteNum.toString().padStart(2, '0')} ${ampm}`);
  } else if (minute !== '*') {
    descriptionParts.push(`At minute ${minute}`);
  } else if (hour !== '*') {
    const hourNum = parseInt(hour);
    const hour12 = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    descriptionParts.push(`At ${hour12}:00 ${ampm}`);
  }

  // Add day constraints
  if (dayOfMonthStr && dayOfWeekStr) {
    descriptionParts.push(`on day-of-month ${dayOfMonthStr} and on ${dayOfWeekStr}`);
  } else if (dayOfMonthStr) {
    if (dayOfMonth.includes('/')) {
      descriptionParts.push(`on ${dayOfMonthStr}`);
    } else {
      descriptionParts.push(`on the ${dayOfMonthStr} day of the month`);
    }
  } else if (dayOfWeekStr) {
    descriptionParts.push(`on ${dayOfWeekStr}`);
  }

  // Add month constraint
  if (monthStr) {
    descriptionParts.push(`in ${monthStr}`);
  }

  // Join parts appropriately
  if (descriptionParts.length === 0) {
    return 'Every minute';
  }

  let result = descriptionParts.join(' ');
  
  // Add period at the end
  if (!result.endsWith('.')) {
    result += '.';
  }

  return result;
}
