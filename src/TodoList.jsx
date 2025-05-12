import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/Button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Checkbox } from "@/components/ui/checkbox.jsx"; // 1. Importar Checkbox
// Importar ícones se for usar no futuro
import { Trash2, Edit, Save, XCircle } from 'lucide-react';
export default function TodoList() {
  // Estado para rastrear se o carregamento inicial foi concluído
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState('all'); // Estado para o filtro ('all', 'active', 'completed')
  const [editingTaskId, setEditingTaskId] = useState(null); // Se usar edição
  const [editText, setEditText] = useState(""); // Se usar edição
  const editInputRef = useRef(null); // Se usar edição
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

  // ... (imports, estados, outros hooks) ...

  const removeTask = (id) => {
    // Encontra a tarefa para mostrar o texto na confirmação
    const taskToRemove = tasks.find(task => task.id === id);
    // Pede confirmação ao usuário
    if (window.confirm(`Tem certeza que deseja remover a tarefa "${taskToRemove?.text || ''}"?`)) {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  // --- Funções de Edição ---
  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditText(task.text);
    // Foca no input após a renderização
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditText("");
  };

  const saveEditing = (id) => {
    if (!editText.trim()) {
      // Opcional: ou remover a tarefa se o texto ficar vazio?
      alert("O texto da tarefa não pode ficar vazio.");
      editInputRef.current?.focus(); // Foca novamente
      return;
    }
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, text: editText.trim() } : task
      )
    );
    cancelEditing(); // Sai do modo de edição
  };

  const handleEditKeyDown = (event, id) => {
    if (event.key === 'Enter') {
      saveEditing(id);
    } else if (event.key === 'Escape') {
      cancelEditing();
    }
  };
// ... (restante do componente) ...
  // --- Lógica de Filtragem ---
  
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.done;
    if (filter === 'completed') return task.done;
    return true; // 'all'
  });
  // --- JSX para renderização ---
  return (
    <div className="max-w-md mx-auto p-4 shadow-xl bg-white dark:bg-zinc-900 rounded-2xl border-2">
      <h1 className="text-2xl font-bold mb-4 text-center dark:text-white">📋 To-Do List</h1>
      <div className="flex justify-center gap-2 mb-4">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Nova tarefa"
          className=""
          onKeyPress={(e) => e.key === 'Enter' && addTask()} // Adiciona com Enter
          disabled={isLoading} // Desabilita input durante carregamento inicial
        />
        <Button onClick={addTask} disabled={isLoading}>Adicionar</Button>
      </div>

      <div className="flex justify-center gap-2 mb-4">
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>Todas</Button>
        <Button variant={filter === 'active' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('active')}>Ativas</Button>
        <Button variant={filter === 'completed' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('completed')}>Concluídas</Button>
      </div>

      {isLoading && ( // Mostra indicador de carregamento
        <p className="text-center text-zinc-500 mt-4">Carregando tarefas...</p>
      )}

{!isLoading && (
        <ul className="mt-4 space-y-2">
          <AnimatePresence>
            {filteredTasks.map((task) => (
              <motion.li
                key={task.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                // Ajustado gap para acomodar mais botões
                className={`flex items-center gap-2 p-3 rounded-lg shadow-sm bg-zinc-100 dark:bg-zinc-800 transition duration-200 ease-in-out ${task.done ? 'opacity-60' : ''}`}
              >
                
                {editingTaskId === task.id ? (
                  // --- Modo de Edição ---
                  <>
                    <Input
                      ref={editInputRef}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, task.id)}
                      className="flex-1 h-8" // Ajustar altura se necessário
                      autoFocus // Foca automaticamente ao entrar em edição
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-green-600 hover:text-green-700" onClick={() => saveEditing(task.id)}>
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-red-600 hover:text-red-700" onClick={cancelEditing}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                 // --- Modo de Visualização ---
                 <>
                 <Checkbox
                   id={`task-${task.id}`}
                   checked={task.done}
                   onCheckedChange={() => toggleTask(task.id)}
                   className="shrink-0"
                 />
                 <span
                   onDoubleClick={() => startEditing(task)} // Duplo clique para editar
                   className={`cursor-pointer flex-1 break-words ml-2 ${task.done ? 'line-through text-zinc-500 dark:text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'}`}
                   title="Clique duplo para editar" // Dica
                 >
                   {task.text}
                 </span>
                 <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-blue-600 hover:text-blue-700" onClick={() => startEditing(task)}>
                   <Edit className="h-4 w-4" />
                 </Button>
                 <Button
                   variant="ghost"
                   size="icon"
                   className="text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 h-6 w-6 shrink-0"
                   onClick={() => removeTask(task.id)}
                 >
                <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
     {!isLoading && filteredTasks.length === 0 && (
   <p className="text-center text-zinc-500 mt-4">
     {filter === 'completed' ? 'Nenhuma tarefa concluída.' : // <-- USADO AQUI
      filter === 'active' ? 'Nenhuma tarefa ativa.' : // <-- USADO AQUI
      'Nenhuma tarefa adicionada ainda.'}
   </p>
 )}
    </div>
  );
}