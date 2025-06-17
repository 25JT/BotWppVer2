

function tour() {
  const driver = window.driver.js.driver;

  const driverObj = driver({
    showProgress: true,
    allowClose: false,
    animate: true,
    overlayClickNext: false,
    keyboardControl: true,
    showButtons: ['next', 'previous', 'close'], // más control para el usuario
    steps: [
      {
        element: '.sada',
        popover: {
          title: '👋 Bienvenido a BotWii',
          description: 'Te mostraremos cómo usar la app de forma rápida y efectiva.',
          side: 'left',
          align: 'start'
        }
      },
      {
        element: '.paso1',
        popover: {
          title: '📲 Agregar teléfonos',
          description: `Ingresa los teléfonos separados por comas, sin prefijos (+57).
          Ejemplo: 301234567,12345678,123698741.
          Evita espacios y otros caracteres.`,
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.paso2',
        popover: {
          title: '✍️ Escribir el mensaje',
          description: `Puedes escribir hasta 1.000 caracteres. Usa emojis y símbolos válidos para la app móvil.`,
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.paso3',
        popover: {
          title: '📤 Enviar el mensaje',
          description: 'Haz clic en "Enviar" y espera la confirmación. ¡Así de fácil!',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: 'code .line:nth-child(2)',
        popover: {
          title: '💡 Consejo útil',
          description: 'Los mensajes cortos y claros son más efectivos. ¡Menos es más! 😎',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.paso4',
        popover: {
          title: '📞 Soporte',
          description: '¿Dudas o problemas? Usa este botón para contactarnos. Estamos para ayudarte.',
          side: 'left',
          align: 'start'
        }
      },
      {
        popover: {
          title: '🎉 ¡Gracias!',
          description: 'Gracias por usar BotWii. ¡Mucho éxito en tus envíos! 🌟'
        }
      }
    ]
  });

  driverObj.drive();
}


