import { addDays, subDays } from 'date-fns';
import type { Asset, Booking } from './types';
import * as supabaseClient from './supabase';

// Default mock assets data to initialize storage
export const defaultAssets: Asset[] = [
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

// Initialize the database on first import
let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    try {
      console.log('Initializing Supabase database...');
      // Execute the SQL setup script on first run
      await supabaseClient.initializeDatabase();
      // Initialize default assets if needed
      await supabaseClient.initializeDefaultAssets(defaultAssets);
      dbInitialized = true;
      console.log('Supabase database initialized successfully');
    } catch (error) {
      console.error('Error initializing Supabase database:', error);
      // Ensure default assets are available in localStorage as fallback
      console.log('Falling back to localStorage for asset storage');
      await supabaseClient.initializeDefaultAssetsInLocalStorage(defaultAssets);
      dbInitialized = true;
    }
  }
}

// Asset storage functions
export async function getAssets(): Promise<Asset[]> {
  try {
    await ensureDbInitialized();
    return await supabaseClient.fetchAssets();
  } catch (error) {
    console.error('Error retrieving assets:', error);
    return [];
  }
}

export async function saveAsset(asset: Asset): Promise<void> {
  try {
    await ensureDbInitialized();
    await supabaseClient.createOrUpdateAsset(asset);
  } catch (error) {
    console.error('Error saving asset:', error);
    throw error;
  }
}

// Booking storage functions
export async function getBookings(): Promise<Booking[]> {
  try {
    await ensureDbInitialized();
    return await supabaseClient.fetchBookings();
  } catch (error) {
    console.error('Error retrieving bookings:', error);
    return [];
  }
}

export async function saveBooking(booking: Booking): Promise<void> {
  try {
    await ensureDbInitialized();
    const success = await supabaseClient.createBooking(booking);
    
    if (!success) {
      throw new Error('Failed to save booking');
    }
  } catch (error) {
    console.error('Error saving booking:', error);
    throw error;
  }
}

// Check if asset is available for a specific time slot
export async function isAssetAvailable(assetId: string, date: Date, startTime: string, endTime: string): Promise<boolean> {
  try {
    await ensureDbInitialized();
    return await supabaseClient.checkAssetAvailability(assetId, date, startTime, endTime);
  } catch (error) {
    console.error('Error checking asset availability:', error);
    return false;
  }
}

// Generate time slots for a given date, taking into account existing bookings
export async function generateTimeSlots(date: Date, assetId: string) {
  // Start time: 8:00 AM
  // End time: 6:00 PM
  // Slot duration: 30 minutes
  const slots = [];
  const startHour = 8;
  const endHour = 18;
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const start = new Date(date);
      start.setHours(hour, minute, 0, 0);
      
      const end = new Date(date);
      end.setHours(hour, minute + 30, 0, 0);
      
      // Format times for availability check
      const startTimeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const endHourFormatted = hour + (minute + 30 >= 60 ? 1 : 0);
      const endMinuteFormatted = (minute + 30) % 60;
      const endTimeString = `${endHourFormatted.toString().padStart(2, '0')}:${endMinuteFormatted.toString().padStart(2, '0')}`;
      
      // Check if this slot is available
      const available = await isAssetAvailable(assetId, date, startTimeString, endTimeString);
      
      slots.push({ start, end, available });
    }
  }
  
  return slots;
}

// Generate availability calendar for the next 14 days
export async function generateAvailabilityCalendar(startDate: Date, assetId: string) {
  const calendar = [];
  const today = new Date(startDate);
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 14; i++) {
    const date = addDays(today, i);
    const slots = await generateTimeSlots(date, assetId);
    const available = slots.some(slot => slot.available);
    
    calendar.push({
      date,
      available,
      slots
    });
  }
  
  return calendar;
}

// AI recommendation function
export async function getAIRecommendations(assetId: string, purpose: string) {
  // Get asset booking data to make intelligent recommendations
  const bookings = await getBookings();
  const assetBookings = bookings.filter(b => b.assetId === assetId);
  
  // Calculate booking statistics
  const hasMultipleBookings = assetBookings.length > 2;
  const assets = await getAssets();
  const asset = assets.find(a => a.id === assetId);
  
  // Generate recommendations
  const recommendations = [];
  
  // Add performance recommendation
  recommendations.push({
    message: "Based on your purpose, morning slots tend to have better equipment performance.",
    type: "performance"
  });
  
  // Add availability recommendation if heavily booked
  if (hasMultipleBookings) {
    recommendations.push({
      message: "This asset is popular. Consider booking 2-3 days in advance.",
      type: "availability"
    });
  }
  
  // Add alternative recommendation
  const alternativeAsset = assets.find(a => 
    a.id !== assetId && 
    a.type === asset?.type && 
    a.available === true
  );
  
  if (alternativeAsset) {
    recommendations.push({
      message: `For this type of work, you might also consider ${alternativeAsset.name} which has similar capabilities.`,
      type: "alternative"
    });
  }
  
  return recommendations;
}