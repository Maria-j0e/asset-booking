<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { format } from 'date-fns';
  import { z } from 'zod';
  import Calendar from './Calendar.svelte';
  import { generateAvailabilityCalendar, getAIRecommendations, isAssetAvailable } from './storage';
  import type { Asset, Booking } from './types';
  
  export let asset: Asset;
  
  const dispatch = createEventDispatcher<{ 
    bookingSubmit: Booking 
  }>();
  
  // Form state
  let date: string = format(new Date(), 'yyyy-MM-dd');
  let startTime: string = '09:00';
  let endTime: string = '10:00';
  let purpose: string = '';
  let errors: Record<string, string> = {};
  let availabilityCalendar: any[] = [];
  let showCalendar = false;
  let recommendations: any[] = [];
  let loading = false;
  let validating = false;
  
  // Zod schema for form validation
  const BookingSchema = z.object({
    date: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid date format" }),
    startTime: z.string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid start time format" }),
    endTime: z.string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid end time format" })
      .refine(val => val > startTime, {
        message: "End time must be after start time"
      }),
    purpose: z.string()
      .min(5, { message: "Purpose must be at least 5 characters" })
      .max(200, { message: "Purpose cannot exceed 200 characters" })
  });
  
  // Initialize calendar data
  onMount(async () => {
    loading = true;
    try {
      const today = new Date();
      availabilityCalendar = await generateAvailabilityCalendar(today, asset.id);
    } catch (error) {
      console.error('Failed to generate availability calendar:', error);
      availabilityCalendar = [];
    } finally {
      loading = false;
    }
  });
  
  // Handle form submission
  async function handleSubmit() {
    validating = true;
    
    try {
      // Validate form data
      const validatedData = BookingSchema.parse({ date, startTime, endTime, purpose });
      
      // Check availability with Supabase
      const dateObj = new Date(date);
      const isAvailable = await isAssetAvailable(
        asset.id, 
        dateObj, 
        validatedData.startTime, 
        validatedData.endTime
      );
      
      if (!isAvailable) {
        errors.date = "This time slot is no longer available. Please select another time.";
        validating = false;
        return;
      }
      
      // If validation passes, create booking object
      const booking: Booking = {
        assetId: asset.id,
        userId: 'current-user', // In a real app, get this from authentication
        date: dateObj,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        purpose: validatedData.purpose
      };
      
      // Dispatch booking event
      dispatch('bookingSubmit', booking);
      
      // Reset form
      purpose = '';
      errors = {};
      
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Convert Zod errors to a friendly format
        errors = {};
        err.errors.forEach(e => {
          errors[e.path[0]] = e.message;
        });
      } else {
        console.error('Booking submission error:', err);
        errors.form = 'An unexpected error occurred. Please try again.';
      }
    } finally {
      validating = false;
    }
  }
  
  // Get AI recommendations when purpose changes
  $: if (purpose.length > 5) {
    getRecommendations();
  } else {
    recommendations = [];
  }

  async function getRecommendations() {
    try {
      recommendations = await getAIRecommendations(asset.id, purpose);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      recommendations = [];
    }
  }
  
  function toggleCalendar() {
    showCalendar = !showCalendar;
  }
  
  function selectDate(event: CustomEvent<{ date: Date }>) {
    date = format(event.detail.date, 'yyyy-MM-dd');
    showCalendar = false;
  }
</script>

<div class="booking-form">
  <div class="asset-info">
    <h3>Selected Asset</h3>
    <p><strong>{asset.name}</strong> (ID: {asset.id})</p>
  </div>
  
  {#if loading}
    <div class="loading-indicator">
      <span class="loader"></span>
      <p>Loading availability data...</p>
    </div>
  {:else}
    <form on:submit|preventDefault={handleSubmit}>
      {#if errors.form}
        <div class="form-error">
          <p>{errors.form}</p>
        </div>
      {/if}
      
      <div class="form-group">
        <label for="date">Date</label>
        <div class="date-input-container">
          <input 
            type="date" 
            id="date" 
            bind:value={date} 
            min={format(new Date(), 'yyyy-MM-dd')}
            class={errors.date ? 'error' : ''}
            disabled={validating}
          />
          <button 
            type="button" 
            class="calendar-button" 
            on:click={toggleCalendar}
            aria-label="Show calendar"
            disabled={validating}
          >
            📅
          </button>
        </div>
        {#if errors.date}
          <p class="error-message">{errors.date}</p>
        {/if}
      </div>
      
      {#if showCalendar}
        <div class="calendar-container">
          <Calendar 
            calendar={availabilityCalendar} 
            on:selectDate={selectDate}
          />
        </div>
      {/if}
      
      <div class="form-row">
        <div class="form-group">
          <label for="startTime">Start Time</label>
          <input 
            type="time" 
            id="startTime" 
            bind:value={startTime}
            class={errors.startTime ? 'error' : ''}
            disabled={validating}
          />
          {#if errors.startTime}
            <p class="error-message">{errors.startTime}</p>
          {/if}
        </div>
        
        <div class="form-group">
          <label for="endTime">End Time</label>
          <input 
            type="time" 
            id="endTime" 
            bind:value={endTime}
            class={errors.endTime ? 'error' : ''}
            disabled={validating}
          />
          {#if errors.endTime}
            <p class="error-message">{errors.endTime}</p>
          {/if}
        </div>
      </div>
      
      <div class="form-group">
        <label for="purpose">Purpose</label>
        <textarea 
          id="purpose" 
          bind:value={purpose}
          placeholder="Describe what you'll be using this asset for..."
          rows="4"
          class={errors.purpose ? 'error' : ''}
          disabled={validating}
        ></textarea>
        {#if errors.purpose}
          <p class="error-message">{errors.purpose}</p>
        {/if}
      </div>
      
      {#if recommendations.length > 0}
        <div class="ai-recommendations">
          <h4>Recommendations</h4>
          <ul>
            {#each recommendations as rec}
              <li class="recommendation {rec.type}">
                <span class="ai-icon">💡</span>
                {rec.message}
              </li>
            {/each}
          </ul>
        </div>
      {/if}
      
      <button 
        type="submit" 
        class="submit-btn" 
        disabled={validating}
      >
        {#if validating}
          <span class="btn-loader"></span> Processing...
        {:else}
          Book Asset
        {/if}
      </button>
    </form>
  {/if}
</div>

<style>
  .booking-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .asset-info {
    background: #f8f9fa;
    padding: 10px 15px;
    border-radius: 5px;
  }
  
  .asset-info h3 {
    margin: 0 0 5px 0;
    font-size: 1rem;
    color: #666;
  }
  
  .asset-info p {
    margin: 0;
  }
  
  form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .form-row {
    display: flex;
    gap: 10px;
  }
  
  .form-row .form-group {
    flex: 1;
  }
  
  label {
    font-weight: bold;
    font-size: 0.9rem;
  }
  
  input, textarea {
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.9rem;
  }
  
  input.error, textarea.error {
    border-color: #dc3545;
    background-color: #fff8f8;
  }
  
  .error-message {
    color: #dc3545;
    font-size: 0.8rem;
    margin: 0;
  }
  
  .date-input-container {
    display: flex;
    gap: 5px;
  }
  
  .date-input-container input {
    flex: 1;
  }
  
  .calendar-button {
    background: #f8f9fa;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 0 8px;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .calendar-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .calendar-container {
    margin-bottom: 10px;
  }
  
  .ai-recommendations {
    background: #f0f7ff;
    border-radius: 5px;
    padding: 10px 15px;
    margin: 10px 0;
  }
  
  .ai-recommendations h4 {
    margin: 0 0 10px 0;
    font-size: 0.9rem;
    color: #0066cc;
  }
  
  .ai-recommendations ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  
  .recommendation {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 0.9rem;
  }
  
  .ai-icon {
    font-size: 1rem;
  }
  
  .recommendation.performance {
    color: #0066cc;
  }
  
  .recommendation.availability {
    color: #6c757d;
  }
  
  .recommendation.alternative {
    color: #28a745;
  }
  
  .form-error {
    background-color: #f8d7da;
    color: #721c24;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 10px;
  }
  
  .form-error p {
    margin: 0;
  }
  
  .submit-btn {
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .submit-btn:hover:not(:disabled) {
    background: #0069d9;
  }
  
  .submit-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
  
  .loading-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;
  }
  
  .loading-indicator p {
    color: #666;
    margin-top: 15px;
  }
  
  .loader,
  .btn-loader {
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
    display: inline-block;
  }
  
  .loader {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-left-color: #2c3e50;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>