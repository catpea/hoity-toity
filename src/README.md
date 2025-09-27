## Key Features:

1. **Multi-language Support**: The component supports JavaScript, HTML, and CSS through CodeMirror's language modules
2. **Shadow DOM**: Uses Shadow DOM for style encapsulation
3. **Reactive Attributes**: Responds to `language`, `theme`, and `value` attribute changes
4. **Custom Events**: Emits a `change` event when content is modified
5. **Public Methods**: Exposes `getValue()`, `setValue()`, and `focus()` methods

## Usage Example:

```html
<!-- Basic usage -->
<hoity-toity language="javascript"></hoity-toity>

<!-- With initial value -->
<hoity-toity language="html" value="<h1>Hello</h1>"></hoity-toity>

<!-- Listen for changes -->
<hoity-toity id="editor" language="css"></hoity-toity>
<script>
  const editor = document.getElementById('editor');
  editor.addEventListener('change', (e) => {
    console.log('Content changed:', e.detail.value);
  });
</script>
```
