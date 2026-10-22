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


    // 6. Form elements and reset helper
    const bookingForm = document.getElementById('bookingForm');
    const bookingStatus = document.getElementById('bookingStatus');
    const bookingFrame = document.getElementById('bookingResponseFrame');
    const submitButton = bookingForm?.querySelector('[type="submit"]');
    const formCard = document.querySelector('.form-card');
    const bookingResubmitBtn = document.getElementById('bookingResubmitBtn');

    const resetBookingFormView = () => {
        if (formCard) formCard.classList.remove('is-submitted');
        if (bookingForm) {
            bookingForm.reset();
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
    };

    if (bookingResubmitBtn) {
        bookingResubmitBtn.addEventListener('click', () => {
            resetBookingFormView();
            const firstInput = bookingForm?.querySelector('input:not([type="hidden"])');
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
            }

            if (formCard && formCard.classList.contains('is-submitted')) {
                resetBookingFormView();
            }

            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // 7. Submit booking enquiries to Google Sheets via Apps Script
    // Replace this with your deployed Apps Script /exec URL.
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzcQZxLo4bEh3oWnjcb2Thnynn5iZOyYJYZ--2yw8pKTPYknT78cLjauvXwTuf95iBM/exec";

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

            const website = bookingForm.elements.website.value;
            if (website) return;

            if (!bookingForm.reportValidity()) return;

            const originalLabel =
                submitButton.querySelector('.submit-label');

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
