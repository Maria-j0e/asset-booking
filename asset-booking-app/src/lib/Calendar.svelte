<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
  import type { CalendarDay } from './types';
  
  export let calendar: CalendarDay[] = [];
  
  const dispatch = createEventDispatcher<{ selectDate: { date: Date } }>();
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Group calendar days into weeks for better display
  $: weeks = groupIntoWeeks(calendar);
  
  function groupIntoWeeks(calendar: CalendarDay[]) {
    if (calendar.length === 0) return [];
    
    const result = [];
    const firstDate = calendar[0].date;
    const startDay = startOfWeek(firstDate);
    
    // Create empty days for the first week until we reach the first calendar date
    let currentWeek = [];
    let currentDate = startDay;
    
    while (!isSameDay(currentDate, firstDate)) {
      currentWeek.push(null); // Empty placeholder
      currentDate = addDays(currentDate, 1);
    }
    
    // Add actual calendar days
    for (const day of calendar) {
      // If we've filled a week (7 days), start a new week
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
      
      currentWeek.push(day);
    }
    
    // Fill the last week with empty days if needed
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    
    // Add the final week
    if (currentWeek.length > 0) {
      result.push(currentWeek);
    }
    
    return result;
  }
  
  function handleSelectDate(day: CalendarDay) {
    if (day && day.available) {
      dispatch('selectDate', { date: day.date });
    }
  }
</script>

<div class="calendar">
  <div class="calendar-header">
    {#each daysOfWeek as day}
      <div class="day-header">{day}</div>
    {/each}
  </div>
  
  <div class="calendar-body">
    {#each weeks as week}
      <div class="week">
        {#each week as day}
          {#if day}
            <div 
              class="day {day.available ? 'available' : 'unavailable'}" 
              on:click={() => handleSelectDate(day)}
              role="button"
              tabindex="0"
              on:keypress={(e) => e.key === 'Enter' && handleSelectDate(day)}
            >
              <span class="date">{format(day.date, 'd')}</span>
              {#if day.available}
                <span class="availability-indicator"></span>
              {/if}
            </div>
          {:else}
            <div class="day empty"></div>
          {/if}
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  .calendar {
    background: white;
    border-radius: 5px;
    overflow: hidden;
    border: 1px solid #ddd;
  }
  
  .calendar-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    background: #f8f9fa;
    border-bottom: 1px solid #ddd;
  }
  
  .day-header {
    padding: 8px 0;
    text-align: center;
    font-size: 0.8rem;
    font-weight: bold;
    color: #666;
  }
  
  .calendar-body {
    padding: 5px;
  }
  
  .week {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
    margin-bottom: 2px;
  }
  
  .day {
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5px;
    border-radius: 5px;
    position: relative;
  }
  
  .day.empty {
    background: transparent;
  }
  
  .day.available {
    background: #f0f7ff;
    cursor: pointer;
  }
  
  .day.available:hover {
    background: #cce5ff;
  }
  
  .day.unavailable {
    background: #f8f9fa;
    color: #aaa;
    cursor: not-allowed;
  }
  
  .date {
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  .availability-indicator {
    position: absolute;
    bottom: 5px;
    width: 4px;
    height: 4px;
    background: #007bff;
    border-radius: 50%;
  }
</style>