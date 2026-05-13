// ==================== TODO APP ====================
// Application avec Local Storage

class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.storageKey = 'votecheck_todos';
        
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        const addBtn = document.getElementById('addBtn');
        const todoInput = document.getElementById('todoInput');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const clearBtn = document.getElementById('clearBtn');

        addBtn.addEventListener('click', () => this.addTodo());
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        clearBtn.addEventListener('click', () => this.clearAll());
    }

    addTodo() {
        const todoInput = document.getElementById('todoInput');
        const text = todoInput.value.trim();

        if (!text) {
            alert('Veuillez entrer une tâche!');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString('fr-FR')
        };

        this.todos.unshift(todo);
        this.saveToStorage();
        todoInput.value = '';
        todoInput.focus();
        this.render();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveToStorage();
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToStorage();
            this.render();
        }
    }

    clearAll() {
        if (this.todos.length === 0) {
            alert('Aucune tâche à effacer!');
            return;
        }

        if (confirm('Êtes-vous sûr de vouloir effacer TOUTES les tâches ?')) {
            this.todos = [];
            this.saveToStorage();
            this.render();
        }
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    render() {
        const todoList = document.getElementById('todoList');
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            todoList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <p>Aucune tâche à afficher</p>
                </div>
            `;
        } else {
            todoList.innerHTML = filteredTodos.map(todo => `
                <li class="todo-item ${todo.completed ? 'completed' : ''}">
                    <input 
                        type="checkbox" 
                        class="checkbox" 
                        ${todo.completed ? 'checked' : ''}
                        onchange="app.toggleTodo(${todo.id})"
                    >
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    <button class="delete-btn" onclick="app.deleteTodo(${todo.id})">
                        🗑️ Supprimer
                    </button>
                </li>
            `).join('');
        }

        this.updateStats();
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;

        document.getElementById('totalTodos').textContent = `Total: ${total}`;
        document.getElementById('completedTodos').textContent = `Complétées: ${completed}`;
    }

    saveToStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.todos));
    }

    loadFromStorage() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                this.todos = JSON.parse(stored);
            } catch (e) {
                console.error('Erreur lors du chargement des tâches:', e);
                this.todos = [];
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialiser l'application
const app = new TodoApp();
