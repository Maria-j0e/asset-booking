<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Asset } from './types';
  
  export let assets: Asset[] = [];
  const dispatch = createEventDispatcher<{ selectAsset: Asset }>();
  
  function handleSelect(asset: Asset) {
    if (asset.available) {
      dispatch('selectAsset', asset);
    }
  }
  
  function getStatusClass(status: Asset['calibrationStatus']) {
    switch (status) {
      case 'Calibrated':
        return 'status-success';
      case 'Due Soon':
        return 'status-warning';
      case 'Overdue':
        return 'status-danger';
      default:
        return 'status-info';
    }
  }
</script>

<div class="asset-list">
  {#if assets.length === 0}
    <div class="no-assets">
      <p>No assets found.</p>
      <p>Please reload the page to initialize default assets.</p>
    </div>
  {:else}
    {#each assets as asset}
      <div 
        class="asset-card {asset.available ? 'available' : 'unavailable'}"
        on:click={() => handleSelect(asset)}
        role="button"
        tabindex="0"
        on:keypress={(e) => e.key === 'Enter' && handleSelect(asset)}
      >
        <div class="asset-header">
          <h3>{asset.name}</h3>
          <span class="asset-id">ID: {asset.id}</span>
        </div>
        
        <div class="asset-details">
          <div class="detail">
            <span class="label">Type:</span> 
            <span>{asset.type}</span>
          </div>
          
          <div class="detail">
            <span class="label">Location:</span> 
            <span>{asset.location || 'Not specified'}</span>
          </div>
          
          <div class="detail">
            <span class="label">Calibration:</span> 
            <span class="status {getStatusClass(asset.calibrationStatus)}">{asset.calibrationStatus}</span>
          </div>
        </div>
        
        <div class="availability-badge {asset.available ? 'available' : 'unavailable'}">
          {asset.available ? 'Available' : 'Unavailable'}
        </div>
      </div>
    {/each}
  {/if}
</div>

<style>
  .asset-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .no-assets {
    text-align: center;
    color: #666;
    padding: 20px;
    border: 1px dashed #ddd;
    border-radius: 5px;
  }
  
  .asset-card {
    background: white;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 15px;
    position: relative;
    transition: all 0.2s ease;
    cursor: pointer;
  }
  
  .asset-card.available:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .asset-card.unavailable {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .asset-header {
    margin-bottom: 10px;
  }
  
  .asset-header h3 {
    margin: 0;
    font-size: 1.2rem;
  }
  
  .asset-id {
    font-size: 0.8rem;
    color: #666;
  }
  
  .asset-details {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .detail {
    font-size: 0.9rem;
  }
  
  .label {
    font-weight: bold;
    color: #555;
  }
  
  .status {
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.8rem;
  }
  
  .status-success {
    background: #d4edda;
    color: #155724;
  }
  
  .status-warning {
    background: #fff3cd;
    color: #856404;
  }
  
  .status-danger {
    background: #f8d7da;
    color: #721c24;
  }
  
  .status-info {
    background: #d1ecf1;
    color: #0c5460;
  }
  
  .availability-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 3px 8px;
    border-radius: 3px;
    font-size: 0.8rem;
    font-weight: bold;
  }
  
  .availability-badge.available {
    background: #28a745;
    color: white;
  }
  
  .availability-badge.unavailable {
    background: #dc3545;
    color: white;
  }
</style>