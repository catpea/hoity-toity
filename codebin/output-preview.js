/*

// Basic usage with HTML attribute
<output-preview html="<h1>Hello World</h1>"></output-preview>

// Using the update method with separate code
const preview = document.querySelector('output-preview');
preview.update(
  '<h1>Hello</h1>',           // HTML
  'h1 { color: blue; }',       // CSS
  'console.log("Ready!");'     // JavaScript
);

// Listen for console output
preview.addEventListener('console', (e) => {
  console.log('From iframe:', e.detail.method, e.detail.args);
});

// Get all console messages
const messages = preview.getConsoleMessages();

// Clear the preview
preview.clear();

*/

class OutputPreview extends HTMLElement {
  static observedAttributes = ["html"];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.iframe = null;
    this.consoleMessages = [];
  }

  connectedCallback() {
    console.log("Output preview element added to page.");

    // Create the shadow DOM structure
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
          position: relative;
          background: white;
        }

        iframe {
          width: 100%;
          height: 100%;
          border: none;
          background: white;
        }

        .error-overlay {
          position: absolute;
          top: 0;
          right: 0;
          background: #dc3545;
          color: white;
          padding: 4px 8px;
          font-size: 12px;
          border-bottom-left-radius: 4px;
          display: none;
          z-index: 10;
          font-family: monospace;
        }

        .error-overlay.show {
          display: block;
        }
      </style>
      <iframe
        sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
        frameborder="0">
      </iframe>
      <div class="error-overlay"></div>
    `;

    this.iframe = this.shadowRoot.querySelector('iframe');
    this.errorOverlay = this.shadowRoot.querySelector('.error-overlay');

    // Initialize with current HTML if present
    const currentHtml = this.getAttribute('html');
    if (currentHtml) {
      this.render(currentHtml);
    }
  }

  disconnectedCallback() {
    console.log("Output preview element removed from page.");
    // Clean up if needed
    this.iframe = null;
  }

  adoptedCallback() {
    console.log("Output preview element moved to new page.");
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`Attribute ${name} has changed.`);

    if (name === 'html' && this.iframe) {
      this.render(newValue);
    }
  }

  // Main render method - accepts complete HTML
  render(html) {
    if (!this.iframe) return;

    try {
      // Clear any previous error indicators
      this.errorOverlay.classList.remove('show');
      this.errorOverlay.textContent = '';

      // Create the document content with console override
      const documentContent = this.createDocument(html);

      // Write to iframe
      const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(documentContent);
      iframeDoc.close();

      // Set up error handling
      this.setupErrorHandling();

    } catch (error) {
      this.showError(`Render Error: ${error.message}`);
      console.error('Output preview render error:', error);
    }
  }

  // Create the complete document with injected scripts for console capture
  createDocument(html) {
    // Extract CSS and JS from the HTML if they're embedded
    // This allows for both inline and separate CSS/JS

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Reset some defaults for consistent rendering */
    * {
      box-sizing: border-box;
    }
    :root {
      color-scheme: light dark;
    }
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #212529; /* Dark background */
        color: #f9fafa; /* Light text */
      }
    }
    body {
      margin: 0;
      padding: 16px;
      font-family: system-ui, -apple-system, sans-serif;
    }
  </style>
  <script>
    // Override console methods to capture output
    (function() {
      const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info,
        debug: console.debug
      };

      function sendMessage(type, args) {
        // Send to parent window
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'console',
            method: type,
            args: Array.from(args).map(arg => {
              try {
                if (typeof arg === 'object') {
                  return JSON.stringify(arg, null, 2);
                }
                return String(arg);
              } catch (e) {
                return String(arg);
              }
            })
          }, '*');
        }

        // Still call original console
        originalConsole[type].apply(console, args);
      }

      console.log = function() { sendMessage('log', arguments); };
      console.error = function() { sendMessage('error', arguments); };
      console.warn = function() { sendMessage('warn', arguments); };
      console.info = function() { sendMessage('info', arguments); };
      console.debug = function() { sendMessage('debug', arguments); };

      // Capture runtime errors
      window.addEventListener('error', function(event) {
        sendMessage('error', [event.message + ' (Line: ' + event.lineno + ')']);
      });

      // Capture unhandled promise rejections
      window.addEventListener('unhandledrejection', function(event) {
        sendMessage('error', ['Unhandled Promise Rejection: ' + event.reason]);
      });
    })();
  </script>
</head>
<body>
${html}
</body>
</html>`;
  }

  // Set up error handling and message passing
  setupErrorHandling() {
    if (!this.iframe || !this.iframe.contentWindow) return;

    // Listen for console messages from iframe
    const messageHandler = (event) => {
      // Only handle messages from our iframe
      if (event.source !== this.iframe.contentWindow) return;

      if (event.data && event.data.type === 'console') {
        // Store console message
        this.consoleMessages.push({
          method: event.data.method,
          args: event.data.args,
          timestamp: new Date()
        });

        // Dispatch custom event for console output
        this.dispatchEvent(new CustomEvent('console', {
          detail: {
            method: event.data.method,
            args: event.data.args
          },
          bubbles: true,
          composed: true
        }));

        // Show error overlay for errors
        if (event.data.method === 'error') {
          this.showError(event.data.args.join(' '));
        }
      }
    };

    // Remove any existing listener
    window.removeEventListener('message', this._messageHandler);

    // Store reference and add new listener
    this._messageHandler = messageHandler;
    window.addEventListener('message', messageHandler);
  }

  // Show error in overlay
  showError(message) {
    this.errorOverlay.textContent = message;
    this.errorOverlay.classList.add('show');

    // Auto-hide after 5 seconds
    clearTimeout(this._errorTimeout);
    this._errorTimeout = setTimeout(() => {
      this.errorOverlay.classList.remove('show');
    }, 5000);
  }

  // Public methods

  // Update with separate HTML, CSS, and JS
  update(html = '', css = '', javascript = '') {
    const fullHtml = this.combineCode(html, css, javascript);
    this.render(fullHtml);
  }

  // Combine separate HTML, CSS, and JS into complete document
  combineCode(html, css, javascript) {
    // If HTML already has <html> tags, inject CSS and JS appropriately
    if (html.includes('<html')) {
      // This is a complete document, inject into it
      let result = html;

      // Inject CSS before closing head or body
      if (css) {
        const styleTag = `<style>${css}</style>`;
        if (result.includes('</head>')) {
          result = result.replace('</head>', `${styleTag}\n</head>`);
        } else if (result.includes('<body>')) {
          result = result.replace('<body>', `<body>\n${styleTag}`);
        } else {
          result = styleTag + '\n' + result;
        }
      }

      // Inject JS before closing body or at end
      if (javascript) {
        const scriptTag = `<script>${javascript}<\/script>`;
        if (result.includes('</body>')) {
          result = result.replace('</body>', `${scriptTag}\n</body>`);
        } else {
          result = result + '\n' + scriptTag;
        }
      }

      return result;
    } else {
      // This is a fragment, create complete document
      return `${css ? `<style>${css}</style>\n` : ''}${html}${javascript ? `\n<script>${javascript}<\/script>` : ''}`;
    }
  }

  // Clear the preview
  clear() {
    if (this.iframe) {
      const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write('<!DOCTYPE html><html><head></head><body></body></html>');
      iframeDoc.close();
    }
    this.consoleMessages = [];
    this.errorOverlay.classList.remove('show');
  }

  // Get console messages
  getConsoleMessages() {
    return [...this.consoleMessages];
  }

  // Clear console messages
  clearConsole() {
    this.consoleMessages = [];
    this.dispatchEvent(new CustomEvent('console-clear', {
      bubbles: true,
      composed: true
    }));
  }
}

// Register the custom element
customElements.define("output-preview", OutputPreview);
