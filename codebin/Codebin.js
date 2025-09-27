export class Codebin {
  constructor({ js, css, html, preview, debounceDelay = 300 }) {
    this.editors = { js, css, html };
    this.preview = preview;
    this._debounceDelay = debounceDelay;

    // Bind once so we can remove listeners later if needed
    this._handleChange = this._debounce(this.updatePreview.bind(this), this._debounceDelay);

    // Listen for changes
    Object.values(this.editors).forEach(editor => {
      editor.addEventListener('change', this._handleChange);
    });

    // Initial render
    this.updatePreview();
  }

  /** Debounce helper – returns a wrapper that postpones `fn` */
  _debounce(fn, wait) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), wait);
    };
  }

  updatePreview() {
    console.log(this, this.editors)
    console.log(this.editors.html)
    const html = this.editors.html.getValue();
    const css  = this.editors.css.getValue();
    const js   = this.editors.js.getValue();

    this.preview.update(html, css, js);
  }
}
