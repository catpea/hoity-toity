import {EditorView, basicSetup} from "codemirror"
import {javascript} from "@codemirror/lang-javascript"
import {html} from "@codemirror/lang-html"
import {css} from "@codemirror/lang-css"

// Create a class for the element
class HoityToity extends HTMLElement {
  static observedAttributes = ["language", "theme", "value"];

  constructor() {
    super();
    this.editor = null;
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    console.log("Custom element added to page.");

    // Create container and styles
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }
        .editor-container {
          height: 100%;
          min-height: 300px;
        }
        /* CodeMirror will be styled within */
        .cm-editor {
          height: 100%;
        }
        .cm-focused {
          outline: none;
        }
      </style>
      <div class="editor-container"></div>
    `;

    const container = this.shadowRoot.querySelector('.editor-container');

    // Get initial values from attributes
    const language = this.getAttribute('language') || 'javascript';
    const initialValue = this.getAttribute('value') || this.getDefaultCode(language);

    // Create editor with appropriate language support
    this.editor = new EditorView({
      doc: initialValue,
      extensions: [
        basicSetup,
        this.getLanguageExtension(language)
      ],
      parent: container
    });

    // Dispatch custom event when content changes
    this.editor.dom.addEventListener('input', () => {
      this.dispatchEvent(new CustomEvent('change', {
        detail: {
          value: this.editor.state.doc.toString()
        },
        bubbles: true,
        composed: true
      }));
    });
  }

  disconnectedCallback() {
    console.log("Custom element removed from page.");
    if (this.editor) {
      this.editor.destroy();
      this.editor = null;
    }
  }

  adoptedCallback() {
    console.log("Custom element moved to new page.");
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`Attribute ${name} has changed from ${oldValue} to ${newValue}`);

    if (!this.editor) return;

    switch(name) {
      case 'language':
        this.updateLanguage(newValue);
        break;
      case 'value':
        this.setValue(newValue);
        break;
      case 'theme':
        // Theme support can be added here
        console.log(`Theme changed to: ${newValue}`);
        break;
    }
  }

  // Helper methods
  getLanguageExtension(language) {
    switch(language) {
      case 'html':
        return html();
      case 'css':
        return css();
      case 'javascript':
      case 'js':
      default:
        return javascript();
    }
  }

  getDefaultCode(language) {
    switch(language) {
      case 'html':
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>Hello World</h1>
</body>
</html>`;
      case 'css':
        return `/* Your CSS here */
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: 20px;
}

h1 {
  color: #333;
}`;
      case 'javascript':
      case 'js':
      default:
        return `// Your JavaScript here
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');`;
    }
  }

  updateLanguage(language) {
    // To change language, we need to recreate the editor
    // Store current content
    const currentValue = this.editor.state.doc.toString();

    // Destroy old editor
    this.editor.destroy();

    // Create new editor with new language
    const container = this.shadowRoot.querySelector('.editor-container');
    this.editor = new EditorView({
      doc: currentValue,
      extensions: [
        basicSetup,
        this.getLanguageExtension(language)
      ],
      parent: container
    });

    // Re-attach event listener
    this.editor.dom.addEventListener('input', () => {
      this.dispatchEvent(new CustomEvent('change', {
        detail: {
          value: this.editor.state.doc.toString()
        },
        bubbles: true,
        composed: true
      }));
    });
  }

  // Public methods
  getValue() {
    return this.editor ? this.editor.state.doc.toString() : '';
  }

  setValue(value) {
    if (!this.editor) return;

    this.editor.dispatch({
      changes: {
        from: 0,
        to: this.editor.state.doc.length,
        insert: value
      }
    });
  }

  focus() {
    if (this.editor) {
      this.editor.focus();
    }
  }
}

// Register the custom element
customElements.define("hoity-toity", HoityToity);
