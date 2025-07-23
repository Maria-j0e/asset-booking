// Asset types
export interface Asset {
  id: string;
  name: string;
  type: string;
  calibrationStatus: 'Calibrated' | 'Due Soon' | 'Overdue' | 'Not Required';
  lastCalibrated?: Date;
  nextCalibrationDue?: Date;
  location?: string;
  available: boolean;
}

// Booking types
export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export interface Booking {
  assetId: string;
  userId: string;
  date: Date;
  startTime: string; // Format: 'HH:MM'
  endTime: string; // Format: 'HH:MM'
  purpose: string;
}

// Calendar view types
export interface CalendarDay {
  date: Date;
  available: boolean;
  slots: TimeSlot[];
}