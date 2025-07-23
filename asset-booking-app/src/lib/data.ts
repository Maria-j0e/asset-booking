import { addDays, subDays } from 'date-fns';
import type { Asset, TimeSlot } from './types';

// Mock assets data
export const mockAssets: Asset[] = [
  {
    id: 'A001',
    name: 'Oscilloscope XYZ-2000',
    type: 'Measurement',
    calibrationStatus: 'Calibrated',
    lastCalibrated: subDays(new Date(), 30),
    nextCalibrationDue: addDays(new Date(), 150),
    location: 'Lab 1',
    available: true
  },
  {
    id: 'A002',
    name: 'Spectrum Analyzer PRO-500',
    type: 'Measurement',
    calibrationStatus: 'Due Soon',
    lastCalibrated: subDays(new Date(), 170),
    nextCalibrationDue: addDays(new Date(), 10),
    location: 'Lab 2',
    available: true
  },
  {
    id: 'A003',
    name: 'Multimeter DMM-8050',
    type: 'Testing',
    calibrationStatus: 'Calibrated',
    lastCalibrated: subDays(new Date(), 15),
    nextCalibrationDue: addDays(new Date(), 165),
    location: 'Lab 1',
    available: false
  },
  {
    id: 'A004',
    name: 'Function Generator FG-100',
    type: 'Signal',
    calibrationStatus: 'Overdue',
    lastCalibrated: subDays(new Date(), 190),
    nextCalibrationDue: subDays(new Date(), 10),
    location: 'Lab 3',
    available: true
  },
  {
    id: 'A005',
    name: 'Power Supply PS-3030',
    type: 'Power',
    calibrationStatus: 'Not Required',
    location: 'Lab 2',
    available: true
  }
];

// Generate time slots for a given date
export function generateTimeSlots(date: Date, assetId: string): TimeSlot[] {
  // Start time: 8:00 AM
  // End time: 6:00 PM
  // Slot duration: 30 minutes
  const slots: TimeSlot[] = [];
  const startHour = 8;
  const endHour = 18;
  
  // Generate random availability
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const start = new Date(date);
      start.setHours(hour, minute, 0, 0);
      
      const end = new Date(date);
      end.setHours(hour, minute + 30, 0, 0);
      
      // Random availability (more slots available than not)
      const available = Math.random() > 0.2;
      
      slots.push({ start, end, available });
    }
  }
  
  return slots;
}

// Generate availability for the next 14 days
export function generateAvailabilityCalendar(startDate: Date, assetId: string) {
  const calendar = [];
  const today = new Date(startDate);
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 14; i++) {
    const date = addDays(today, i);
    const slots = generateTimeSlots(date, assetId);
    const available = slots.some(slot => slot.available);
    
    calendar.push({
      date,
      available,
      slots
    });
  }
  
  return calendar;
}

// AI recommendation function (mock implementation)
export function getAIRecommendations(assetId: string, purpose: string) {
  // In a real app, this would call an AI API
  // For now, we'll just return mock recommendations
  
  const recommendations = [
    {
      message: "Based on your purpose, morning slots tend to have better equipment performance.",
      type: "performance"
    },
    {
      message: "This asset is popular. Consider booking 2-3 days in advance.",
      type: "availability"
    },
    {
      message: "For this type of work, you might also consider asset A005 which has similar capabilities.",
      type: "alternative"
    }
  ];
  
  // Randomize which recommendations to show
  return recommendations.filter(() => Math.random() > 0.3);
}