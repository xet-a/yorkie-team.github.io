import { DirectoryInfo } from '@/utils/exampleFileUtils';
        export const FILE_INFO: DirectoryInfo = {"isFile":false,"name":"react-todomvc","path":"/","children":[{"isFile":false,"name":"src","path":"/src","children":[{"isFile":true,"isOpen":false,"language":"css","name":"App.css","path":"/src/App.css","content":"body {\n  margin: 20px;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',\n    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',\n    sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\ncode {\n  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',\n    monospace;\n}\n\n.filters li button {\n  color: inherit;\n  margin: 0px 3px 0px 3px;\n  padding: 0px 3px 0px 3px;\n  text-decoration: none;\n  border: 1px solid transparent;\n  border-radius: 3px;\n}\n\n.filters li button:hover {\n  border-color: #DB7676;\n}\n\n.filters li button.selected {\n  border-color: #CE4646;\n}"},{"isFile":true,"isOpen":false,"language":"tsx","name":"App.tsx","path":"/src/App.tsx","content":"import React, { useState, useEffect } from 'react';\nimport yorkie, { Document, JSONArray } from 'yorkie-js-sdk';\nimport 'todomvc-app-css/index.css';\n\nimport Header from './Header';\nimport MainSection from './MainSection';\nimport { Todo } from './model';\nimport './App.css';\n\nconst initialState = [\n  {\n    id: 0,\n    text: 'Yorkie JS SDK',\n    completed: false,\n  },\n  {\n    id: 1,\n    text: 'Garbage collection',\n    completed: false,\n  },\n  {\n    id: 2,\n    text: 'RichText datatype',\n    completed: false,\n  },\n] as Array<Todo>;\n\n/**\n * `App` is the root component of the application.\n */\nexport default function App() {\n  const [doc] = useState<Document<{ todos: JSONArray<Todo> }>>(\n    () =>\n      new yorkie.Document<{ todos: JSONArray<Todo> }>(\n        `react-todomvc-${new Date()\n          .toISOString()\n          .substring(0, 10)\n          .replace(/-/g, '')}`,\n      ),\n  );\n  const [todos, setTodos] = useState<Array<Todo>>([]);\n\n  const actions = {\n    addTodo: (text: string) => {\n      doc?.update((root) => {\n        root.todos.push({\n          id:\n            root.todos.reduce((maxId, todo) => Math.max(todo.id, maxId), -1) +\n            1,\n          completed: false,\n          text,\n        });\n      });\n    },\n    deleteTodo: (id: number) => {\n      doc?.update((root) => {\n        let target;\n        for (const todo of root.todos) {\n          if (todo.id === id) {\n            target = todo as any;\n            break;\n          }\n        }\n        if (target) {\n          root.todos.deleteByID!(target.getID());\n        }\n      });\n    },\n    editTodo: (id: number, text: string) => {\n      doc?.update((root) => {\n        let target;\n        for (const todo of root.todos) {\n          if (todo.id === id) {\n            target = todo;\n            break;\n          }\n        }\n        if (target) {\n          target.text = text;\n        }\n      });\n    },\n    completeTodo: (id: number) => {\n      doc?.update((root) => {\n        let target;\n        for (const todo of root.todos) {\n          if (todo.id === id) {\n            target = todo;\n            break;\n          }\n        }\n        if (target) {\n          target.completed = !target.completed;\n        }\n      });\n    },\n    clearCompleted: () => {\n      doc?.update((root) => {\n        for (const todo of root.todos) {\n          if (todo.completed) {\n            const t = todo as any;\n            root.todos.deleteByID!(t.getID());\n          }\n        }\n      }, '');\n    },\n  };\n\n  useEffect(() => {\n    const client = new yorkie.Client(import.meta.env.VITE_YORKIE_API_ADDR, {\n      apiKey: import.meta.env.VITE_YORKIE_API_KEY,\n    });\n\n    /**\n     * `attachDoc` is a helper function to attach the document into the client.\n     */\n    async function attachDoc(\n      doc: Document<{ todos: JSONArray<Todo> }>,\n      callback: (todos: any) => void,\n    ) {\n      // 01. create client with RPCAddr then activate it.\n      await client.activate();\n\n      // 02. attach the document into the client.\n      await client.attach(doc);\n\n      // 03. create default todos if not exists.\n      doc.update((root) => {\n        if (!root.todos) {\n          root.todos = initialState;\n        }\n      }, 'create default todos if not exists');\n\n      // 04. subscribe change event from local and remote.\n      doc.subscribe((event) => {\n        callback(doc.getRoot().todos);\n      });\n\n      // 05. set todos  the attached document.\n      callback(doc.getRoot().todos);\n    }\n\n    attachDoc(doc, (todos) => {\n      setTodos(todos);\n    });\n  }, []);\n\n  return (\n    <div className=\"App\">\n      <Header addTodo={actions.addTodo} />\n      <MainSection todos={todos} actions={actions} />\n    </div>\n  );\n}\n"},{"isFile":true,"isOpen":false,"language":"tsx","name":"Footer.tsx","path":"/src/Footer.tsx","content":"import React from 'react';\nimport classnames from 'classnames';\n\nconst FILTER_TITLES: { [name: string]: string } = {\n  SHOW_ALL: 'All',\n  SHOW_ACTIVE: 'Active',\n  SHOW_COMPLETED: 'Completed',\n};\n\ntype MouseEventHandler =\n  (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;\n\ninterface FooterProps {\n  completedCount: number;\n  activeCount: number;\n  filter: string;\n  onClearCompleted: MouseEventHandler;\n  onShow: Function;\n}\n\nexport default function Footer(props: FooterProps) {\n  const {\n    activeCount,\n    completedCount,\n    filter: selectedFilter,\n    onClearCompleted,\n    onShow\n  } = props;\n  return (\n    <footer className=\"footer\">\n      <span className=\"todo-count\">\n        <strong>{activeCount || 'No'}</strong>\n        &nbsp;{activeCount === 1 ? 'item' : 'items'} left\n      </span>\n      <ul className=\"filters\">\n        {\n          ['SHOW_ALL', 'SHOW_ACTIVE', 'SHOW_COMPLETED'].map((filter) => (\n            <li key={filter}>\n              <button\n                type=\"button\"\n                className={classnames({ selected: filter === selectedFilter })}\n                style={{ cursor: 'pointer' }}\n                onClick={() => onShow(filter)}\n              >\n                {FILTER_TITLES[filter]}\n              </button>\n            </li>\n          ))\n        }\n      </ul>\n      {!!completedCount && (\n        <button type=\"button\" className=\"clear-completed\" onClick={onClearCompleted}>\n          Clear completed\n        </button>\n      )}\n    </footer>\n  );\n}\n"},{"isFile":true,"isOpen":false,"language":"tsx","name":"Header.tsx","path":"/src/Header.tsx","content":"import React from 'react';\nimport TodoTextInput from './TodoTextInput';\n\ninterface HeaderProps {\n  addTodo: Function\n}\n\nexport default function Header(props: HeaderProps) {\n  return (\n    <header className=\"header\">\n      <h1>todos</h1>\n      <TodoTextInput\n        newTodo\n        onSave={(text: string) => {\n          if (text.length !== 0) {\n            props.addTodo(text);\n          }\n        }}\n        placeholder=\"What needs to be done?\"\n      />\n    </header>\n  );\n}\n"},{"isFile":true,"isOpen":false,"language":"tsx","name":"MainSection.tsx","path":"/src/MainSection.tsx","content":"import React, { useState } from 'react';\nimport { Todo } from './model';\nimport TodoItem from './TodoItem';\nimport Footer from './Footer';\n\nconst TODO_FILTERS: { [name: string]: (todo: Todo) => boolean } = {\n  SHOW_ALL: (todo: Todo) => true,\n  SHOW_ACTIVE: (todo: Todo) => !todo.completed,\n  SHOW_COMPLETED: (todo: Todo) => todo.completed,\n};\n\ntype ChangeEventHandler = (event: React.ChangeEvent<HTMLInputElement>) => void;\n\ninterface MainSectionProps {\n  todos: Array<Todo>;\n  actions: { [name: string]: Function };\n}\n\nexport default function MainSection(props: MainSectionProps) {\n  const [filter, setFilter] = useState('SHOW_ALL');\n  const { todos, actions } = props;\n  const filteredTodos = todos.filter(TODO_FILTERS[filter]);\n  const completedCount = todos.reduce((count, todo) => {\n    return todo.completed ? count + 1 : count;\n  }, 0);\n  const activeCount = todos.length - completedCount;\n  if (todos.length === 0) {\n    return null;\n  }\n\n  return (\n    <section className=\"main\">\n      <input\n        className=\"toggle-all\"\n        type=\"checkbox\"\n        defaultChecked={completedCount === todos.length}\n        onChange={actions.completeAll as ChangeEventHandler}\n      />\n      <ul className=\"todo-list\">\n        {\n          filteredTodos.map((todo) => (\n            <TodoItem\n              key={todo.id}\n              todo={todo}\n              editTodo={actions.editTodo}\n              deleteTodo={actions.deleteTodo}\n              completeTodo={actions.completeTodo}\n            />\n          ))\n        }\n      </ul>\n      <Footer\n        completedCount={completedCount}\n        activeCount={activeCount}\n        filter={filter}\n        onClearCompleted={() => actions.clearCompleted()}\n        onShow={setFilter}\n      />\n    </section>\n  );\n}\n"},{"isFile":true,"isOpen":false,"language":"tsx","name":"TodoItem.tsx","path":"/src/TodoItem.tsx","content":"import React, { useState } from 'react';\nimport classnames from 'classnames';\nimport { Todo } from './model';\nimport TodoTextInput from './TodoTextInput';\n\ninterface TodoItemProps {\n  todo: Todo;\n  editTodo: Function;\n  deleteTodo: Function;\n  completeTodo: Function;\n}\n\nexport default function TodoItem(props: TodoItemProps) {\n  const [editing, setEditing] = useState(false);\n  const { todo, completeTodo, editTodo, deleteTodo } = props;\n \n  return (\n    <li\n      className={classnames({\n        completed: todo.completed,\n        editing,\n      })}\n    >\n      {editing ? (\n        <TodoTextInput\n          text={todo.text}\n          editing={editing}\n          onSave={(text: string) => {\n            if (text.length === 0) {\n              deleteTodo(todo.id);\n            } else {\n              editTodo(todo.id, text);\n            }\n            setEditing(false);\n          }}\n        />\n      ) : (\n        <div className=\"view\">\n          <input\n            id={`item-input-${todo.id}`}\n            className=\"toggle\"\n            type=\"checkbox\"\n            checked={todo.completed}\n            onChange={() => completeTodo(todo.id)}\n          />\n          <label htmlFor={`item-input-${todo.id}`} onDoubleClick={() => setEditing(true)}>{todo.text}</label>\n          <button type=\"button\" aria-label=\"Delete\" className=\"destroy\" onClick={() => deleteTodo(todo.id)} />\n        </div>\n      )}\n    </li>\n  );\n}\n"},{"isFile":true,"isOpen":false,"language":"tsx","name":"TodoTextInput.tsx","path":"/src/TodoTextInput.tsx","content":"import React, { useState } from 'react';\nimport classnames from 'classnames';\n\ninterface TodoInputProps {\n  onSave: Function;\n  placeholder?: string;\n  editing?: boolean;\n  text?: string;\n  newTodo?: boolean;\n}\n\nexport default function TodoTextInput(props: TodoInputProps) {\n  const [text, setText] = useState(props.text || '');\n\n  return (\n    <input\n      className={classnames({\n        edit: props.editing,\n        'new-todo': props.newTodo,\n      })}\n      type=\"text\"\n      placeholder={props.placeholder}\n      value={text}\n      onBlur={(e: React.FocusEvent<HTMLInputElement>) => {\n        if (!props.newTodo) {\n          props.onSave(e.target.value);\n        }\n      }}\n      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {\n        setText(e.target.value);\n      }}\n      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {\n        const target = e.target as HTMLInputElement;\n        if (e.which === 13) {\n          props.onSave(target.value.trim());\n          if (props.newTodo) {\n            setText('');\n          }\n        }\n      }}\n    />\n  );\n}\n"},{"isFile":true,"isOpen":false,"language":"tsx","name":"main.tsx","path":"/src/main.tsx","content":"import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(\n  <App />,\n);\n"},{"isFile":true,"isOpen":false,"language":"typescript","name":"model.ts","path":"/src/model.ts","content":"export interface Todo {\n  id: number;\n  text: string;\n  completed: boolean;\n}\n"},{"isFile":true,"isOpen":false,"language":"typescript","name":"vite-env.d.ts","path":"/src/vite-env.d.ts","content":"/// <reference types=\"vite/client\" />\n"}]},{"isFile":true,"isOpen":false,"language":"","name":".env","path":"/.env","content":"VITE_YORKIE_API_ADDR='http://localhost:8080'\nVITE_YORKIE_API_KEY=''\n"},{"isFile":true,"isOpen":false,"language":"production","name":".env.production","path":"/.env.production","content":"VITE_YORKIE_API_ADDR='https://api.yorkie.dev'\nVITE_YORKIE_API_KEY='cedaovjuioqlk4pjqn6g'\n"},{"isFile":true,"isOpen":false,"language":"","name":".gitignore","path":"/.gitignore","content":"# Logs\nlogs\n*.log\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\npnpm-debug.log*\nlerna-debug.log*\n\nnode_modules\ndist\ndist-ssr\n*.local\n\n# Editor directories and files\n.vscode/*\n!.vscode/extensions.json\n.idea\n.DS_Store\n*.suo\n*.ntvs*\n*.njsproj\n*.sln\n*.sw?\n"},{"isFile":true,"isOpen":false,"language":"markdown","name":"README.md","path":"/README.md","content":"# Yorkie React TodoMVC Example\n\n<p>\n    <a href=\"https://yorkie.dev/yorkie-js-sdk/examples/react-todomvc/\" target=\"_blank\">\n        <img src=\"https://img.shields.io/badge/preview-message?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMTUiIHZpZXdCb3g9IjAgMCAyNCAxNSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTYuODU3MTcgMi43ODE5OUwxMS4yNzUxIDkuMTI2NzhDMTEuNTU0NCA5LjUyODAxIDEyLjEwNjIgOS42MjY3NiAxMi41MDc0IDkuMzQ3NDRDMTIuNTkzNCA5LjI4NzUgMTIuNjY4MSA5LjIxMjggMTIuNzI4MSA5LjEyNjc4TDE3LjE0NiAyLjc4MTk5QzE3LjcwNDggMS45Nzk1NCAxNy41MDcyIDAuODc2MTMxIDE2LjcwNDggMC4zMTc0OTRDMTYuNDA4IDAuMTEwODM3IDE2LjA1NSAwIDE1LjY5MzIgMEg4LjMxMDAxQzcuMzMyMiAwIDYuNTM5NTUgMC43OTI2NTQgNi41Mzk1NSAxLjc3MDQ2QzYuNTM5NjggMi4xMzIxMSA2LjY1MDUxIDIuNDg1MTEgNi44NTcxNyAyLjc4MTk5WiIgZmlsbD0iIzUxNEM0OSIvPgo8cGF0aCBkPSJNMTMuODA4OSAxNC4yMzg4QzE0LjEyMzEgMTQuNDE4IDE0LjQ4NDcgMTQuNDk2NiAxNC44NDUgMTQuNDY0MkwyMi45MjYgMTMuNzM1QzIzLjU3NTMgMTMuNjc2NSAyNC4wNTQgMTMuMTAyNyAyMy45OTU1IDEyLjQ1MzVDMjMuOTkyNCAxMi40MTkyIDIzLjk4NzggMTIuMzg1MSAyMy45ODE3IDEyLjM1MTNDMjMuNzM4OSAxMC45OTY4IDIzLjI2MTEgOS42OTUyNyAyMi41Njk5IDguNTA1NDZDMjEuODc4NiA3LjMxNTY1IDIwLjk4NDggNi4yNTU3NyAxOS45Mjg2IDUuMzczOTFDMTkuNDI4MiA0Ljk1NjE0IDE4LjY4MzkgNS4wMjMwNyAxOC4yNjYyIDUuNTIzNTZDMTguMjQ0MiA1LjU0OTkgMTguMjIzMyA1LjU3NzI2IDE4LjIwMzYgNS42MDU1MUwxMy41NjcgMTIuMjY0MUMxMy4zNjAzIDEyLjU2MSAxMy4yNDk1IDEyLjkxNCAxMy4yNDk1IDEzLjI3NThWMTMuMjUzN0MxMy4yNDk1IDEzLjQ1NjIgMTMuMzAxNiAxMy42NTU0IDEzLjQwMDggMTMuODMxOUMxMy41MDUgMTQuMDA1NCAxMy42NTIxIDE0LjE0OTMgMTMuODI4MSAxNC4yNDk2IiBmaWxsPSIjRkRDNDMzIi8+CjxwYXRoIGQ9Ik0xMC42NDE2IDEzLjc0MzRDMTAuNTM3NSAxMy45NTU5IDEwLjM3MiAxNC4xMzIyIDEwLjE2NjUgMTQuMjQ5NEwxMC4xOTE1IDE0LjIzNTFDOS44NzczNCAxNC40MTQzIDkuNTE1NjkgMTQuNDkyOSA5LjE1NTQ0IDE0LjQ2MDVMMS4wNzQ0MSAxMy43MzEzQzEuMDQwMTggMTMuNzI4MyAxLjAwNjA3IDEzLjcyMzcgMC45NzIyMjUgMTMuNzE3NkMwLjMzMDYyIDEzLjYwMjUgLTAuMDk2MzExOSAxMi45ODkyIDAuMDE4NzI0MiAxMi4zNDc2QzAuMjYxNTIyIDEwLjk5MyAwLjczOTM1NCA5LjY5MTU2IDEuNDMwNDYgOC41MDE2M0MyLjEyMTU3IDcuMzExNjkgMy4wMTU1MSA2LjI1MjA2IDQuMDcxODQgNS4zNzAwOEM0LjA5ODE4IDUuMzQ4MDYgNC4xMjU1NCA1LjMyNzE5IDQuMTUzNzkgNS4zMDc0N0M0LjY4ODc2IDQuOTM1IDUuNDI0MjcgNS4wNjY3MSA1Ljc5Njg3IDUuNjAxNjhMMTAuNDMzNCAxMi4yNjA0QzEwLjY0MDEgMTIuNTU3MyAxMC43NTA5IDEyLjkxMDMgMTAuNzUwOSAxMy4yNzIxVjEzLjI0MzJDMTAuNzUwOSAxMy40Nzk3IDEwLjY3OTggMTMuNzExIDEwLjU0NjggMTMuOTA2NyIgZmlsbD0iI0ZEQzQzMyIvPgo8L3N2Zz4K&color=FEF3D7\" alt=\"Live Preview\" />\n    </a>\n</p>\n\n<img width=\"500\" alt=\"React TodoMVC\" src=\"thumbnail.jpg\"/>\n\n## How to run demo\n\nAt project root, run below command to start Yorkie server.\n\n```bash\n$ docker-compose -f docker/docker-compose.yml up --build -d\n```\n\nThen install dependencies and run the demo.\n\n```bash\n$ npm install\n```\n\nNow you can run the demo.\n\n```bash\n$ npm run dev\n```\n"},{"isFile":true,"isOpen":false,"language":"markup","name":"index.html","path":"/index.html","content":"<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <link rel=\"icon\" type=\"image/svg+xml\" href=\"/vite.svg\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Vite + React + TS</title>\n  </head>\n  <body>\n    <div id=\"root\"></div>\n    <script type=\"module\" src=\"/src/main.tsx\"></script>\n  </body>\n</html>\n"},{"isFile":true,"isOpen":false,"language":"json","name":"package.json","path":"/package.json","content":"{\n  \"name\": \"react-todomvc\",\n  \"private\": true,\n  \"version\": \"0.0.0\",\n  \"type\": \"module\",\n  \"scripts\": {\n    \"dev\": \"vite\",\n    \"build\": \"tsc && vite build\",\n    \"preview\": \"vite preview\"\n  },\n  \"dependencies\": {\n    \"classnames\": \"^2.3.2\",\n    \"react\": \"^18.2.0\",\n    \"react-dom\": \"^18.2.0\",\n    \"todomvc-app-css\": \"^2.4.2\",\n    \"yorkie-js-sdk\": \"^0.4.28\"\n  },\n  \"devDependencies\": {\n    \"@types/react\": \"^18.0.24\",\n    \"@types/react-dom\": \"^18.0.8\",\n    \"@vitejs/plugin-react\": \"^2.2.0\",\n    \"typescript\": \"^4.6.4\",\n    \"vite\": \"^3.2.7\"\n  }\n}\n"},{"isFile":true,"isOpen":false,"language":"jpg","name":"thumbnail.jpg","path":"/thumbnail.jpg","content":""},{"isFile":true,"isOpen":false,"language":"json","name":"tsconfig.json","path":"/tsconfig.json","content":"{\n  \"compilerOptions\": {\n    \"target\": \"ESNext\",\n    \"useDefineForClassFields\": true,\n    \"lib\": [\"DOM\", \"DOM.Iterable\", \"ESNext\"],\n    \"allowJs\": false,\n    \"skipLibCheck\": true,\n    \"esModuleInterop\": false,\n    \"allowSyntheticDefaultImports\": true,\n    \"strict\": true,\n    \"forceConsistentCasingInFileNames\": true,\n    \"module\": \"ESNext\",\n    \"moduleResolution\": \"Node\",\n    \"resolveJsonModule\": true,\n    \"isolatedModules\": true,\n    \"noEmit\": true,\n    \"jsx\": \"react-jsx\"\n  },\n  \"include\": [\"src\"],\n  \"references\": [{ \"path\": \"./tsconfig.node.json\" }]\n}\n"},{"isFile":true,"isOpen":false,"language":"json","name":"tsconfig.node.json","path":"/tsconfig.node.json","content":"{\n  \"compilerOptions\": {\n    \"composite\": true,\n    \"module\": \"ESNext\",\n    \"moduleResolution\": \"Node\",\n    \"allowSyntheticDefaultImports\": true\n  },\n  \"include\": [\"vite.config.ts\"]\n}\n"},{"isFile":true,"isOpen":false,"language":"typescript","name":"vite.config.ts","path":"/vite.config.ts","content":"import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\n// https://vitejs.dev/config/\nexport default defineConfig({\n  base: '',\n  plugins: [react()],\n});\n"}]}