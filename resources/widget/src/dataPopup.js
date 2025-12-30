/**
 * Data Popup Component
 * Displays extracted document fields in a modal with copy functionality
 */

export function showDataPopup(extractedFields, container) {
    // Create popup overlay
    const popup = document.createElement("div");
    popup.className = "idscan-data-popup-overlay";

    // Build fields HTML
    const fieldsHTML = buildFieldsHTML(extractedFields);
    const jsonHTML = buildJsonHTML(extractedFields);

    popup.innerHTML = `
    <div class="idscan-data-popup">
      <div class="idscan-data-popup-header">
        <h3 class="idscan-data-popup-title">Extracted Document Data</h3>
        <button class="idscan-data-popup-close" aria-label="Close">×</button>
      </div>
      <div class="idscan-data-popup-tabs">
        <button class="idscan-data-popup-tab active" data-tab="json">JSON</button>
        <button class="idscan-data-popup-tab" data-tab="formatted">Formatted</button>
      </div>
      <div class="idscan-data-popup-content">
        <div class="idscan-data-tab-content active" data-content="json">
          ${jsonHTML}
        </div>
        <div class="idscan-data-tab-content" data-content="formatted">
          ${fieldsHTML}
        </div>
      </div>
    </div>
  `;

    // Add to container
    container.appendChild(popup);

    // Add event listeners
    setupEventListeners(popup, container);

    // Trigger animation
    setTimeout(() => popup.classList.add("active"), 10);
}

function buildFieldsHTML(extractedFields) {
    let html = '';

    // Basic document info (always at top)
    if (extractedFields.document_type) {
        html += createFieldHTML('Document Type', extractedFields.document_type, 'document_type');
    }

    if (extractedFields.issuing_country) {
        html += createFieldHTML('Issuing Country', extractedFields.issuing_country, 'issuing_country');
    }

    // Dynamic fields (only show if present)
    const fieldLabels = {
        name: 'Name',
        dob: 'Date of Birth',
        place_of_birth: 'Place of Birth',
        gender: 'Gender',
        nationality: 'Nationality',
        document_number: 'Document Number',
        issue_date: 'Issue Date',
        expiry_date: 'Expiry Date',
        card_number: 'Card Number'
    };

    for (const [key, label] of Object.entries(fieldLabels)) {
        if (extractedFields[key]) {
            const field = extractedFields[key];
            const value = field.normalized_value || field.raw_value || field;

            if (value) {
                html += createFieldHTML(label, value, key);
            }
        }
    }

    return html || '<p class="idscan-data-popup-empty">No data extracted</p>';
}

function buildJsonHTML(extractedFields) {
    const jsonString = JSON.stringify(extractedFields, null, 2);

    return `
    <div class="idscan-data-json-container">
      <div class="idscan-data-json-header">
        <button class="idscan-data-json-copy" data-json='${escapeHtml(jsonString)}' title="Copy JSON">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Copy JSON
        </button>
      </div>
      <pre class="idscan-data-json-code"><code>${escapeHtml(jsonString)}</code></pre>
    </div>
  `;
}

function createFieldHTML(label, value, key) {
    return `
    <div class="idscan-data-field">
      <label class="idscan-data-field-label">${label}</label>
      <div class="idscan-data-field-input-wrapper">
        <input 
          type="text" 
          class="idscan-data-field-input" 
          value="${escapeHtml(value)}" 
          readonly
          data-field="${key}"
        />
        <button 
          class="idscan-data-field-copy" 
          data-value="${escapeHtml(value)}"
          aria-label="Copy ${label}"
          title="Copy to clipboard"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>
    </div>
  `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function setupEventListeners(popup, container) {
    // Close button
    const closeBtn = popup.querySelector('.idscan-data-popup-close');
    closeBtn.addEventListener('click', () => closePopup(popup));

    // Close on overlay click
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            closePopup(popup);
        }
    });

    // Tab switching
    const tabs = popup.querySelectorAll('.idscan-data-popup-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => handleTabSwitch(tab, popup));
    });

    // Copy buttons for formatted fields
    const copyButtons = popup.querySelectorAll('.idscan-data-field-copy');
    copyButtons.forEach(button => {
        button.addEventListener('click', () => handleCopy(button));
    });

    // Copy JSON button
    const jsonCopyBtn = popup.querySelector('.idscan-data-json-copy');
    if (jsonCopyBtn) {
        jsonCopyBtn.addEventListener('click', () => handleJsonCopy(jsonCopyBtn));
    }

    // ESC key to close
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            closePopup(popup);
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}

function handleTabSwitch(clickedTab, popup) {
    const tabName = clickedTab.getAttribute('data-tab');

    // Update active tab
    popup.querySelectorAll('.idscan-data-popup-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    clickedTab.classList.add('active');

    // Update active content
    popup.querySelectorAll('.idscan-data-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    popup.querySelector(`[data-content="${tabName}"]`).classList.add('active');
}

function handleCopy(button) {
    const value = button.getAttribute('data-value');

    // Copy to clipboard
    navigator.clipboard.writeText(value).then(() => {
        // Show success feedback
        const originalHTML = button.innerHTML;
        button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
        button.classList.add('copied');

        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copied');
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
    });
}

function handleJsonCopy(button) {
    const jsonString = button.getAttribute('data-json');

    // Copy to clipboard
    navigator.clipboard.writeText(jsonString).then(() => {
        // Show success feedback
        const originalHTML = button.innerHTML;
        button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      Copied!
    `;
        button.classList.add('copied');

        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copied');
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
    });
}

function closePopup(popup) {
    popup.classList.remove('active');
    setTimeout(() => {
        popup.remove();
    }, 300);
}

// Styles for the popup
export const dataPopupStyles = `
  .idscan-data-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
    padding: 20px;
  }
  
  .idscan-data-popup-overlay.active {
    opacity: 1;
  }
  
  .idscan-data-popup {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 500px;
    width: 100%;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    transform: scale(0.9);
    transition: transform 0.3s ease;
  }
  
  .idscan-data-popup-overlay.active .idscan-data-popup {
    transform: scale(1);
  }
  
  .idscan-data-popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 0;
    border-bottom: none;
  }
  
  .idscan-data-popup-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #111827;
  }
  
  .idscan-data-popup-close {
    background: none;
    border: none;
    font-size: 32px;
    line-height: 1;
    color: #6b7280;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s;
  }
  
  .idscan-data-popup-close:hover {
    background: #f3f4f6;
    color: #111827;
  }

  .idscan-data-popup-tabs {
    display: flex;
    gap: 8px;
    padding: 16px 24px 0;
    border-bottom: 1px solid #e5e7eb;
  }

  .idscan-data-popup-tab {
    background: none;
    border: none;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    position: relative;
    bottom: -1px;
  }

  .idscan-data-popup-tab:hover {
    color: #374151;
  }

  .idscan-data-popup-tab.active {
    color: #3b82f6;
    border-bottom-color: #3b82f6;
  }
  
  .idscan-data-popup-content {
    padding: 0;
    overflow-y: auto;
    flex: 1;
  }

  .idscan-data-tab-content {
    display: none;
    padding: 24px;
  }

  .idscan-data-tab-content.active {
    display: block;
  }

  .idscan-data-json-container {
    position: relative;
  }

  .idscan-data-json-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 12px;
  }

  .idscan-data-json-copy {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .idscan-data-json-copy:hover {
    background: #2563eb;
  }

  .idscan-data-json-copy.copied {
    background: #10b981;
  }

  .idscan-data-json-code {
    background: #1f2937;
    color: #e5e7eb;
    padding: 16px;
    border-radius: 8px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    line-height: 1.6;
    overflow-x: auto;
    margin: 0;
  }

  .idscan-data-json-code code {
    color: inherit;
    background: none;
  }
  
  .idscan-data-field {
    margin-bottom: 20px;
  }
  
  .idscan-data-field:last-child {
    margin-bottom: 0;
  }
  
  .idscan-data-field-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 6px;
  }
  
  .idscan-data-field-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .idscan-data-field-input {
    width: 100%;
    padding: 10px 45px 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    color: #111827;
    background: #f9fafb;
    cursor: default;
    font-family: inherit;
  }
  
  .idscan-data-field-input:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
  }
  
  .idscan-data-field-copy {
    position: absolute;
    right: 8px;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 6px 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    transition: all 0.2s;
  }
  
  .idscan-data-field-copy:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
    color: #374151;
  }
  
  .idscan-data-field-copy.copied {
    background: #10b981;
    border-color: #10b981;
    color: white;
  }
  
  .idscan-data-popup-empty {
    text-align: center;
    color: #6b7280;
    padding: 40px 20px;
    margin: 0;
  }
  
  @media (max-width: 640px) {
    .idscan-data-popup {
      max-width: 100%;
      max-height: 90vh;
      margin: 10px;
    }
    
    .idscan-data-popup-header {
      padding: 16px 20px 0;
    }
    
    .idscan-data-popup-title {
      font-size: 18px;
    }

    .idscan-data-popup-tabs {
      padding: 12px 20px 0;
    }

    .idscan-data-popup-tab {
      padding: 8px 12px;
      font-size: 13px;
    }
    
    .idscan-data-tab-content {
      padding: 20px;
    }

    .idscan-data-json-code {
      font-size: 12px;
      padding: 12px;
    }
  }
`;
