const rl = require('readline');
const chalk = require('chalk');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

// json 파일 db 데이터 초기화
db.defaults({todos: [], users: []}).write();

const inputReadline = rl.createInterface({
    input : process.stdin,
    output: process.stdout,
});

class TodoApp{
    mainExecutor() {
        inputReadline.setPrompt('명령어를 입력하세요(도움말은 help / 종료하려면 q를 누르세요): ');
        inputReadline.prompt();
        inputReadline.on('line', function (line) {

            if (line === "q") inputReadline.close();
            todoList.checkCommands(line);

            if (line === 'no') {
                todoList.register()
            }
        })

            .on('close', function () {
                console.log('프로그램이 종료되었습니다.');
                process.exit();
            });
    }

    checkCommands(userInput) {
        const splitUserInput = userInput.split(' ');
        if (userInput.split(' ').length < 1 || userInput.split(' ').length > 2) {
            console.log("입력값을 확인해주세요");
            inputReadline.setPrompt('명령어를 입력하세요(종료하려면 q를 누르세요): ');
            inputReadline.prompt();
            return;
        }

        const [command, commandElement] = splitUserInput;
        switch (command) {
            case 'help':
                this.usage();
                break;
            case 'new':
                this.newTodo();
                break;
            case 'get':
                this.getTodos();
                break;
            case 'complete':
                this.completeTodo(commandElement);
                break;
            case 'delete':
                this.deleteTodo(commandElement);
                break;
            case 'update':
                this.updateTodo(commandElement);
                break;
            default:
                this.errorLog('invalid command passed');
                this.usage();
        }
    }
    // usage represents the help guide
    usage() {
        const usageText = `
    TODO helps you manage you todo tasks.
    usage: type 'command'
    commands can be:
    new:                   used to create a new todo
    get:                   used to retrieve your todos
    complete + item No.:   used to mark a todo as complete
    update + item No.:     used to update the todo title
    help:                  used to print the usage guide
  `;
        console.log(usageText)
    }

    newTodo() {
        const q = chalk.blue('Type in your todo\n');
        this.prompt(q).then(todo => {
            const newID = Math.floor(Math.random() * 10000) + 1;
            db.get('todos')
                .push({
                    id      : newID,
                    title   : todo,
                    complete: false,
                })
                .write();
        });
    }

    getTodos() {
        const todos = db.get('todos').value();
        let index = 1;
        todos.forEach(todo => {
            let todoText = `${index++}. ${todo.title}`
            if (todo.complete) {
                todoText += ' ✔ ️'
            }
            console.log(chalk.strikethrough(todoText))
        });
    }

    completeTodo(itemToComplete) {
        const n = Number(itemToComplete);
        // check if the value is a number
        if (isNaN(n)) {
            errorLog("please provide a valid number for complete command");
            return
        }

        // check if correct length of values has been passed
        let todosLength = db.get('todos').value().length;
        if (n > todosLength) {
            errorLog("invalid number passed for complete command.");
            return
        }

        // update the todo item marked as complete
        db.set(`todos[${n - 1}].complete`, true).write();
        const complete_todo = db.get(`todos[${n - 1}].title`).value();
        console.log(`${complete_todo} is checked as complete`)
    }

    deleteTodo(itemToDelete) {
        const n = Number(itemToDelete);
        if (isNaN(n)) {
            errorLog("please provide a valid number for complete command");
            return
        }

        // check if correct length of values has been passed
        let todosLength = db.get('todos').value().length;
        if (n > todosLength) {
            errorLog("invalid number passed for complete command.");
            return
        }

        // delete the item
        const deletedItem = db.get(`todos[${n - 1}].title`).value();
        const deletedItemID = db.get(`todos[${n - 1}].id`).value();
        db.get(`todos`).remove({id: deletedItemID}).write();
        console.log(`${deletedItem} is deleted`)
    }

    updateTodo(itemToUpdate) {
        const n = Number(itemToUpdate);

        if (isNaN(n)) {
            errorLog("please provide a valid number for complete command");
            return
        }

        // check if correct length of values has been passed
        let todosLength = db.get('todos').value().length;
        if (n > todosLength) {
            errorLog("invalid number passed for complete command.");
            return
        }

        // update the item
        const updatedItemTitle = db.get(`todos[${n - 1}.title]`).value();
        const q = chalk.blue('Type the title to update\n');
        this.prompt(q).then(UpdatedTitle => {
            console.log(db.get('todos').find({title: `${updatedItemTitle}`}).assign({title: UpdatedTitle}).write());
        });
    }

}

const todoList = new TodoApp();
todoList.mainExecutor();