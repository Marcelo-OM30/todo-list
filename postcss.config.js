// filepath: /home/marcelo/minha-todo-list/postcss.config.js
import tailwindcss from '@tailwindcss/postcss'; // Importa o plugin correto
import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    tailwindcss, // Usa a variável importada
    autoprefixer,
  ],
}