const express = require("express"); // importa lib do Express
const sqlite3 = require("sqlite3"); // Importa lib do sqlite3
const bodyParser = require("body-parser"); // Importa o body-parser
const session = require("express-session"); // Importa 0 express-session

const PORT = 9000; // Porta TCP do servidor HTTP da aplicação

// Variáveis usadas no EJS (padrão)
let config = { titulo: "", rodape: "", dados: [] };

// config.dados = [
//   { username: "User 1", email: "x1@x.com", celular: "(19) 99999-9999" },
//   { username: "User 2", email: "x2@x.com", celular: "(20) 99999-9999" },
//   { username: "User 3", email: "x3@x.com", celular: "(21) 99999-9999" },
//   { username: "User 4", email: "x4@x.com", celular: "(22) 99999-9999" },
// ];

const app = express(); // Instância para uso do Express

// Cria conexão com obanco de dados
const db = new sqlite3.Database("user.db"); // Instância para uso do Sqlite3, e usa o arquivo 'user.db'

db.serialize(() => {
  // Este método permite enviar comandos SQL em modo 'sequencial'
  db.run(
    `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, 
    username TEXT, password TEXT, email TEXT, celular TEXT, cpf TEXT, rg TEXT)`
  );
});

// Configuração para uso de sessão (cookies) com Express
app.use(
  session({
    secret: "qualquersenha",
    resave: true,
    saveUninitialized: true,
  })
);

// __dirname é a variável interna do nodejs que guarda o caminho absoluto do projeto, no SO
// console.log(__dirname + "/static");

// Aqui será acrescentado uma rota "/static", para a pasta __dirname + "/static"
// O app.use é usado para acrescentar rotas novas para o Express gerenciar e pode usar
// Middleware para isto, que neste caso é o express.static, que gerencia rotas estáticas
app.use("/static", express.static(__dirname + "/static"));

// Middleware para processar requisições e envio de JSON
app.use(express.json());

// Middleware para processar as requisições do Body Parameters do cliente
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar EJS como o motor de visualização
app.set("view engine", "ejs");


const index =
  "<a href='/sobre'> Sobre </a><a href='/login'> Login </a><a href='/cadastro'> Cadastrar </a>";
const sobre = "sobre";
const login = 'Vc está na página "Login"<br><a href="/">Voltar</a>';
const cadastro = 'Vc está na página "Cadastro"<br><a href="/">Voltar</a>';


/* Método express.get necessita de dois parâmetros 
 Na ARROW FUNCTION, o primeiro são os dados do servidor (REQUISITION - 'req')
 o segundo, são os dados que serão enviados ao cliente (RESULT - 'res') */

app.get("/", (req, res) => {
  // Rota raiz do meu servidor, acesse o browser com o endereço http://localhost:8000/
  // res.send(index);
  console.log(`GET /index`);

  config = {
    titulo: "Blog da turma I2HNA - SESI Nova Odessa",
    rodape: "",
  };

  // config.rodape = "1";
  // res.render("pages/index", { titulo: config.titulo, req: req });
  // console.log({ ...config, req: req });
  res.render("pages/index", { ...config, req: req });
  // res.redirect("/cadastro"); // Redireciona para a ROTA cadastro
});

app.get("/usuarios", (req, res) => {
  const query = "SELECT * FROM users";
  db.all(query, (err, row) => {
    if (err) throw err;

    console.log(`GET /usuarios ${JSON.stringify(row)}`);
    // res.send("Lista de usuários.");
    // config.dados = row;
    // console.log(JSON.stringify(config.dados));
    res.render("partials/usertable", { ...config, dados: row, req: req });
  });
});

// GET Cadastro
app.get("/cadastro", (req, res) => {
  console.log("GET /cadastro");
  // Rota raiz do meu servidor, acesse o browser com o endereço http://localhost:8000/cadastro
  res.render("pages/cadastro", { titulo: "CADASTRO", req: req });
});

// POST do cadastro
app.post("/cadastro", (req, res) => {
  console.log("POST /cadastro - recebido");

  // verifica se o corpo da requisição existe e tem dados
  if (!req.body || Object.keys(req.body).length === 0) {
    console.log("Corpo de requisição vazio.");
    // é importante retornar aqui para não prosseguir    
    return res.status(400).json({ success: false, message: "Nenhum dado recebido." });
  }

  console.log("Corpo de requisição:", JSON.stringify(req.body, null, 2));

  const { username, password, email, celular, cpf, rg } = req.body;
  // Colocar aqui as validações e inclusão no banco de dados do cadastro do usuário
  // 1. Validar dados do usuário
  // 2. saber se ele já existe no banco

  // --- VALIDAÇÃO BÁSICA NO SERVIDOR (MUITO IMPORTANTE) ---
  // mesmo que o cliente valide, o servidor DEVE validar também
  if (!username || !password || !email) {
    return res.status(400).json({
      success: false,
      message: "Nome do usuário, senha e email são obrigatórios.",
    });
  }

  // outras validações podem ser adicionadas aqui (formato do email, força da senha, etc.)
  // exemplo simples de validação de email:
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Formato de email inválido." })
  };

  const checkUserQuery = "SELECT * FROM users WHERE username = ? OR email = ?";
  db.get(checkUserQuery, [username, email], (err, row) => {
    if (err) {
      console.error("Erro ao consultar o banco (verificar usuário):", err.message);
      // não envie o erro detalhado do banco para o cliente por segurança
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor ao verificar usuário."
      });
    }

    console.log("Resultado da consulta de usuário existente:", row);

    if (row) {
      // usuário já existente
      let conflictField = "";
      if (row.username === username) {
        conflictField = "Nome de usuário";
      } else if (row.email === email) {
        conflictField = "Email";
      }

      return res.status(409).json({
        // 409 conflict
        success: false,
        message: `${conflictField} já cadastrado. escolha outro`,
      });
    } else {
      // usuário não existente
      const insertQuery = "INSERT INTO users (username, password,email, celular, cpf, rg) VALUES (?, ?, ?, ?, ?, ?)";

      // lembre-se de usar a senha HASHED aqui no lugar de "password"
    }
  })

  // Linha para depurar se esta vindo dados no req.body
  !req.body
    ? console.log(`Body vazio: ${req.body}`)
    : console.log(JSON.stringify(req.body));



  // db.get(query, [email, cpf, rg, username], (err, row) => {
  db.get(query, [username], (err, row) => {
    if (err) throw err;
    console.log(`LINHA RETORNADA do SELECT USER: ${JSON.stringify(row)}`);
    if (row) {
      // A variável 'row' irá retornar os dados do banco de dados,
      // executado através do SQL, variável query
      res.redirect("/register_failed");
    } else {
      // 3. Se usuário não existe no banco cadastrar
      const insertQuery =
        "INSERT INTO users (username, password, email, celular, cpf, rg) VALUES (?,?,?,?,?,?)";
      db.run(
        insertQuery,
        [username, password, email, celular, cpf, rg],
        (err) => {
          // Inserir a lógica do INSERT
          if (err) throw err;
          res.redirect("/login");
        }
      );
    }
  });
});

// Pregramação de rotas do método GET do HTTP 'app.get()'
app.get("/sobre", (req, res) => {
  console.log("GET /sobre");
  // Rota raiz do meu servidor, acesse o browser com o endereço http://localhost:8000/sobre
  res.render("pages/sobre", { titulo: "SOBRE", req: req });
});

app.get("/logout", (req, res) => {
  console.log("GET /logout")
  // Exemplo de uma rota (END POINT) controlado pela sessão do usuário logado.
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.get("/login", (req, res) => {
  console.log("GET /login");
  // Rota raiz do meu servidor, acesse o browser com o endereço http://localhost:8000/info
  res.render("pages/login", { titulo: "LOGIN", req: req });
});

app.get("/register_failed", (req, res) => {
  console.log("GET /register_failed");
  res.render("pages/fail", { ...config, req: req, msg: "<a href='/cadastro'>Cadastro inválido</a>" });
});

app.get("/invalid_login", (req, res) => {
  console.log("GET /invalid_login");
  res.render("pages/fail", { ...config, req: req, msg: "Usuário e senha inválida!!!" });
});

app.post("/login", (req, res) => {
  console.log("POST /login");
  const { username, password } = req.body;

  // Consultar o usuario no banco de dados
  const query = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.get(query, [username, password], (err, row) => {
    if (err) throw err;

    // Se usuário válido -> registra a sessão e redireciona para o dashboard
    if (row) {
      req.session.loggedin = true;
      req.session.username = username;
      res.redirect("/dashboard");
    } // Se não, envia mensagem de erro (Usuário inválido)
    else {
      res.redirect("/invalid_login");
    }
  });
});

app.get("/dashboard", (req, res) => {
  console.log("GET /dashboard", req.status);
  console.log(JSON.stringify(config));

  if (req.session.loggedin) {
    db.all("SELECT * FROM users", [], (err, row) => {
      if (err) throw err;
      res.render("pages/dashboard", { titulo: "DASHBOARD", dados: row, req: req });
    });
  } else {
    console.log("Tentativa de acesso a àrea restrita");
    res.redirect("/");
  }
});

app.use('*', (req, res) => {
  // Envia uma resposta de erro 404
  res.status(404).render('pages/fail', { titulo: "ERRO 404", req: req, msg: "404" });
});

// app.listen() deve ser o último comando da aplicação (app.js)
app.listen(PORT, () => {
  console.log(`Servidor sendo executado na porta ${PORT}!`);
});
