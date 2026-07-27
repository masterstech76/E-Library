/**
 * Auth Pages (Login & Forgot Password) - E-Library Portal
 * Handles login validation, password toggle, form submission,
 * and forgot-password multi-step flow.
 */
(function () {
  "use strict";

  // Expose showToast globally (reuse same pattern as registration.js)
  window.showToast = function (message, type) {
    type = type || "info";
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = "toast " + type;
    const iconMap = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
    };
    toast.innerHTML = `<span>${iconMap[type] || "ℹ️"}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  };

  // ============================================================
  //  LOGIN PAGE
  // ============================================================
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    const loginEmail = document.getElementById("loginEmail");
    const loginPassword = document.getElementById("loginPassword");
    const togglePassword = document.getElementById("togglePassword");
    const loginBtn = document.getElementById("loginBtn");

    // Password visibility toggle
    if (togglePassword && loginPassword) {
      togglePassword.addEventListener("click", () => {
        const type =
          loginPassword.getAttribute("type") === "password"
            ? "text"
            : "password";
        loginPassword.setAttribute("type", type);
        togglePassword.textContent = type === "password" ? "👁️" : "👁️‍🗨️";
      });
    }

    // Real-time validation
    function validateLoginField(input) {
      const value = input.value.trim();
      const msgEl = input.parentElement.querySelector(".validation-msg");
      let isValid = true;
      let errorMsg = "";

      if (input === loginEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          isValid = false;
          errorMsg = "Email is required";
        } else if (!emailRegex.test(value)) {
          isValid = false;
          errorMsg = "Please enter a valid email";
        }
      }

      if (input === loginPassword) {
        if (!value) {
          isValid = false;
          errorMsg = "Password is required";
        } else if (value.length < 6) {
          isValid = false;
          errorMsg = "Password must be at least 6 characters";
        }
      }

      input.classList.toggle("error", !isValid);
      input.classList.toggle("success", isValid && value);
      if (msgEl) {
        msgEl.className = "validation-msg " + (isValid ? "success" : "error");
        msgEl.innerHTML = isValid
          ? value
            ? '<span class="icon">✓</span> Looks good'
            : ""
          : '<span class="icon">✗</span> ' + errorMsg;
      }
      return isValid;
    }

    if (loginEmail) {
      loginEmail.addEventListener("blur", () => validateLoginField(loginEmail));
      loginEmail.addEventListener("input", () => {
        if (
          loginEmail.classList.contains("error") ||
          loginEmail.classList.contains("success")
        )
          validateLoginField(loginEmail);
      });
    }
    if (loginPassword) {
      loginPassword.addEventListener("blur", () =>
        validateLoginField(loginPassword)
      );
      loginPassword.addEventListener("input", () => {
        if (
          loginPassword.classList.contains("error") ||
          loginPassword.classList.contains("success")
        )
          validateLoginField(loginPassword);
      });
    }

    // Social login
    document.querySelectorAll(".social-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const provider = btn.dataset.provider || "social";
        showToast(`Redirecting to ${provider} login...`, "info");
        console.log(`🔑 ${provider} login initiated`);
      });
    });

    // Submit
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const emailValid = validateLoginField(loginEmail);
      const passValid = validateLoginField(loginPassword);

      if (!emailValid || !passValid) {
        showToast("Please fix the errors before signing in.", "error");
        return;
      }

      loginBtn.disabled = true;
      loginBtn.innerHTML = '<span class="spinner"></span> Signing in...';

      // Simulate API call
      setTimeout(() => {
        loginBtn.disabled = false;
        loginBtn.innerHTML = "✅ Signed In!";
        showToast("Welcome back! Redirecting to dashboard... 🎉", "success");
        console.log("📦 Login Data:", {
          email: loginEmail.value,
          remember: document.getElementById("rememberMe")?.checked || false,
        });
      }, 2000);
    });
  }

  // ============================================================
  //  FORGOT PASSWORD PAGE
  // ============================================================
  const fpForm = document.getElementById("fpForm");
  if (fpForm) {
    let fpStep = 1;
    const totalFpSteps = 3;

    const fpStep1 = document.getElementById("fpStep1");
    const fpStep2 = document.getElementById("fpStep2");
    const fpStep3 = document.getElementById("fpStep3");

    const fpEmail = document.getElementById("fpEmail");
    const fpOtpBoxes = document.querySelectorAll(".otp-box");
    const fpNewPassword = document.getElementById("fpNewPassword");
    const fpConfirmPassword = document.getElementById("fpConfirmPassword");

    const fpSendOtpBtn = document.getElementById("fpSendOtpBtn");
    const fpVerifyOtpBtn = document.getElementById("fpVerifyOtpBtn");
    const fpResetBtn = document.getElementById("fpResetBtn");

    const fpBackBtn = document.getElementById("fpBackBtn");
    const fpOtpStatus = document.getElementById("fpOtpStatus");

    const fpSteps = document.querySelectorAll(".fp-step");
    const fpSuccess = document.getElementById("fpSuccess");

    let fpGeneratedOtp = "";
    let fpOtpVerified = false;

    function goToFpStep(step) {
      fpStep = step;
      fpStep1.style.display = step === 1 ? "block" : "none";
      fpStep2.style.display = step === 2 ? "block" : "none";
      fpStep3.style.display = step === 3 ? "block" : "none";
      if (fpSuccess) fpSuccess.style.display = "none";

      fpSteps.forEach((st, i) => {
        const idx = i + 1;
        st.classList.remove("active", "completed");
        if (idx === step) st.classList.add("active");
        else if (idx < step) st.classList.add("completed");
      });

      if (fpBackBtn) {
        fpBackBtn.style.display = step === 1 ? "none" : "inline-flex";
      }
    }

    // Step 1: Send OTP
    if (fpSendOtpBtn) {
      fpSendOtpBtn.addEventListener("click", () => {
        const email = fpEmail.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
          showToast("Please enter a valid registered email.", "error");
          return;
        }

        fpGeneratedOtp = String(
          Math.floor(100000 + Math.random() * 900000)
        );
        fpOtpVerified = false;
        fpSendOtpBtn.disabled = true;
        fpSendOtpBtn.textContent = "Sending...";

        setTimeout(() => {
          fpSendOtpBtn.textContent = "✅ Sent";
          fpVerifyOtpBtn.disabled = false;
          showToast("OTP sent! Check console for demo.", "success");
          console.log("🔐 [DEMO] Forgot Password OTP:", fpGeneratedOtp);
          goToFpStep(2);
        }, 1500);
      });
    }

    // OTP inputs
    if (fpOtpBoxes.length) {
      fpOtpBoxes.forEach((box, index) => {
        box.addEventListener("input", (e) => {
          const val = e.target.value.replace(/\D/g, "");
          e.target.value = val;
          if (val && index < fpOtpBoxes.length - 1) {
            fpOtpBoxes[index + 1].focus();
          }
        });
        box.addEventListener("keydown", (e) => {
          if (e.key === "Backspace" && !box.value && index > 0) {
            fpOtpBoxes[index - 1].focus();
          }
        });
      });
    }

    // Step 2: Verify OTP
    if (fpVerifyOtpBtn) {
      fpVerifyOtpBtn.addEventListener("click", () => {
        const entered = Array.from(fpOtpBoxes)
          .map((b) => b.value)
          .join("");

        if (entered.length !== 6) {
          if (fpOtpStatus) {
            fpOtpStatus.textContent = "Please enter the full 6-digit code.";
            fpOtpStatus.className = "validation-msg error";
          }
          return;
        }

        if (entered === fpGeneratedOtp) {
          fpOtpVerified = true;
          if (fpOtpStatus) {
            fpOtpStatus.textContent = "✅ Verified!";
            fpOtpStatus.className = "validation-msg success";
          }
          fpVerifyOtpBtn.disabled = true;
          fpOtpBoxes.forEach((b) => (b.disabled = true));
          showToast("OTP Verified! Set your new password.", "success");

          // Go to step 3 after short delay
          setTimeout(() => goToFpStep(3), 600);
        } else {
          if (fpOtpStatus) {
            fpOtpStatus.textContent = "❌ Invalid code. Try again.";
            fpOtpStatus.className = "validation-msg error";
          }
          fpOtpBoxes.forEach((b) => (b.value = ""));
          fpOtpBoxes[0].focus();
        }
      });
    }

    // Step 3: Reset Password validation
    function validateFpPassword() {
      const pw = fpNewPassword.value;
      const confirm = fpConfirmPassword.value;
      let valid = true;

      const pwMsg = fpNewPassword.parentElement.querySelector(".validation-msg");
      if (!pw || pw.length < 6) {
        valid = false;
        if (pwMsg) {
          pwMsg.className = "validation-msg error";
          pwMsg.innerHTML = '<span class="icon">✗</span> Minimum 6 characters';
        }
        fpNewPassword.classList.add("error");
      } else {
        if (pwMsg) {
          pwMsg.className = "validation-msg success";
          pwMsg.innerHTML = '<span class="icon">✓</span> Strong enough';
        }
        fpNewPassword.classList.remove("error");
        fpNewPassword.classList.add("success");
      }

      const confirmMsg = fpConfirmPassword.parentElement.querySelector(".validation-msg");
      if (confirm && confirm !== pw) {
        valid = false;
        if (confirmMsg) {
          confirmMsg.className = "validation-msg error";
          confirmMsg.innerHTML = '<span class="icon">✗</span> Passwords do not match';
        }
        fpConfirmPassword.classList.add("error");
      } else if (confirm) {
        if (confirmMsg) {
          confirmMsg.className = "validation-msg success";
          confirmMsg.innerHTML = '<span class="icon">✓</span> Passwords match';
        }
        fpConfirmPassword.classList.remove("error");
        fpConfirmPassword.classList.add("success");
      }

      return valid;
    }

    if (fpNewPassword) {
      fpNewPassword.addEventListener("input", () => {
        if (fpNewPassword.value.length >= 3) validateFpPassword();
      });
    }
    if (fpConfirmPassword) {
      fpConfirmPassword.addEventListener("input", validateFpPassword);
    }

    // Submit new password
    if (fpResetBtn) {
      fpResetBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (!validateFpPassword()) {
          showToast("Please fix password errors.", "error");
          return;
        }

        fpResetBtn.disabled = true;
        fpResetBtn.innerHTML = '<span class="spinner"></span> Resetting...';

        setTimeout(() => {
          fpResetBtn.disabled = false;
          fpResetBtn.innerHTML = "✅ Done";
          showToast("Password reset successfully! 🎉", "success");
          console.log("🔐 Password reset completed for:", fpEmail.value);

          // Show success state
          fpStep3.style.display = "none";
          if (fpSuccess) {
            fpSuccess.style.display = "block";
          }
        }, 2000);
      });
    }

    // Back button
    if (fpBackBtn) {
      fpBackBtn.addEventListener("click", () => {
        if (fpStep === 2) {
          goToFpStep(1);
        } else if (fpStep === 3) {
          goToFpStep(2);
        }
      });
    }

    // Init
    goToFpStep(1);
  }
})();

