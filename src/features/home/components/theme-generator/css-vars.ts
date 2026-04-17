export function getComputedCssVar(variable: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

export function setCssVar(variable: string, value: string) {
  document.documentElement.style.setProperty(variable, value);
}
