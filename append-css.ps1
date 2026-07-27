$path = "c:\Users\maste\OneDrive\Desktop\E-Library\css\textbook-library.css"
$css = @"

/* ===== FOOTER STYLES ===== */
.site-footer {
  position: relative;
  z-index: 1;
  border-top: 1px solid rgba(255,255,255,0.06);
  padding: 60px 32px 0;
  margin-top: 40px;
}
.footer-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 60px;
  padding-bottom: 40px;
}
.footer-brand h3 {
  font-size: 1.4rem;
  font-weight: 900;
  letter-spacing: 3px;
  text-transform: uppercase;
  background: linear-gradient(135deg, var(--primary), var(--accent-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}
.footer-brand p {
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.7;
  margin-bottom: 20px;
}
.footer-social {
  display: flex;
  gap: 10px;
}
.footer-social a {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 50%;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 700;
  transition: all var(--transition);
}
.footer-social a:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: rgba(154,230,255,0.06);
}
.footer-links {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}
.footer-col h4 {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
  margin-bottom: 16px;
  font-weight: 600;
}
.footer-col a {
  display: block;
  font-size: 0.82rem;
  color: var(--text-secondary);
  text-decoration: none;
  padding: 5px 0;
  transition: all var(--transition);
}
.footer-col a:hover {
  color: var(--primary);
  padding-left: 4px;
}
.footer-highlights ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px 12px;
}
.footer-highlights li {
  font-size: 0.78rem;
  color: var(--text-muted);
  padding: 3px 0;
  line-height: 1.5;
}
.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.06);
  padding: 20px 32px;
  text-align: center;
}
.footer-bottom p {
  font-size: 0.75rem;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}
/* ===== SCROLL TO TOP ===== */
.scroll-top-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 999;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-dark), var(--accent-2));
  color: #06070c;
  border: none;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(154,230,255,0.25);
  transition: all var(--transition);
  opacity: 0;
  transform: translateY(20px);
  pointer-events: none;
}
.scroll-top-btn.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
.scroll-top-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 28px rgba(154,230,255,0.35);
}
/* ===== FOOTER RESPONSIVE ===== */
@media (max-width: 1024px) {
  .footer-links { grid-template-columns: repeat(2, 1fr); }
  .footer-inner { grid-template-columns: 1fr; gap: 40px; }
}
@media (max-width: 768px) {
  .site-footer { padding: 40px 20px 0; }
  .footer-links { grid-template-columns: 1fr 1fr; gap: 24px; }
  .footer-highlights ul { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .footer-links { grid-template-columns: 1fr; }
}
/* ===== TOAST NOTIFICATIONS ===== */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.toast {
  padding: 14px 20px;
  background: rgba(30,32,40,0.95);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  box-shadow: var(--glass-shadow);
  font-size: 0.85rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 10px;
  animation: slideInRight 0.3s ease;
  min-width: 280px;
}
.toast.error { border-left: 3px solid var(--error-color); }
.toast.success { border-left: 3px solid var(--success-color); }
.toast.warning { border-left: 3px solid var(--warning-color); }
@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
/* ===== TEXT-MUTED HELPER ===== */
.text-muted {
  color: var(--text-muted) !important;
}
/* ===== SEARCH FORM CONTROL ===== */
.library-search-bar .form-control {
  background: var(--input-bg);
  border: 1.5px solid var(--input-border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  padding: 10px 14px;
  font-family: var(--font-main);
  font-size: 0.85rem;
  outline: none;
  transition: all var(--transition);
}
.library-search-bar .form-control:focus {
  border-color: var(--input-focus, #9ae6ff);
  box-shadow: 0 0 0 3px rgba(154,230,255,0.1);
}
.library-search-bar .form-control::placeholder {
  color: var(--text-muted);
}
"@

Add-Content -Path $path -Value $css
Write-Output "CSS appended successfully"
