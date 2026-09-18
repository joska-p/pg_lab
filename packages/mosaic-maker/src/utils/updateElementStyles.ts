type ComputedStyles = Record<string, string>;

function updateElementStyles(element: HTMLElement, styles: ComputedStyles): void {
  for (const [prop, value] of Object.entries(styles)) {
    element.style.setProperty(prop, value);
  }
}

export { updateElementStyles };
