import { createClient } from '@supabase/supabase-js';
import type { Asset, Booking } from './types';

// Supabase configuration
const supabaseUrl = 'https://nppoihfxfpbueoboqmza.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wcG9vaWhmeGZwYnVlb2JxbXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzAxMDAsImV4cCI6MjA2ODg0NjEwMH0.i_z3LhW0XqYoCDZTForjHye-VtsHPyJflBngyRrC7hI';

// Flag to indicate if Supabase is available
const isSupabaseEnabled = true; // Setting to true since Supabase is now enabled

// Create Supabase client only if Supabase is enabled
export const supabase = isSupabaseEnabled ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Date helpers for Supabase
export function formatDateForSupabase(date: Date): string {
  return date.toISOString();
}

export function parseDateFromSupabase(dateString: string | null): Date | undefined {
  return dateString ? new Date(dateString) : undefined;
}

// Initialize the database with tables if they don't exist
export async function initializeDatabase(): Promise<void> {
  if (supabase) {
    // Create assets table if it doesn't exist
    try {
      await supabase.rpc('init_database_tables');
    } catch (error) {
      console.error('Failed to initialize Supabase database:', error);
    }
  } else {
    // Ensure localStorage is available for fallback
    try {
      if (localStorage.getItem('assets') === null) {
        localStorage.setItem('assets', '[]');
      }
      if (localStorage.getItem('bookings') === null) {
        localStorage.setItem('bookings', '[]');
      }
    } catch (error) {
      console.error('Failed to initialize localStorage:', error);
    }
  }
}

// Asset functions
export async function fetchAssets(): Promise<Asset[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*');
        
      if (error) {
        console.error('Error fetching assets from Supabase:', error);
        return await fetchAssetsFromLocalStorage();
      }

      // Transform database rows to Asset objects with proper date handling
      return data.map(item => ({
        ...item,
        lastCalibrated: item.lastCalibrated ? new Date(item.lastCalibrated) : undefined,
        nextCalibrationDue: item.nextCalibrationDue ? new Date(item.nextCalibrationDue) : undefined,
      }));
    } catch (error) {
      console.error('Error fetching assets from Supabase:', error);
      return await fetchAssetsFromLocalStorage();
    }
  } else {
    return await fetchAssetsFromLocalStorage();
  }
}

// Fallback function to get assets from localStorage
async function fetchAssetsFromLocalStorage(): Promise<Asset[]> {
  try {
    const storedAssets = localStorage.getItem('assets');
    if (!storedAssets) {
      return [];
    }
    
    const assets = JSON.parse(storedAssets);
    return assets.map((item: any) => ({
      ...item,
      lastCalibrated: item.lastCalibrated ? new Date(item.lastCalibrated) : undefined,
      nextCalibrationDue: item.nextCalibrationDue ? new Date(item.nextCalibrationDue) : undefined,
    }));
  } catch (error) {
    console.error('Error fetching assets from localStorage:', error);
    return [];
  }
}

export async function createOrUpdateAsset(asset: Asset): Promise<Asset | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('assets')
        .upsert({
          id: asset.id,
          name: asset.name,
          type: asset.type,
          calibrationStatus: asset.calibrationStatus,
          lastCalibrated: asset.lastCalibrated ? formatDateForSupabase(asset.lastCalibrated) : null,
          nextCalibrationDue: asset.nextCalibrationDue ? formatDateForSupabase(asset.nextCalibrationDue) : null,
          location: asset.location || null,
          available: asset.available
        })
        .select();
      
      if (error) {
        console.error('Error saving asset to Supabase:', error);
        return await createOrUpdateAssetInLocalStorage(asset);
      }

      // Transform result to Asset object
      return {
        ...data[0],
        lastCalibrated: data[0].lastCalibrated ? new Date(data[0].lastCalibrated) : undefined,
        nextCalibrationDue: data[0].nextCalibrationDue ? new Date(data[0].nextCalibrationDue) : undefined,
      };
    } catch (error) {
      console.error('Error saving asset to Supabase:', error);
      return await createOrUpdateAssetInLocalStorage(asset);
    }
  } else {
    return await createOrUpdateAssetInLocalStorage(asset);
  }
}

async function createOrUpdateAssetInLocalStorage(asset: Asset): Promise<Asset | null> {
  try {
    const storedAssets = localStorage.getItem('assets');
    let assets = storedAssets ? JSON.parse(storedAssets) : [];
    
    // Find the asset index if it exists
    const index = assets.findIndex((a: Asset) => a.id === asset.id);
    
    // Prepare the asset for storage (convert dates to strings)
    const assetToStore = {
      ...asset,
      lastCalibrated: asset.lastCalibrated ? asset.lastCalibrated.toISOString() : null,
      nextCalibrationDue: asset.nextCalibrationDue ? asset.nextCalibrationDue.toISOString() : null,
    };
    
    if (index >= 0) {
      // Update existing asset
      assets[index] = assetToStore;
    } else {
      // Add new asset
      assets.push(assetToStore);
    }
    
    // Save to localStorage
    localStorage.setItem('assets', JSON.stringify(assets));
    
    return asset;
  } catch (error) {
    console.error('Error saving asset to localStorage:', error);
    return null;
  }
}

// Booking functions
export async function fetchBookings(): Promise<Booking[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*');
        
      if (error) {
        console.error('Error fetching bookings from Supabase:', error);
        return await fetchBookingsFromLocalStorage();
      }

      // Transform database rows to Booking objects with proper date handling
      return data.map(item => ({
        ...item,
        date: new Date(item.date),
      }));
    } catch (error) {
      console.error('Error fetching bookings from Supabase:', error);
      return await fetchBookingsFromLocalStorage();
    }
  } else {
    return await fetchBookingsFromLocalStorage();
  }
}

// Fallback function to get bookings from localStorage
async function fetchBookingsFromLocalStorage(): Promise<Booking[]> {
  try {
    const storedBookings = localStorage.getItem('bookings');
    if (!storedBookings) {
      return [];
    }
    
    const bookings = JSON.parse(storedBookings);
    return bookings.map((item: any) => ({
      ...item,
      date: new Date(item.date),
    }));
  } catch (error) {
    console.error('Error fetching bookings from localStorage:', error);
    return [];
  }
}

export async function createBooking(booking: Booking): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          assetId: booking.assetId,
          userId: booking.userId,
          date: formatDateForSupabase(booking.date),
          startTime: booking.startTime,
          endTime: booking.endTime,
          purpose: booking.purpose
        });
      
      if (error) {
        console.error('Error creating booking in Supabase:', error);
        return await createBookingInLocalStorage(booking);
      }

      // Update asset availability
      await supabase
        .from('assets')
        .update({ available: false })
        .eq('id', booking.assetId);

      return true;
    } catch (error) {
      console.error('Error creating booking in Supabase:', error);
      return await createBookingInLocalStorage(booking);
    }
  } else {
    return await createBookingInLocalStorage(booking);
  }
}

async function createBookingInLocalStorage(booking: Booking): Promise<boolean> {
  try {
    // Get current bookings
    const storedBookings = localStorage.getItem('bookings');
    let bookings = storedBookings ? JSON.parse(storedBookings) : [];
    
    // Create booking with generated ID
    const newBooking = {
      ...booking,
      id: `booking-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: booking.date.toISOString(),
      created_at: new Date().toISOString()
    };
    
    // Add to bookings
    bookings.push(newBooking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    // Update asset availability
    const storedAssets = localStorage.getItem('assets');
    if (storedAssets) {
      const assets = JSON.parse(storedAssets);
      const assetIndex = assets.findIndex((a: Asset) => a.id === booking.assetId);
      if (assetIndex >= 0) {
        assets[assetIndex].available = false;
        localStorage.setItem('assets', JSON.stringify(assets));
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error creating booking in localStorage:', error);
    return false;
  }
}

// Check if asset is available for a specific time slot
export async function checkAssetAvailability(
  assetId: string, 
  date: Date, 
  startTime: string, 
  endTime: string
): Promise<boolean> {
  if (supabase) {
    try {
      // Convert date to ISO string for Postgres date comparison
      const dateStr = date.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('assetId', assetId)
        .eq('date', dateStr);
      
      if (error) {
        console.error('Error checking availability in Supabase:', error);
        return await checkAssetAvailabilityInLocalStorage(assetId, date, startTime, endTime);
      }
      
      // Check for time slot conflicts
      for (const booking of data) {
        if (
          (startTime >= booking.startTime && startTime < booking.endTime) ||
          (endTime > booking.startTime && endTime <= booking.endTime) ||
          (startTime <= booking.startTime && endTime >= booking.endTime)
        ) {
          return false; // Conflict found
        }
      }
      
      return true; // No conflicts
    } catch (error) {
      console.error('Error checking asset availability in Supabase:', error);
      return await checkAssetAvailabilityInLocalStorage(assetId, date, startTime, endTime);
    }
  } else {
    return await checkAssetAvailabilityInLocalStorage(assetId, date, startTime, endTime);
  }
}

async function checkAssetAvailabilityInLocalStorage(
  assetId: string,
  date: Date,
  startTime: string,
  endTime: string
): Promise<boolean> {
  try {
    const storedBookings = localStorage.getItem('bookings');
    if (!storedBookings) {
      return true; // No bookings, so asset is available
    }
    
    const bookings = JSON.parse(storedBookings);
    const dateStr = date.toISOString().split('T')[0];
    
    // Filter bookings for this asset and date
    const relevantBookings = bookings.filter((booking: any) => {
      const bookingDateStr = new Date(booking.date).toISOString().split('T')[0];
      return booking.assetId === assetId && bookingDateStr === dateStr;
    });
    
    // Check for time slot conflicts
    for (const booking of relevantBookings) {
      if (
        (startTime >= booking.startTime && startTime < booking.endTime) ||
        (endTime > booking.startTime && endTime <= booking.endTime) ||
        (startTime <= booking.startTime && endTime >= booking.endTime)
      ) {
        return false; // Conflict found
      }
    }
    
    return true; // No conflicts
  } catch (error) {
    console.error('Error checking asset availability in localStorage:', error);
    return false;
  }
}

// Initialize default assets if the table is empty
export async function initializeDefaultAssets(defaultAssets: Asset[]): Promise<void> {
  if (supabase) {
    try {
      // Check if we already have assets in the database
      const { count, error: countError } = await supabase
        .from('assets')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Error checking assets count:', countError);
        // Fallback to localStorage
        await initializeDefaultAssetsInLocalStorage(defaultAssets);
        return;
      }
      
      // Only initialize if no assets exist
      if (count === 0) {
        // Prepare assets for insertion
        const assetsToInsert = defaultAssets.map(asset => ({
          id: asset.id,
          name: asset.name,
          type: asset.type,
          calibrationStatus: asset.calibrationStatus,
          lastCalibrated: asset.lastCalibrated ? formatDateForSupabase(asset.lastCalibrated) : null,
          nextCalibrationDue: asset.nextCalibrationDue ? formatDateForSupabase(asset.nextCalibrationDue) : null,
          location: asset.location || null,
          available: asset.available
        }));
        
        const { error } = await supabase
          .from('assets')
          .insert(assetsToInsert);
        
        if (error) {
          console.error('Error initializing default assets in Supabase:', error);
          // Fallback to localStorage
          await initializeDefaultAssetsInLocalStorage(defaultAssets);
        }
      }
    } catch (error) {
      console.error('Error initializing default assets in Supabase:', error);
      // Fallback to localStorage
      await initializeDefaultAssetsInLocalStorage(defaultAssets);
    }
  } else {
    // Use localStorage directly since Supabase is disabled
    await initializeDefaultAssetsInLocalStorage(defaultAssets);
  }
}

// Initialize default assets in localStorage
export async function initializeDefaultAssetsInLocalStorage(defaultAssets: Asset[]): Promise<void> {
  try {
    console.log('Initializing default assets in localStorage...');
    // Check if we already have assets in localStorage
    const storedAssets = localStorage.getItem('assets');
    
    if (!storedAssets || JSON.parse(storedAssets).length === 0) {
      console.log('No assets found in localStorage, initializing with default assets...');
      // Prepare assets for insertion
      const assetsToInsert = defaultAssets.map(asset => ({
        ...asset,
        lastCalibrated: asset.lastCalibrated ? asset.lastCalibrated.toISOString() : null,
        nextCalibrationDue: asset.nextCalibrationDue ? asset.nextCalibrationDue.toISOString() : null,
      }));
      
      localStorage.setItem('assets', JSON.stringify(assetsToInsert));
      console.log('Default assets stored in localStorage:', assetsToInsert);
    } else {
      console.log('Assets already exist in localStorage, skipping initialization');
    }
  } catch (error) {
    console.error('Error initializing default assets in localStorage:', error);
  }
}