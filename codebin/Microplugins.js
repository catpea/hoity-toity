
export class Microplugins {
        #disposables = new Set();
        constructor(){
          this.initialize();
          this.start()
        }

        initialize(){
          const isWebComponent = !!this?.shadowRoot;
          const rootElement = isWebComponent?this.shadowRoot:document.head;

          const animationSpeed = 0.187;

          const cssText = `
            .col.col-shown {
              animation: zoomIn ${animationSpeed}s ease-out;
              display: block !important;
            }
            /* Zoom‑in keyframes */
            @keyframes zoomIn {
              0% {
                transform: scale(0.8);
                opacity: 0;
              }
              60% {
                transform: scale(1.03);
                opacity: 1;
              }
              100% {
                transform: scale(1);
                opacity: 1;
              }
            }

            .col.col-hidden {
              animation: zoomOut ${animationSpeed}s ease-out forwards;
            }

            @keyframes zoomOut {
              0% {
                transform: scale(1);
                opacity: 1;
              }
              60% {
                transform: scale(1.03);
                opacity: 0;
              }
              100% {
                transform: scale(0.8);
                opacity: 0;
                position: absolute;
                pointer-events: none;
                z-index: -1;
              }
            }
          `;
          const style = document.createElement('style');
          style.textContent = cssText;
          rootElement.prepend(style);
        }

        start(){
          const clickHandler = this.#clickEvent.bind(this);
          document.addEventListener('click', clickHandler);
          this.#disposables.add({dispose: ()=>document.removeEventListener('click', clickHandler)});
        }

        terminate(){
          this.#disposables.forEach(disposable=>disposable.dispose());
          this.#disposables.clear()
        }

        #clickEvent(event){
          // Find the closest element that has the data-function attribute
          const sourceElement = event.target.closest('[data-function]');
          if (!sourceElement) return; // No matching element – ignore the click
          // Prevent default action for links/buttons if needed
          if (sourceElement.tagName === 'A' && sourceElement.getAttribute('href') === '#') {
            event.preventDefault();
          }
          // let it fail naturally no try/catch needed
          const functionName = sourceElement.getAttribute('data-function');
          const targetSelector = sourceElement.getAttribute('data-target');
          const targetElement = document.getElementById(targetSelector);
          const optionsString = sourceElement.getAttribute('data-options');
          const functionOptions = optionsString?JSON.parse(optionsString):null;
          if(functionName in this) this[functionName](sourceElement, targetElement, functionOptions);
        }

        columnToggler(button, column, options){
          button.classList.toggle('active');
          column.classList.toggle('col-shown');
          column.classList.toggle('col-hidden');
        }

      }
