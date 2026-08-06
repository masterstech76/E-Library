/**
 * Student Registration Page - E-Library Portal
 * Handles multi-step form, validation, CAPTCHA, OTP, and more.
 */
(function () {
  "use strict";

  // ===== DOM REFS =====
  const form = document.getElementById("registrationForm");
  const sections = document.querySelectorAll(".form-section");
  const steps = document.querySelectorAll(".progress-step");
  const progressFill = document.querySelector(".progress-fill");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");
  const toastContainer = document.getElementById("toastContainer");
  const successModal = document.getElementById("successModal");

  let currentStep = 0;
  const totalSteps = sections.length;

  // ===== PASSWORD STRENGTH =====
  const passwordInput = document.getElementById("password");
  const strengthSegments = document.querySelectorAll(".strength-bar .segment");
  const strengthText = document.querySelector(".strength-text");

  // ===== USERNAME AUTO-GENERATE =====
  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");
  const usernameInput = document.getElementById("username");
  const usernameSuggestion = document.getElementById("usernameSuggestion");

  // ===== CONFIRM PASSWORD =====
  const confirmPasswordInput = document.getElementById("confirmPassword");

  // ===== OTP =====
  const otpBoxes = document.querySelectorAll(".otp-box");
  const sendOtpBtn = document.getElementById("sendOtpBtn");
  const verifyOtpBtn = document.getElementById("verifyOtpBtn");
  const otpStatus = document.getElementById("otpStatus");

  // ===== CAPTCHA =====
  const captchaText = document.getElementById("captchaText");
  const captchaInput = document.getElementById("captchaInput");
  const captchaRefresh = document.getElementById("captchaRefresh");
  const captchaMsg = document.getElementById("captchaMsg");

  let generatedCaptcha = "";
  let generatedOtp = "";
  let isOtpVerified = false;

  // ===== SECTION TRANSITION =====
  function goToStep(step) {
    if (step < 0 || step >= totalSteps) return;

    // Validate current step before moving forward
    if (step > currentStep) {
      if (!validateSection(currentStep)) {
        showToast("Please fix errors before proceeding.", "error");
        return;
      }
    }

    currentStep = step;
    updateUI();
  }

  function updateUI() {
    // Sections
    sections.forEach((sec, i) => {
      sec.classList.toggle("active", i === currentStep);
    });

    // Steps
    steps.forEach((st, i) => {
      st.classList.remove("active", "completed");
      if (i === currentStep) st.classList.add("active");
      else if (i < currentStep) st.classList.add("completed");
    });

    // Progress fill
    const pct = (currentStep / (totalSteps - 1)) * 100;
    if (progressFill) progressFill.style.width = pct + "%";

    // Buttons
    if (prevBtn) prevBtn.style.display = currentStep === 0 ? "none" : "inline-flex";
    if (nextBtn) {
      nextBtn.style.display = currentStep === totalSteps - 1 ? "none" : "inline-flex";
    }
    if (submitBtn) {
      submitBtn.style.display = currentStep === totalSteps - 1 ? "inline-flex" : "none";
    }

    // Scroll top of form
    document.querySelector(".glass-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ===== VALIDATION =====
  const validators = {
    required: (val) => val.trim() !== "",
    email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    phone: (val) => /^[+]?[\d\s()-]{7,15}$/.test(val),
    minLength: (val, min) => val.length >= min,
    match: (val, target) => val === target,
    otp: (val) => /^\d{6}$/.test(val),
  };

  function validateField(input) {
    const value = input.value;
    const rules = input.dataset.validate;
    const msgEl = input.parentElement.querySelector(".validation-msg");
    if (!rules) return true;

    const ruleList = rules.split(",").map((r) => r.trim());
    let isValid = true;
    let errorMsg = "";

    for (const rule of ruleList) {
      if (rule === "required" && !validators.required(value)) {
        isValid = false;
        errorMsg = input.dataset.msgRequired || "This field is required";
        break;
      }
      if (rule === "email" && value && !validators.email(value)) {
        isValid = false;
        errorMsg = "Please enter a valid email address";
        break;
      }
      if (rule === "phone" && value && !validators.phone(value)) {
        isValid = false;
        errorMsg = "Please enter a valid phone number";
        break;
      }
      if (rule === "confirmPassword" && value) {
        if (!validators.match(value, passwordInput.value)) {
          isValid = false;
          errorMsg = "Passwords do not match";
        }
      }
    }

    // Special: password strength rules
    if (input === passwordInput && value) {
      const strength = getPasswordStrength(value);
      if (strength.score < 2) {
        // Allow but warn on weak
      }
    }

    input.classList.toggle("error", !isValid && value !== "");
    input.classList.toggle("success", isValid && value !== "");
    if (msgEl) {
      msgEl.className = "validation-msg " + (isValid && value ? "success" : "error");
      msgEl.innerHTML = isValid
        ? value
          ? '<span class="icon">✓</span> Looks good!'
          : ""
        : '<span class="icon">✗</span> ' + errorMsg;
    }
    return isValid || value === "";
  }

  function validateSection(step) {
    const section = sections[step];
    if (!section) return true;
    const inputs = section.querySelectorAll("[data-validate]");
    let allValid = true;

    inputs.forEach((input) => {
      if (!validateField(input)) {
        allValid = false;
      }
    });

    // Extra: check password match in step 2
    if (step === 2) {
      if (confirmPasswordInput.value && confirmPasswordInput.value !== passwordInput.value) {
        allValid = false;
        confirmPasswordInput.classList.add("error");
        const msg = confirmPasswordInput.parentElement.querySelector(".validation-msg");
        if (msg) {
          msg.className = "validation-msg error";
          msg.innerHTML = '<span class="icon">✗</span> Passwords do not match';
        }
      }
    }

    // Extra: check captcha in step 4
    if (step === 4) {
      if (!validateCaptcha()) {
        allValid = false;
      }
      if (!isOtpVerified) {
        allValid = false;
        showToast("Please verify your OTP first.", "warning");
      }
    }

    return allValid;
  }

  // ===== PASSWORD STRENGTH =====
  function getPasswordStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;

    let label = "Weak";
    if (score >= 4) label = "Strong";
    else if (score >= 2) label = "Medium";

    return { score, label };
  }

  function updatePasswordStrength() {
    const pw = passwordInput.value;
    const { score, label } = getPasswordStrength(pw);

    strengthSegments.forEach((seg, i) => {
      seg.className = "segment";
      if (i < score) {
        seg.classList.add("active", label.toLowerCase());
      }
    });

    strengthText.textContent = pw ? label : "";
    strengthText.className = "strength-text " + label.toLowerCase();
  }

  // ===== USERNAME SUGGESTION =====
  function suggestUsername() {
    const first = firstNameInput.value.trim().toLowerCase();
    const last = lastNameInput.value.trim().toLowerCase();
    if (!first && !last) {
      usernameSuggestion.style.display = "none";
      return;
    }
    const suggestions = [];
    if (first && last) suggestions.push(first + "." + last);
    if (first) suggestions.push(first + (Math.floor(Math.random() * 999) + 100));
    if (first && last) suggestions.push(first[0] + last);
    suggestions.push("student_" + (Math.floor(Math.random() * 9000) + 1000));

    const suggestion = suggestions[0];
    usernameSuggestion.textContent = '💡 Suggested: ' + suggestion;
    usernameSuggestion.style.display = "inline-block";
    usernameSuggestion.dataset.suggestion = suggestion;
  }

  // ===== OTP =====
  function generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  function handleSendOtp() {
    const email = document.getElementById("email").value;
    if (!email || !validators.email(email)) {
      showToast("Please enter a valid email first.", "error");
      return;
    }

    generatedOtp = generateOtp();
    isOtpVerified = false;
    verifyOtpBtn.disabled = false;
    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = "Sending...";

    // Simulate sending OTP
    setTimeout(() => {
      sendOtpBtn.textContent = "✅ Sent";
      otpStatus.textContent = "OTP sent to " + email;
      otpStatus.style.color = "var(--success-color)";
      showToast("OTP sent successfully! Check console for demo.", "success");
      console.log("🔐 [DEMO] Your OTP is:", generatedOtp);
    }, 1500);
  }

  function handleVerifyOtp() {
    const entered = Array.from(otpBoxes)
      .map((b) => b.value)
      .join("");

    if (entered.length !== 6) {
      otpStatus.textContent = "Please enter the full 6-digit OTP.";
      otpStatus.style.color = "var(--error-color)";
      return;
    }

    if (entered === generatedOtp) {
      isOtpVerified = true;
      otpStatus.textContent = "✅ OTP Verified Successfully!";
      otpStatus.style.color = "var(--success-color)";
      verifyOtpBtn.disabled = true;
      otpBoxes.forEach((b) => (b.disabled = true));
      showToast("OTP Verified! ✅", "success");
    } else {
      otpStatus.textContent = "❌ Invalid OTP. Please try again.";
      otpStatus.style.color = "var(--error-color)";
      isOtpVerified = false;
      otpBoxes.forEach((b) => (b.value = ""));
      otpBoxes[0].focus();
    }
  }

  function setupOtpInputs() {
    otpBoxes.forEach((box, index) => {
      box.addEventListener("input", (e) => {
        const val = e.target.value.replace(/\D/g, "");
        e.target.value = val;
        if (val && index < otpBoxes.length - 1) {
          otpBoxes[index + 1].focus();
        }
      });

      box.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !box.value && index > 0) {
          otpBoxes[index - 1].focus();
        }
      });
    });
  }

  // ===== CAPTCHA =====
  function generateCaptcha() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let captcha = "";
    for (let i = 0; i < 6; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    generatedCaptcha = captcha;
    captchaText.textContent = captcha;
    captchaInput.value = "";
    captchaMsg.textContent = "";
    captchaInput.classList.remove("error", "success");
  }

  function validateCaptcha() {
    const entered = captchaInput.value.trim();
    if (!entered) {
      captchaMsg.textContent = "Please enter the CAPTCHA.";
      captchaMsg.className = "validation-msg error";
      captchaInput.classList.add("error");
      return false;
    }
    if (entered === generatedCaptcha) {
      captchaMsg.textContent = "✓ CAPTCHA verified!";
      captchaMsg.className = "validation-msg success";
      captchaInput.classList.remove("error");
      captchaInput.classList.add("success");
      return true;
    } else {
      captchaMsg.textContent = "✗ Incorrect CAPTCHA. Try again.";
      captchaMsg.className = "validation-msg error";
      captchaInput.classList.add("error");
      generateCaptcha();
      return false;
    }
  }

  // ===== TOAST =====
  function showToast(message, type) {
    type = type || "info";
    const toast = document.createElement("div");
    toast.className = "toast " + type;
    const iconMap = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
    };
    toast.innerHTML = `<span>${iconMap[type] || "ℹ️"}</span> ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // Expose showToast globally for inline HTML onclick handlers
  window.showToast = showToast;

  // ===== SUBMIT =====
  function handleSubmit(e) {
    e.preventDefault();

    // Final validation
    if (!validateSection(currentStep)) {
      showToast("Please fix all errors before submitting.", "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Registering...';

    // Simulate API call
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "✅ Registered!";
      successModal.classList.add("show");
      showToast("Registration successful! 🎉 Redirecting...", "success");

      // Collect data
      const formData = new FormData(form);
      const data = {};
      formData.forEach((val, key) => {
        data[key] = val;
      });
      console.log("📦 Registration Data:", data);
    }, 2500);
  }

  // ===== REAL-TIME VALIDATION =====
  function setupRealTimeValidation() {
    document.querySelectorAll("[data-validate]").forEach((input) => {
      input.addEventListener("blur", () => validateField(input));
      input.addEventListener("input", () => {
        if (input.classList.contains("error") || input.classList.contains("success")) {
          validateField(input);
        }
      });
    });
  }

  // ===== EVENT LISTENERS =====
  function init() {
    // Navigation
    if (prevBtn) prevBtn.addEventListener("click", () => goToStep(currentStep - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => goToStep(currentStep + 1));

    // Step clicks
    steps.forEach((step, i) => {
      step.addEventListener("click", () => goToStep(i));
    });

    // Password
    if (passwordInput) {
      passwordInput.addEventListener("input", updatePasswordStrength);
    }

    // Username suggestion
    if (firstNameInput) firstNameInput.addEventListener("input", suggestUsername);
    if (lastNameInput) lastNameInput.addEventListener("input", suggestUsername);

    if (usernameSuggestion) {
      usernameSuggestion.addEventListener("click", () => {
        usernameInput.value = usernameSuggestion.dataset.suggestion || "";
        validateField(usernameInput);
        usernameSuggestion.style.display = "none";
      });
    }

    // OTP
    if (sendOtpBtn) sendOtpBtn.addEventListener("click", handleSendOtp);
    if (verifyOtpBtn) verifyOtpBtn.addEventListener("click", handleVerifyOtp);
    setupOtpInputs();

    // CAPTCHA
    if (captchaRefresh) captchaRefresh.addEventListener("click", generateCaptcha);

    // Submit
    if (form) form.addEventListener("submit", handleSubmit);

    // Modal close
    document.querySelectorAll(".modal-close").forEach((btn) => {
      btn.addEventListener("click", () => {
        successModal.classList.remove("show");
        // Could redirect to dashboard here
      });
    });

    // Click outside modal to close
    successModal.addEventListener("click", (e) => {
      if (e.target === successModal) {
        successModal.classList.remove("show");
      }
    });

    // Real-time validation
    setupRealTimeValidation();

    // Init state
    updateUI();
    generateCaptcha();
    updatePasswordStrength();

    // Trigger username suggestion if names are already filled (e.g. browser autofill)
    if (firstNameInput.value || lastNameInput.value) {
      setTimeout(suggestUsername, 200);
    }
  }

  // Start when DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
