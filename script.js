/*
 * File: script.js
 * Descrizione: Script per le funzionalità interattive del sito Studio Dietologico Dr. Davide Mazzola.
 * Include: gestione menu mobile, animazioni allo scroll e logica di prenotazione dinamica con AJAX.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- GESTIONE NAVIGAZIONE MOBILE (invariata) ---
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (mobileNavToggle && navMenu) {
        mobileNavToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // --- ANIMAZIONI SU SCROLL (invariata) ---
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
        animatedElements.forEach(element => observer.observe(element));
    } else {
        animatedElements.forEach(element => element.classList.add('visible'));
    }

    // --- NUOVA LOGICA PER IL FORM DI PRENOTAZIONE ---
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        const dataInput = document.getElementById('data');
        const orarioSelect = document.getElementById('orario');
        const spinner = document.getElementById('loading-spinner');
        const formFeedback = document.getElementById('form-feedback');
        const submitButton = document.getElementById('submit-button');
        
        // Imposta la data minima a oggi
        dataInput.min = new Date().toISOString().split("T")[0];

        // 1. GESTIONE CAMBIO DATA PER CARICARE ORARI DISPONIBILI
        dataInput.addEventListener('change', async () => {
            const selectedDate = dataInput.value;
            if (!selectedDate) return;

            orarioSelect.disabled = true;
            orarioSelect.innerHTML = '<option value="">Caricamento...</option>';
            spinner.style.display = 'block';

            try {
                // Chiamata all'endpoint GET /api/disponibilita
                const response = await fetch(`/api/disponibilita?data=${selectedDate}`);
                
                if (!response.ok) {
                    throw new Error('Errore nel recupero degli orari.');
                }

                const orariDisponibili = await response.json();
                
                // Popola il select degli orari
                orarioSelect.innerHTML = ''; // Pulisce opzioni precedenti
                if (orariDisponibili.length > 0) {
                    orarioSelect.innerHTML = '<option value="">Seleziona un orario...</option>';
                    orariDisponibili.forEach(orario => {
                        const option = document.createElement('option');
                        option.value = orario;
                        option.textContent = orario;
                        orarioSelect.appendChild(option);
                    });
                    orarioSelect.disabled = false;
                } else {
                    orarioSelect.innerHTML = '<option value="">Nessun orario disponibile</option>';
                }

            } catch (error) {
                console.error("Errore:", error);
                orarioSelect.innerHTML = '<option value="">Errore nel caricamento</option>';
            } finally {
                spinner.style.display = 'none';
            }
        });

        // 2. GESTIONE INVIO FORM CON FETCH
        bookingForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            // Validazione (può essere estesa)
            if (!bookingForm.checkValidity()) {
                // Potresti aggiungere una logica di validazione più visibile qui
                formFeedback.textContent = 'Per favore, compila tutti i campi obbligatori.';
                formFeedback.style.color = '#e74c3c';
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Invio in corso...';
            formFeedback.textContent = '';

            // Raccoglie i dati dal form
            const formData = new FormData(bookingForm);
            const prenotazioneData = {
                nome: formData.get('nome'),
                email: formData.get('email'),
                telefono: formData.get('telefono'),
                tipoVisita: formData.get('tipo_visita'),
                data: formData.get('data'),
                orario: formData.get('orario'),
                note: formData.get('note')
            };

            try {
                // Chiamata all'endpoint POST /api/prenotazioni
                const response = await fetch('/api/prenotazioni', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(prenotazioneData)
                });

                if (response.status === 201) { // CREATED
                    // Successo! Reindirizza alla pagina di conferma.
                    window.location.href = 'conferma.html';
                } else if (response.status === 409) { // CONFLICT
                    const errorMessage = await response.text();
                    formFeedback.textContent = errorMessage;
                    formFeedback.style.color = '#e74c3c';
                    // Ricarica gli orari per aggiornare la UI
                    dataInput.dispatchEvent(new Event('change'));
                } else {
                    throw new Error('Si è verificato un errore sul server.');
                }

            } catch (error) {
                console.error('Errore durante l\'invio del form:', error);
                formFeedback.textContent = 'Impossibile completare la prenotazione. Riprova più tardi.';
                formFeedback.style.color = '#e74c3c';
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Invia Richiesta';
            }
        });
    }
});
