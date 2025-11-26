
import { EPGProgram } from '../types';

export const fetchEPG = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.text();
  } catch (error) {
    console.error('Failed to fetch EPG:', error);
    throw error;
  }
};

const parseDate = (dateStr: string): Date => {
  // XMLTV Format: YYYYMMDDhhmmss +0000 or YYYYMMDDhhmmss -0500
  // Regex to extract parts
  const regex = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s*([+-]\d{4})?$/;
  const match = dateStr.match(regex);
  
  if (!match) return new Date(); // Fallback

  const year = parseInt(match[1]);
  const month = parseInt(match[2]) - 1; // JS months are 0-based
  const day = parseInt(match[3]);
  const hour = parseInt(match[4]);
  const minute = parseInt(match[5]);
  const second = parseInt(match[6]);
  
  // Construct date in local time initially
  const date = new Date(year, month, day, hour, minute, second);
  
  // Apply timezone offset if present
  if (match[7]) {
     // This is a simplified offset handling. 
     // Ideally, we parse the offset and adjust the UTC time.
     // For now, many XMLTV readers just treat the time as is or relative to UTC.
     // Let's assume input is often consistent or convert to UTC string then Date.
     const str = `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}${match[7].substring(0,3)}:${match[7].substring(3)}`;
     try {
         return new Date(str);
     } catch (e) {
         return date;
     }
  }
  
  return date;
};

export const parseXMLTV = (xmlContent: string): Record<string, EPGProgram[]> => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
  const programMap: Record<string, EPGProgram[]> = {};

  const programs = xmlDoc.getElementsByTagName("programme");

  for (let i = 0; i < programs.length; i++) {
    const prog = programs[i];
    const channelId = prog.getAttribute("channel");
    const startStr = prog.getAttribute("start");
    const stopStr = prog.getAttribute("stop");

    if (!channelId || !startStr || !stopStr) continue;

    const titleEl = prog.getElementsByTagName("title")[0];
    const descEl = prog.getElementsByTagName("desc")[0];

    const program: EPGProgram = {
      channelId: channelId,
      start: parseDate(startStr),
      end: parseDate(stopStr),
      title: titleEl?.textContent || "Sin título",
      description: descEl?.textContent || "",
    };

    if (!programMap[channelId]) {
      programMap[channelId] = [];
    }
    programMap[channelId].push(program);
  }

  // Sort programs by time for each channel
  Object.keys(programMap).forEach(key => {
      programMap[key].sort((a, b) => a.start.getTime() - b.start.getTime());
  });

  return programMap;
};
