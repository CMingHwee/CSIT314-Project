/*
 * Shared behaviour for the three report boundaries:
 * the Generate button, "No data available…" messages, Download PDF (browser print → Save as PDF)
 * and Download CSV. Subclasses supply run(), render() and csvRows().
 */
class ReportPanel {
  constructor(panelId, inputId, defaultValue, placeholder) {
    this.panel = UI.el(panelId);
    this.input = UI.el(inputId);
    this.defaultValue = defaultValue;
    this.placeholder = placeholder;
    this.output = this.panel.querySelector('[data-output]');
    this.pdfBtn = this.panel.querySelector('[data-pdf]');
    this.csvBtn = this.panel.querySelector('[data-csv]');
    this.last = null;
  }

  displayPage() {
    this.input.value = this.defaultValue;
    this.showMessage(this.placeholder);
    this.panel.querySelector('[data-generate]').addEventListener('click', () => this.generate());
    this.input.addEventListener('keydown', e => { if (e.key === 'Enter') this.generate(); });
    this.pdfBtn.addEventListener('click', () => this.downloadPdf());
    this.csvBtn.addEventListener('click', () => UI.downloadCsv(this.csvName(this.last), this.csvRows(this.last)));
  }

  generate() {
    UI.clearFieldErrors(this.panel);
    const result = this.run(this.input.value);

    if (Object.keys(result.fields).length) {
      UI.showFieldErrors(this.panel, result.fields);
      this.setDownloads(null);
      return;
    }
    if (!result.success) {
      this.displayError(result);
      return;
    }
    this.displaySuccess(result);
  }

  // "No data available for today." etc.
  displayError(result) {
    this.showMessage(result.message);
    this.setDownloads(null);
  }

  displaySuccess(result) {
    this.output.innerHTML = this.render(result);
    this.setDownloads(result);
  }

  showMessage(text) {
    this.output.innerHTML = `<p class="report-placeholder">${UI.escape(text)}</p>`;
  }

  setDownloads(result) {
    this.last = result;
    this.pdfBtn.disabled = !result;
    this.csvBtn.disabled = !result;
  }

  // The print stylesheet hides navigation and controls; "Save as PDF" in the print dialog gives the file.
  downloadPdf() {
    const title = document.title;
    document.title = this.csvName(this.last).replace(/\.csv$/, '');
    window.print();
    document.title = title;
  }
}
