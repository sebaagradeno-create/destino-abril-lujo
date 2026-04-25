/**
 * DESTINO ABRIL — Interacciones y Lógica Frontend
 * Inmobiliaria Premium
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. NAvegación y Scroll
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navbarLinks = document.getElementById('navbar-links');
    
    // Cambiar estilo de la barra de navegación al hacer scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Menú móvil
    if (mobileMenuBtn && navbarLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navbarLinks.classList.toggle('open');
            // Cambiar aspecto del botón para indicar X si se desea
            mobileMenuBtn.classList.toggle('active');
        });
    }

    // Cerrar menú móvil al hacer click en un enlace
    const links = document.querySelectorAll('.navbar-links a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            navbarLinks.classList.remove('open');
        });
    });

    // 2. Animaciones de revelado al hacer scroll (Scroll Reveal)
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // 3. Generar partículas doradas flotantes en la Hero Section
    const particlesContainer = document.getElementById('particles-container');
    if (particlesContainer) {
        const particleCount = 20; // Número de partículas
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // Randomizar propiedades (posición, retraso, duración)
            const size = Math.random() * 4 + 2; // de 2px a 6px
            const posX = Math.random() * 100; // 0% a 100% (ancho)
            const posY = Math.random() * 100; // 0% a 100% (alto)
            const delay = Math.random() * 5; // 0s a 5s
            const duration = Math.random() * 5 + 5; // 5s a 10s
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${posX}%`;
            particle.style.top = `${posY}%`;
            particle.style.setProperty('--delay', `${delay}s`);
            particle.style.setProperty('--duration', `${duration}s`);
            
            particlesContainer.appendChild(particle);
        }
    }

    // 4. Formulario de Captación de Leads (Integración con N8N Webhook)
    const leadForm = document.getElementById('lead-form');
    const submitBtn = document.getElementById('submit-btn');

    if (leadForm) {
        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Cambiar estado del botón
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Procesando...';
            submitBtn.disabled = true;

            // Recopilar datos del formulario
            const formData = new FormData(leadForm);
            const leadData = Object.fromEntries(formData.entries());
            
            // Webhook REAL de n8n — Destino Abril Captación de Leads
            const n8nWebhookUrl = 'https://n8n.automatizameuy.com/webhook/webhook-destino-abril';

            try {
                console.log('Enviando lead a Destino Abril CRM:', leadData);
                
                const response = await fetch(n8nWebhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(leadData)
                });
                
                if (!response.ok) throw new Error('Error al enviar el formulario');
                
                // Éxito
                submitBtn.innerHTML = '<i class="ph ph-check-circle"></i> ¡Solicitud Enviada!';
                submitBtn.style.background = 'var(--success)';
                submitBtn.style.color = 'white';
                
                // Resetear form y botón luego de un tiempo
                setTimeout(() => {
                    leadForm.reset();
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                    submitBtn.style.color = '';
                    submitBtn.disabled = false;
                }, 4000);

            } catch (error) {
                console.error('Error:', error);
                
                // Error
                submitBtn.innerHTML = '<i class="ph ph-warning"></i> Error de conexión';
                submitBtn.style.background = 'var(--danger)';
                submitBtn.style.color = 'white';
                
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                    submitBtn.style.color = '';
                    submitBtn.disabled = false;
                }, 4000);
            }
        });
    }

    // Lógica dinámica para la moneda del Presupuesto
    const tipoOperacion = document.getElementById('tipo_operacion');
    const monedaSelect = document.getElementById('moneda');
    const presupuestoInput = document.getElementById('presupuesto');

    if (tipoOperacion && monedaSelect && presupuestoInput) {
        tipoOperacion.addEventListener('change', (e) => {
            const valor = e.target.value;
            if (valor === 'alquilar' || valor === 'dar_alquiler') {
                monedaSelect.value = 'UYU'; // Cambia a Pesos
                presupuestoInput.placeholder = 'Ej: 25000 (en adelante)';
            } else {
                monedaSelect.value = 'USD'; // Cambia a Dólares
                presupuestoInput.placeholder = 'Ej: 150000';
            }
        });
    }
});
