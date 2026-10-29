# El Giro del Panda 🐼🌸

Obra computacional interactiva hecha con **HTML, CSS y p5.js**. La música y los efectos se generan con Web Audio, así que no hay archivos de audio ni de imagen.

## Cómo jugar
1. Abre `index.html` en un navegador con conexión a internet (p5.js y las fuentes se cargan desde CDN).
2. Mueve al panda con **WASD** o las **flechas**.
3. Acércate al platillo rosa y pulsa **E** para subir. Luego pulsa **E** repetidamente (12 veces) hasta marearte: se abre el capítulo.
4. Pulsa **Continuar** para volver al recinto.
5. Entre capítulo y capítulo:
   - Puedes ir al **bambú** (zona izquierda o esquina inferior derecha) y pulsar **Espacio** para comer.
   - **Es obligatorio dormir**: ve a la **cama** (arriba a la derecha) y pulsa **Espacio**. La pantalla se oscurece un rato y luego vuelve; así se desbloquea el siguiente giro.
6. Tras el capítulo 5, el panda se tira de espaldas a mover las patas, y puedes seguir jugando libremente.

La pelota, los troncos y los bambús también responden a **Espacio**. La tecla **M** (o el botón de arriba) activa o silencia la música. La música empieza con la primera tecla o clic, por las reglas de los navegadores.

## Archivos
- `index.html`: estructura, panel de capítulos y ciclo.
- `style.css`: diseño de la página, paneles y ventana narrativa.
- `audio.js`: música de fondo procedural y efectos de sonido.
- `sketch.js`: escena, panda, movimiento, platillo, bambú, cama y capítulos.