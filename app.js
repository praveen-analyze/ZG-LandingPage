document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Header shrink-on-scroll
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // 3. Smooth scroll with fixed-header offset
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    scrollLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId === '#' || targetId.length < 2) return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 4. Reveal on scroll
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        revealEls.forEach(el => io.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('in-view'));
    }

    // 5. Gallery filter tabs & Lightbox
    const tabButtons = document.querySelectorAll('.tab-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            galleryItems.forEach(item => {
                const match = filter === 'all' || item.dataset.cat === filter;
                item.classList.toggle('hidden', !match);
            });
        });
    });

    // Lightbox modal setup
    const lightboxModal = document.createElement('div');
    lightboxModal.className = 'lightbox-modal';
    lightboxModal.innerHTML = `
        <div class="lightbox-overlay"></div>
        <div class="lightbox-content">
            <button class="lightbox-close" aria-label="Close Lightbox">&times;</button>
            <img src="" alt="" class="lightbox-img">
            <div class="lightbox-caption"></div>
        </div>
    `;
    document.body.appendChild(lightboxModal);

    const lightboxImg = lightboxModal.querySelector('.lightbox-img');
    const lightboxCaption = lightboxModal.querySelector('.lightbox-caption');
    const lightboxClose = lightboxModal.querySelector('.lightbox-close');
    const lightboxOverlay = lightboxModal.querySelector('.lightbox-overlay');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            const tag = item.querySelector('.gallery-tag');
            if (img) {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt || 'Gallery photo';
                lightboxCaption.textContent = (tag ? tag.textContent + ' — ' : '') + (img.alt || '');
                lightboxModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    const closeLightbox = () => {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxOverlay.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
            closeLightbox();
        }
    });


    // 6. Form elements and multi-step wizard controller (Calendly-Style)
    const bookingForm = document.getElementById('bookingForm');
    const bookingStatus = document.getElementById('bookingStatus');
    const bookingFrame = document.getElementById('bookingResponseFrame');
    const submitButton = bookingForm?.querySelector('[type="submit"]');
    const formCard = document.querySelector('.form-card');
    const bookingResubmitBtn = document.getElementById('bookingResubmitBtn');

    // Multi-Step elements
    const formSteps = document.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step-indicator-item');
    const progressFill = document.getElementById('stepsProgressFill');
    const summaryServiceText = document.getElementById('summaryServiceText');
    const summaryDateText = document.getElementById('summaryDateText');

    // Time picker elements
    const weddingHour = document.getElementById('weddingHour');
    const weddingMinute = document.getElementById('weddingMinute');
    const weddingPeriod = document.getElementById('weddingPeriod');
    let currentStep = 1;

    // Sync Indian 12-hour formatted time (e.g., '10:30 AM') across hidden fields for Google Sheets
    function syncWeddingTime() {
        const hour = document.getElementById("weddingHour") ? document.getElementById("weddingHour").value : "";
        const minute = document.getElementById("weddingMinute") ? document.getElementById("weddingMinute").value : "";
        const period = document.getElementById("weddingPeriod") ? document.getElementById("weddingPeriod").value : "AM";

        let time = "";

        if (hour !== "" && minute !== "") {
            const h = parseInt(hour, 10);
            const m = parseInt(minute, 10);

            if (h >= 1 && h <= 12 && m >= 0 && m <= 59) {
                time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
            }
        }

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val;
        };

        setVal("weddingTimeHidden", time);
        setVal("weddingTimeAlias", time);
        setVal("eventTimeAlias", time);
        setVal("weddingTimeCap", time);
        setVal("weddingTimeAliasCap", time);
        setVal("eventTimeAliasCap", time);

        // Also sync date aliases
        const dateInput = document.getElementById("weddingDate");
        const dateVal = dateInput ? dateInput.value : "";
        ["weddingDateAlias", "weddingDateCap", "eventDateAlias"].forEach(id => setVal(id, dateVal));

        return time;
    }

    const syncTimeValues = syncWeddingTime;

    // Update the hidden fields whenever the user changes the time.
    ["weddingHour", "weddingMinute", "weddingPeriod"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", syncWeddingTime);
            el.addEventListener("change", syncWeddingTime);
        }
    });

    // Auto-fill '00' for minute if hour is entered and minute left blank
    if (weddingHour) {
        weddingHour.addEventListener("blur", () => {
            if (weddingHour.value && weddingMinute && !weddingMinute.value) {
                weddingMinute.value = "00";
                syncWeddingTime();
            }
        });
    }

    const weddingDateInput = document.getElementById("weddingDate");
    if (weddingDateInput) {
        weddingDateInput.addEventListener("change", syncWeddingTime);
        weddingDateInput.addEventListener("input", syncWeddingTime);
    }

    // Update Step 3 Calendly-style summary chip
    const updateSummaryPill = () => {
        const serviceSelect = document.getElementById('bookingService');
        const dateInput = document.getElementById('weddingDate');
        const formattedTime = syncTimeValues();

        if (summaryServiceText) {
            summaryServiceText.textContent = (serviceSelect && serviceSelect.value) ? serviceSelect.value : 'Service Selected';
        }

        if (summaryDateText) {
            let dateStr = '';
            if (dateInput && dateInput.value) {
                try {
                    const parsed = new Date(dateInput.value + 'T00:00:00');
                    dateStr = parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                } catch (e) {
                    dateStr = dateInput.value;
                }
            }
            if (dateStr && formattedTime) {
                summaryDateText.textContent = `${dateStr} · ${formattedTime}`;
            } else if (dateStr) {
                summaryDateText.textContent = dateStr;
            } else if (formattedTime) {
                summaryDateText.textContent = formattedTime;
            } else {
                summaryDateText.textContent = 'Date & Time';
            }
        }
    };

    // Step navigator
    const goToStep = (step) => {
        const targetStep = Math.max(1, Math.min(3, step));
        currentStep = targetStep;

        // Toggle active containers
        formSteps.forEach(stepEl => {
            const sNum = parseInt(stepEl.dataset.step, 10);
            if (sNum === targetStep) {
                stepEl.classList.add('active');
            } else {
                stepEl.classList.remove('active');
            }
        });

        // Update progress bar width
        if (progressFill) {
            const pct = targetStep === 1 ? 33 : targetStep === 2 ? 66 : 100;
            progressFill.style.width = `${pct}%`;
        }

        // Update step indicators
        stepIndicators.forEach(ind => {
            const target = parseInt(ind.dataset.stepTarget, 10);
            if (target === targetStep) {
                ind.classList.add('active');
                ind.classList.remove('completed');
            } else if (target < targetStep) {
                ind.classList.add('completed');
                ind.classList.remove('active');
            } else {
                ind.classList.remove('active', 'completed');
            }
        });

        if (targetStep === 3) {
            updateSummaryPill();
        }

        // Focus first actionable input in the new step
        const activeContainer = document.querySelector(`.form-step[data-step="${targetStep}"]`);
        if (activeContainer) {
            const firstInput = activeContainer.querySelector('input:not([type="hidden"]), select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 80);
            }
        }
    };

    // Per-step validation
    const validateStep = (step) => {
        if (step === 1) {
            const serviceSelect = document.getElementById('bookingService');
            if (serviceSelect && !serviceSelect.value) {
                serviceSelect.reportValidity();
                serviceSelect.focus();
                return false;
            }

            const eventTime = syncWeddingTime();
            if (!eventTime) {
                alert("Please enter a valid event time.");
                if (weddingHour) weddingHour.focus();
                return false;
            }

            return true;
        }
        if (step === 2) {
            // Venue and notes are optional
            return true;
        }
        if (step === 3) {
            const nameInput = document.getElementById('bookingName');
            const phoneInput = document.getElementById('bookingPhone');
            const emailInput = document.getElementById('bookingEmail');

            if (nameInput && !nameInput.reportValidity()) return false;
            if (phoneInput && !phoneInput.reportValidity()) return false;
            if (emailInput && !emailInput.reportValidity()) return false;
            return true;
        }
        return true;
    };

    // Step navigation buttons
    document.querySelectorAll('.btn-step-next').forEach(btn => {
        btn.addEventListener('click', () => {
            const nextStep = parseInt(btn.dataset.next, 10);
            if (validateStep(currentStep)) {
                goToStep(nextStep);
            }
        });
    });

    document.querySelectorAll('.btn-step-prev').forEach(btn => {
        btn.addEventListener('click', () => {
            const prevStep = parseInt(btn.dataset.prev, 10);
            goToStep(prevStep);
        });
    });

    // Step indicator button clicks
    stepIndicators.forEach(ind => {
        ind.addEventListener('click', () => {
            const target = parseInt(ind.dataset.stepTarget, 10);
            if (target < currentStep) {
                goToStep(target);
            } else if (target > currentStep) {
                if (validateStep(currentStep)) {
                    goToStep(currentStep + 1);
                }
            }
        });
    });

    // Summary Ticket Edit button: return to Step 1
    const summaryEditBtn = document.getElementById('summaryEditBtn');
    if (summaryEditBtn) {
        summaryEditBtn.addEventListener('click', () => {
            goToStep(1);
        });
    }

    // Fast 1-Click Quick Pills for Service
    const serviceSelect = document.getElementById('bookingService');
    const servicePills = document.querySelectorAll('#serviceQuickPills .quick-pill');

    const syncServicePills = (val) => {
        servicePills.forEach(pill => {
            if (val && pill.dataset.service === val) {
                pill.classList.add('active');
            } else {
                pill.classList.remove('active');
            }
        });
    };

    servicePills.forEach(pill => {
        pill.addEventListener('click', () => {
            const serv = pill.dataset.service;
            if (serviceSelect) {
                serviceSelect.value = serv;
                syncServicePills(serv);
            }
        });
    });

    if (serviceSelect) {
        serviceSelect.addEventListener('change', () => {
            syncServicePills(serviceSelect.value);
        });
    }

    // Fast 1-Click Quick Pills for Location
    const locationInput = document.getElementById('weddingLocation');
    const locationPills = document.querySelectorAll('#locationQuickPills .quick-pill');

    locationPills.forEach(pill => {
        pill.addEventListener('click', () => {
            const loc = pill.dataset.loc;
            if (locationInput) {
                locationInput.value = loc;
            }
            locationPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
        });
    });

    if (locationInput) {
        locationInput.addEventListener('input', () => {
            const current = (locationInput.value || '').trim().toLowerCase();
            locationPills.forEach(p => {
                if (current && p.dataset.loc.toLowerCase() === current) {
                    p.classList.add('active');
                } else {
                    p.classList.remove('active');
                }
            });
        });
    }

    const resetBookingFormView = () => {
        if (formCard) formCard.classList.remove('is-submitted');
        if (bookingForm) {
            bookingForm.reset();
            if (weddingHour) weddingHour.value = '';
            if (weddingMinute) weddingMinute.value = '';
            if (weddingPeriod) weddingPeriod.value = 'AM';
            const hiddenIds = [
                'weddingTimeHidden', 'weddingTimeCap', 'weddingTimeAlias',
                'weddingTimeAliasCap', 'eventTimeAlias', 'eventTimeAliasCap',
                'weddingDateAlias', 'weddingDateCap', 'eventDateAlias'
            ];
            hiddenIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            servicePills.forEach(p => p.classList.remove('active'));
            locationPills.forEach(p => p.classList.remove('active'));
        }
        if (bookingStatus) {
            bookingStatus.className = 'booking-status';
            bookingStatus.textContent = '';
        }
        if (submitButton) {
            submitButton.disabled = false;
            const originalLabel = submitButton.querySelector('.submit-label');
            if (originalLabel) originalLabel.textContent = 'Submit Enquiry';
        }
        goToStep(1);
    };

    if (bookingResubmitBtn) {
        bookingResubmitBtn.addEventListener('click', () => {
            resetBookingFormView();
            const firstInput = bookingForm?.querySelector('input:not([type="hidden"]), select');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 120);
            }
        });
    }

    // Service card buttons: open the form and preselect service
    document.querySelectorAll('.service-link').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.getElementById('cta-form');
            const serviceSelect = document.getElementById('bookingService');
            const service = btn.dataset.service;

            if (serviceSelect && service) {
                const options = [...serviceSelect.options];
                const match = options.find(option =>
                    option.text.trim().toLowerCase() ===
                    service.trim().toLowerCase()
                );

                serviceSelect.value = match
                    ? match.value
                    : (service.toLowerCase().includes('destination')
                        ? 'Destination Wedding'
                        : service.toLowerCase().includes('pre-wedding')
                            ? 'Pre-Wedding Photoshoot'
                            : service.toLowerCase().includes('cinematography')
                                ? 'Wedding Cinematography'
                                : 'Other');

                syncServicePills(serviceSelect.value);
            }

            if (formCard && formCard.classList.contains('is-submitted')) {
                resetBookingFormView();
            } else {
                goToStep(1);
            }

            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // 7. Submit booking enquiries to Google Sheets via Apps Script
    // Replace this with your deployed Apps Script /exec URL.
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzL4E9_b_K_fA9fb3qt-bbzxSAhmHAutmPdBzpxB0l28ky-8qYIynYw_jyYUdsoH2iKng/exec";

    if (bookingForm && bookingStatus && bookingFrame && submitButton) {
        let submissionPending = false;
        let fallbackTimer = null;

        bookingForm.addEventListener('submit', (event) => {
            event.preventDefault();

            if (submissionPending) return;

            if (SCRIPT_URL.includes('PASTE_YOUR_')) {
                bookingStatus.className = 'booking-status error';
                bookingStatus.textContent =
                    'Booking form setup is incomplete. Please contact us directly at +91 98407 67566.';
                return;
            }

            const website = bookingForm.elements.website?.value;
            if (website) return;

            // Validate step 3 inputs before sending
            if (!validateStep(3)) return;

            const eventTime = syncWeddingTime();
            if (!eventTime) {
                alert("Please enter a valid event time.");
                goToStep(1);
                if (weddingHour) weddingHour.focus();
                return;
            }

            const originalLabel = submitButton.querySelector('.submit-label');

            submissionPending = true;
            submitButton.disabled = true;
            if (originalLabel) originalLabel.textContent = 'Submitting...';

            bookingStatus.className = 'booking-status sending';
            bookingStatus.textContent = 'Sending your enquiry to our team...';

            const handleSuccess = () => {
                if (!submissionPending) return;

                submissionPending = false;
                if (fallbackTimer) clearTimeout(fallbackTimer);

                bookingStatus.className = 'booking-status';
                bookingStatus.textContent = '';
                bookingForm.reset();

                submitButton.disabled = false;
                if (originalLabel) originalLabel.textContent = 'Submit Enquiry';
                bookingFrame.onload = null;

                // Display centered Thank You screen in form card
                if (formCard) {
                    formCard.classList.add('is-submitted');
                }
                goToStep(1);
            };

            // Fallback timeout in case cross-origin iframe onload is restricted
            fallbackTimer = setTimeout(() => {
                if (submissionPending) {
                    handleSuccess();
                }
            }, 5000);

            // The hidden iframe avoids cross-origin fetch response restrictions.
            bookingFrame.onload = () => {
                handleSuccess();
            };

            bookingForm.action = SCRIPT_URL;
            bookingForm.method = 'POST';
            bookingForm.target = 'bookingResponseFrame';

            // Start tracking only after the initial empty iframe load.
            bookingFrame.onload = null;
            bookingFrame.src = 'about:blank';

            // Submit after the browser has reset the iframe.
            requestAnimationFrame(() => {
                bookingFrame.onload = () => {
                    handleSuccess();
                };

                bookingForm.submit();
            });
        });
    }
});
