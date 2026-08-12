import { ToolCallRecord } from '../types';

export interface ExecutedToolResult {
  record: ToolCallRecord;
  formattedSpeech: string;
}

export async function executeToolCall(toolName: string, args: Record<string, any>): Promise<ExecutedToolResult> {
  const startTime = performance.now();
  const id = 'tool_' + Math.random().toString(36).substring(2, 9);
  let result: any = null;
  let formattedSpeech = '';

  switch (toolName) {
    case 'get_weather': {
      const city = args.city || 'San Francisco';
      const temps: Record<string, string> = {
        'San Francisco': '68°F (20°C), Sunny with light ocean breeze',
        'New York': '75°F (24°C), Partly Cloudy',
        'London': '62°F (17°C), Light Drizzle',
        'Bengaluru': '26°C (78°F), Pleasant & Breezy'
      };
      const weather = temps[city] || '72°F (22°C), Clear skies';
      result = { city, weather, humidity: '55%', windSpeed: '12 mph' };
      formattedSpeech = `The current weather in ${city} is ${weather}.`;
      break;
    }

    case 'schedule_meeting': {
      const title = args.title || 'Karta Product Sync';
      const time = args.time || 'Tomorrow at 10:00 AM';
      const attendees = args.attendees || ['Vijaypal Singh', 'Divyansh Joshi'];
      result = { calendarEventId: 'evt_' + Date.now(), title, time, attendees, status: 'Confirmed' };
      formattedSpeech = `I have scheduled "${title}" for ${time} with ${attendees.join(' and ')}.`;
      break;
    }

    case 'lookup_knowledge': {
      const query = (args.query || '').toLowerCase();
      if (query.includes('latency') || query.includes('ttft') || query.includes('performance')) {
        result = { topic: 'Voice Latency Metrics', targetTTFT: '<300ms', targetTTS: '<150ms', vadThreshold: '0.45' };
        formattedSpeech = `Our voice architecture targets under 300 milliseconds Time-to-First-Token with streaming TTS audio backpressure control.`;
      } else if (query.includes('barge') || query.includes('interrupt')) {
        result = { topic: 'Barge-In Handling', mechanism: 'Web Audio VAD RMS threshold + Echo Cancellation', cancelLatency: '45ms' };
        formattedSpeech = `Barge-in detection triggers when mic RMS exceeds threshold, instantly pausing speech synthesizer audio buffer within 45 milliseconds.`;
      } else {
        result = { topic: 'Karta AI Platform', architecture: 'WebRTC + LangGraph Agent Pipeline + Whisper + ElevenLabs/Cartesia', status: 'Optimal' };
        formattedSpeech = `Karta leverages real-time WebRTC audio pipelines with agentic workflow orchestration for high-reliability voice automation.`;
      }
      break;
    }

    case 'take_note': {
      const content = args.content || 'Voice note recorded';
      result = { noteId: 'note_' + Date.now(), content, savedAt: new Date().toLocaleTimeString() };
      formattedSpeech = `I've saved that note: "${content}".`;
      break;
    }

    default:
      result = { status: 'unknown_tool', args };
      formattedSpeech = `Executed tool ${toolName}.`;
  }

  const executionTimeMs = Math.round(performance.now() - startTime + Math.random() * 40 + 20);

  return {
    record: {
      id,
      toolName,
      args,
      result,
      executionTimeMs
    },
    formattedSpeech
  };
}
