/*
 * File: script.js
 * Descrizione: Script per le funzionalità interattive del sito Studio Dietologico.
 * Include: gestione menu mobile, animazioni allo scroll e validazione form.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- GESTIONE NAVIGAZIONE MOBILE ---
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileNavToggle && navMenu) {
        mobileNavToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // --- EVIDENZIA LINK ATTIVO NELLA NAVIGAZIONE ---
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname.split('/').pop();

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath || (currentPath === '' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });


    // --- ANIMAZIONI SU SCROLL CON INTERSECTION OBSERVER ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        // Fallback per browser datati
        animatedElements.forEach(element => {
            element.classList.add('visible');
        });
    }


    // --- VALIDAZIONE FORM DI PRENOTAZIONE ---
    const bookingForm = document.getElementById('booking-form');

    if (bookingForm) {
        bookingForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Impedisce l'invio standard del form
            let isValid = true;

            // Funzione helper per mostrare/nascondere errori
            const showError = (inputId, message) => {
                const input = document.getElementById(inputId);
                const errorElement = input.nextElementSibling;
                input.style.borderColor = '#e74c3c';
                errorElement.textContent = message;
                errorElement.style.display = 'block';
            };
            const hideError = (inputId) => {
                const input = document.getElementById(inputId);
                const errorElement = input.nextElementSibling;
                input.style.borderColor = 'var(--border-color)';
                errorElement.style.display = 'none';
            };

            // Reset errori precedenti
            document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(input => hideError(input.id));

            // Validazione Nome
            const nome = document.getElementById('nome');
            if (nome.value.trim() === '') {
                showError('nome', 'Il campo nome è obbligatorio.');
                isValid = false;
            }

            // Validazione Email
            const email = document.getElementById('email');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value)) {
                showError('email', 'Inserisci un indirizzo email valido.');
                isValid = false;
            }

            // Validazione Telefono
            const telefono = document.getElementById('telefono');
            if (telefono.value.trim().length < 9) {
                showError('telefono', 'Inserisci un numero di telefono valido.');
                isValid = false;
            }

            // Validazione Data
            const data = document.getElementById('data');
            if (data.value === '') {
                showError('data', 'Seleziona una data.');
                isValid = false;
            }

            // Validazione Orario
            const orario = document.getElementById('orario');
            if (orario.value === '') {
                showError('orario', 'Seleziona un orario.');
                isValid = false;
            }

            // Se tutto è valido, reindirizza alla pagina di conferma
            if (isValid) {
                window.location.href = 'conferma.html';
            }
        });
    }

});
