# hoity-toity
Hoity Toity: Feature Packed Code Editor Web Component

```bash

npm i hoity-toity;

```

```HTML
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>demo</title>
    <script src="hoity-toity.js"></script>
  </head>
  <body>
    <h1>Hello, world!</h1>
    <hoity-toity id="js" language="javascript" value="console.log('bork!');"></hoity-toity>
    <!-- see index.html for a codebin demo -->
    <script>
      const js = document.getElementById("js");
      js.addEventListener('change', (e)=>console.log(e.detail.value));
    </script>
  </body>
</html>
```

---

## Key Features:

1. **Multi-language Support**: The component supports JavaScript, HTML, and CSS through CodeMirror's language modules
2. **Shadow DOM**: Uses Shadow DOM for style encapsulation
3. **Reactive Attributes**: Responds to `language`, `theme`, and `value` attribute changes
4. **Custom Events**: Emits a `change` event when content is modified
5. **Public Methods**: Exposes `getValue()`, `setValue()`, and `focus()` methods

## Usage Example:

```html
<!-- Basic usage -->
<hoity-toity language="javascript" wrap="true"></hoity-toity>

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

<!-- multiple editors -->

<div class="row">
  <div id="collapseJs" class="col col-shown" style="">
    <hoity-toity id="js" language="javascript"></hoity-toity>
  </div>
  <div id="collapseCss" class="col col-shown" style="">
    <hoity-toity id="css" language="css"></hoity-toity>
  </div>
  <div id="collapseHtml" class="col col-shown" style="">
    <hoity-toity id="html" language="html"></hoity-toity>
  </div>
</div>

```
