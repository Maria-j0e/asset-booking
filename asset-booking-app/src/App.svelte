<script lang="ts">
  import { onMount } from 'svelte';
  import AssetList from './lib/AssetList.svelte';
  import BookingForm from './lib/BookingForm.svelte';
  import { getAssets, saveBooking } from './lib/storage';
  import type { Asset, Booking } from './lib/types';
  
  let assets: Asset[] = [];
  let selectedAsset: Asset | null = null;
  let loading = true;
  let error: string | null = null;
  
  // Load assets from storage (Supabase if enabled, localStorage fallback)
  onMount(async () => {
    try {
      console.log('Attempting to load assets...');
      // Load assets from the database or localStorage
      assets = await getAssets();
      console.log('Assets loaded:', assets);
      loading = false;
    } catch (err) {
      console.error('Error loading assets:', err);
      error = 'Failed to load assets. Please try again later.';
      loading = false;
    }
  });
  
  function handleAssetSelect(event: CustomEvent<Asset>) {
    selectedAsset = event.detail;
  }
  
  async function handleBookingSubmit(event: CustomEvent<Booking>) {
    const booking = event.detail;
    loading = true;
    
    try {
      // Save the booking to Supabase
      await saveBooking(booking);
      
      // Show success message
      alert('Booking successful! Your booking has been saved.');
      
      // Update assets list after booking
      assets = await getAssets();
      
      // Reset selected asset
      selectedAsset = null;
    } catch (err) {
      console.error('Booking error:', err);
      alert(`Booking failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      loading = false;
    }
  }
</script>

<main>
  <header>
    <h1>Asset Booking System</h1>
  </header>
  
  <div class="container">
    <div class="assets-container">
      <h2>Available Assets</h2>
      {#if loading}
        <div class="loading-indicator">
          <span class="loader"></span>
          <p>Loading data...</p>
        </div>
      {:else if error}
        <div class="error-message">
          <p>{error}</p>
          <button on:click={() => window.location.reload()}>Retry</button>
        </div>
      {:else}
        <AssetList {assets} on:selectAsset={handleAssetSelect} />
      {/if}
    </div>
    
    <div class="booking-container">
      <h2>Book an Asset</h2>
      {#if loading}
        <div class="loading-indicator">
          <span class="loader"></span>
          <p>Processing...</p>
        </div>
      {:else if selectedAsset}
        <BookingForm 
          asset={selectedAsset} 
          on:bookingSubmit={handleBookingSubmit}
        />
      {:else}
        <p class="select-prompt">Please select an asset from the list to book</p>
      {/if}
    </div>
  </div>
</main>

<style>
  main {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  header {
    background-color: #2c3e50;
    color: white;
    padding: 15px;
    margin-bottom: 20px;
    border-radius: 5px;
  }
  
  h1 {
    margin: 0;
    font-size: 1.8rem;
  }
  
  h2 {
    color: #2c3e50;
    border-bottom: 2px solid #eee;
    padding-bottom: 10px;
    margin-top: 0;
  }
  
  .container {
    display: flex;
    gap: 20px;
  }
  
  .assets-container,
  .booking-container {
    background: white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    flex: 1;
  }
  
  .select-prompt {
    color: #666;
    font-style: italic;
    text-align: center;
    margin-top: 30px;
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

  .error-message {
    color: #e74c3c;
    text-align: center;
    padding: 20px;
    border: 1px solid #e74c3c;
    border-radius: 5px;
    margin: 20px 0;
  }

  .error-message button {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
  }

  /* Loading animation */
  .loader {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-left-color: #2c3e50;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    display: inline-block;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  @media (max-width: 768px) {
    .container {
      flex-direction: column;
    }
  }
</style>