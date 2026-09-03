/**
 * Utility to reliably open a print window or trigger print via iframe fallback.
 * Prevents multiple print dialog loops, cleanly handles user cancellation,
 * and automatically closes the temporary print tab when finished or cancelled.
 */
export function printHTML(htmlContent: string) {
  // 1. Strip any inline body onload="window.print()" or duplicate window.print() triggers
  let cleanHtml = htmlContent
    .replace(/<body([^>]*)onload=["'][^"']*window\.print\(\)[^"']*["']([^>]*)>/gi, '<body$1$2>')
    .replace(/onload\s*=\s*["']\s*window\.print\(\s*\);?\s*["']/gi, '');

  // 2. Inject floating cancellation/action bar and afterprint auto-close handler
  const toolbarAndScript = `
    <style id="print-helper-styles">
      @media print {
        .print-helper-toolbar { display: none !important; }
      }
      .print-helper-toolbar {
        position: fixed;
        top: 12px;
        right: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 2147483647;
        background: #0f172a;
        padding: 6px 10px;
        border-radius: 8px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.25);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .print-helper-btn {
        padding: 6px 14px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        border: none;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: all 0.15s ease;
      }
      .print-helper-btn-print {
        background: #0d9488;
        color: #ffffff;
      }
      .print-helper-btn-print:hover {
        background: #0f766e;
      }
      .print-helper-btn-close {
        background: #334155;
        color: #f8fafc;
        border: 1px solid #475569;
      }
      .print-helper-btn-close:hover {
        background: #475569;
      }
    </style>
    <div class="print-helper-toolbar no-print">
      <button type="button" class="print-helper-btn print-helper-btn-print" onclick="window.print()">🖨️ Print</button>
      <button type="button" class="print-helper-btn print-helper-btn-close" onclick="window.close()">✕ Cancel & Close</button>
    </div>
    <script>
      (function() {
        // Automatically close popup window when user either prints OR cancels the print dialog
        window.addEventListener('afterprint', function() {
          setTimeout(function() {
            try { window.close(); } catch(e) {}
          }, 150);
        });
      })();
    </script>
  `;

  if (cleanHtml.includes('</body>')) {
    cleanHtml = cleanHtml.replace('</body>', `${toolbarAndScript}</body>`);
  } else {
    cleanHtml += toolbarAndScript;
  }

  try {
    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(cleanHtml);
      printWin.document.close();

      // Listen for afterprint directly on popup window to auto-close upon print or cancel
      try {
        printWin.addEventListener('afterprint', () => {
          setTimeout(() => {
            try {
              printWin.close();
            } catch (e) {}
          }, 150);
        });
      } catch (e) {}

      let hasTriggered = false;
      const triggerSinglePrint = () => {
        if (hasTriggered) return;
        hasTriggered = true;
        try {
          printWin.focus();
          printWin.print();
        } catch (e) {
          console.warn('Popup print trigger skipped or cancelled:', e);
          // NOTE: Do NOT call triggerIframePrint here. That causes duplicate print dialogs
          // when a user cancels or when the print dialog is already open.
        }
      };

      if (printWin.document.readyState === 'complete') {
        setTimeout(triggerSinglePrint, 250);
      } else {
        printWin.onload = () => {
          setTimeout(triggerSinglePrint, 250);
        };
        // Safety timeout in case onload already fired
        setTimeout(triggerSinglePrint, 500);
      }
      return;
    }
  } catch (e) {
    console.error('window.open failed, falling back to iframe printing:', e);
  }

  // Fallback: only execute iframe print if popup window was completely blocked by browser
  triggerIframePrint(htmlContent);
}

function triggerIframePrint(htmlContent: string) {
  let iframe = document.getElementById('global-print-iframe') as HTMLIFrameElement;
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'global-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    iframe.style.zIndex = '-9999';
    document.body.appendChild(iframe);
  }

  // Strip all scripts and inline onload to prevent loop
  const sanitized = htmlContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/onload\s*=\s*["'][^"']*["']/gi, '');

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(sanitized);
    doc.close();
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.error('Iframe print error:', e);
      }
    }, 350);
  }
}
