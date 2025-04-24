import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/Button.jsx";
import { Input } from "@/components/ui/input.jsx";

export default function TodoList() {
  // Estado para rastrear se o carregamento inicial foi concluído
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  // --- Hook para CARREGAR tarefas do localStorage ---
  useEffect(() => {
    console.log("Effect: Carregando tarefas...");
    const saved = localStorage.getItem('minhas-tarefas');
    console.log("Effect: Dados lidos:", saved);
    if (saved) {
      try {
        const parsedTasks = JSON.parse(saved);
        if (Array.isArray(parsedTasks)) {
          // Garante que todas as tarefas tenham um ID (para compatibilidade futura ou se dados antigos não tiverem)
          const tasksWithIds = parsedTasks.map((task, index) => ({
            id: task.id || Date.now() + index, // Usa ID existente ou gera um novo
            text: task.text,
            done: task.done || false,
          }));
          setTasks(tasksWithIds);
          console.log("Effect: Tarefas definidas:", tasksWithIds);
        } else {
          console.error("Dados carregados do localStorage não são um array:", parsedTasks);
          localStorage.removeItem('minhas-tarefas'); // Limpa dados inválidos
        }
      } catch (error) {
        console.error("Falha ao analisar tarefas do localStorage:", error);
        localStorage.removeItem('minhas-tarefas'); // Limpa dados inválidos
      }
    }
    // Marca o carregamento como concluído APÓS tentar carregar
    setIsLoading(false);
    console.log("Effect: Carregamento concluído.");
  }, []); // Array vazio garante que rode só uma vez na montagem

  // --- Hook para SALVAR tarefas no localStorage ---
  // (Apenas UM hook para salvar)
  useEffect(() => {
    // Só salva se o carregamento inicial já terminou E se houver tarefas ou se o item já existia
    if (!isLoading) {
       console.log("Effect: Salvando tarefas:", tasks);
       localStorage.setItem('minhas-tarefas', JSON.stringify(tasks));
    } else {
       console.log("Effect: Salvamento ignorado (ainda carregando).");
    }
  }, [tasks, isLoading]); // Depende de tasks E isLoading

  // --- Funções de manipulação de tarefas ---
  const addTask = () => {
    if (!newTask.trim()) return;
    // Adiciona tarefa com um ID único
    const taskToAdd = { id: Date.now(), text: newTask, done: false };
    setTasks([...tasks, taskToAdd]);
    setNewTask("");
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // --- JSX para renderização ---
  return (
    <div className="max-w-md mx-auto mt-10 p-4 shadow-xl bg-white dark:bg-zinc-900 rounded-2xl">
      <h1 className="text-2xl font-bold mb-4 text-center dark:text-white">📋 To-Do List</h1>
      <div className="flex gap-2 mb-4">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Nova tarefa"
          className="flex-1"
          onKeyPress={(e) => e.key === 'Enter' && addTask()} // Adiciona com Enter
          disabled={isLoading} // Desabilita input durante carregamento inicial
        />
        <Button onClick={addTask} disabled={isLoading}>Adicionar</Button>
      </div>

      {isLoading && ( // Mostra indicador de carregamento
        <p className="text-center text-zinc-500 mt-4">Carregando tarefas...</p>
      )}

      {!isLoading && ( // Mostra lista ou mensagem de "sem tarefas" apenas após carregar
        <ul className="mt-4 space-y-2">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.li
                key={task.id} // Usa ID único como chave
                layout // Anima mudanças de layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                className={`flex items-center justify-between p-3 rounded-lg shadow-sm bg-zinc-100 dark:bg-zinc-800 transition duration-200 ease-in-out ${task.done ? 'opacity-60' : ''}`}
              >
                <span
                  onClick={() => toggleTask(task.id)}
                  className={`cursor-pointer flex-1 mr-2 break-words ${task.done ? 'line-through text-zinc-500 dark:text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'}`}
                >
                  {task.text}
                </span>
                <Button
                  variant="ghost"
                  size="icon" // Tamanho de ícone
                  className="text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 h-8 w-8" // Estilo do botão de remover
                  onClick={() => removeTask(task.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                  </svg>
                </Button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {!isLoading && tasks.length === 0 && ( // Mostra apenas se não estiver carregando e não houver tarefas
        <p className="text-center text-zinc-500 mt-4">Nenhuma tarefa adicionada ainda.</p>
      )}
    </div>
  );
}