/**
 * Loading Indicator Component
 * Shows a full-screen loading overlay while processing document
 */

export function showLoadingIndicator(container) {
    // Check if loading indicator already exists
    let loading = container.querySelector('.idscan-loading-overlay');

    if (!loading) {
        loading = document.createElement('div');
        loading.className = 'idscan-loading-overlay';
        loading.innerHTML = `
      <div class="idscan-loading-content">
        <div class="idscan-loading-spinner">
          <div class="idscan-spinner-ring"></div>
          <div class="idscan-spinner-ring"></div>
          <div class="idscan-spinner-ring"></div>
        </div>
        <h3 class="idscan-loading-title">Processing Document</h3>
        <p class="idscan-loading-subtitle">Please wait while we extract the data...</p>
      </div>
    `;

        container.appendChild(loading);
    }

    // Trigger animation
    setTimeout(() => loading.classList.add('active'), 10);

    return loading;
}

export function hideLoadingIndicator(container) {
    const loading = container.querySelector('.idscan-loading-overlay');

    if (loading) {
        loading.classList.remove('active');
        setTimeout(() => {
            loading.remove();
        }, 300);
    }
}

export const loadingIndicatorStyles = `
  .idscan-loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .idscan-loading-overlay.active {
    opacity: 1;
  }
  
  .idscan-loading-content {
    text-align: center;
    transform: scale(0.9);
    transition: transform 0.3s ease;
  }
  
  .idscan-loading-overlay.active .idscan-loading-content {
    transform: scale(1);
  }
  
  .idscan-loading-spinner {
    position: relative;
    width: 80px;
    height: 80px;
    margin: 0 auto 24px;
  }
  
  .idscan-spinner-ring {
    position: absolute;
    width: 64px;
    height: 64px;
    margin: 8px;
    border: 4px solid transparent;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: idscan-spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  }
  
  .idscan-spinner-ring:nth-child(1) {
    animation-delay: -0.45s;
    border-top-color: #3b82f6;
  }
  
  .idscan-spinner-ring:nth-child(2) {
    animation-delay: -0.3s;
    border-top-color: #60a5fa;
  }
  
  .idscan-spinner-ring:nth-child(3) {
    animation-delay: -0.15s;
    border-top-color: #93c5fd;
  }
  
  @keyframes idscan-spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  
  .idscan-loading-title {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 600;
    color: #ffffff;
  }
  
  .idscan-loading-subtitle {
    margin: 0;
    font-size: 16px;
    color: #d1d5db;
    font-weight: 400;
  }
  
  @media (max-width: 640px) {
    .idscan-loading-spinner {
      width: 64px;
      height: 64px;
    }
    
    .idscan-spinner-ring {
      width: 48px;
      height: 48px;
      margin: 8px;
      border-width: 3px;
    }
    
    .idscan-loading-title {
      font-size: 20px;
    }
    
    .idscan-loading-subtitle {
      font-size: 14px;
    }
  }
`;
