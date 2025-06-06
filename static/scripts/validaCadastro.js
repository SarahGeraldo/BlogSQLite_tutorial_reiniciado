console.log("JS CONECTADO!");

const formulario = document.getElementById("cadastroForm");
const nome = document.getElementById("nome");
const email = document.getElementById("email");
const senha = document.getElementById("senha");
const confirmarSenha = document.getElementById("confirmarSenha");
const celular = document.getElementById("celular");
const cpf = document.getElementById("cpf");
const rg = document.getElementById("rg");
const msgError = document.getElementsByClassName("msgError");

/* ------ FUNÇÃO PARA RENDERIZAR AS DIFERENTES MENSAGENS DE ERRO! ------ */
const createDisplayMsgError = (mensagem) => {
  msgError[0].textContent = mensagem;
};
/* --------------------------------------------------------------------- */

/* ---------------- FUNÇÃO PARA VERIFICAR O NOME ----------------------- */
const checkNome = () => {
  const nomeRegex = /^[A-Za-zÀ-ÿ\s]+$/;
  return nomeRegex.test(nome.value);
};
/* --------------------------------------------------------------------- */

/* ---------- FUNÇÃO PARA VERIFICAR O EMAIL --------------------- */
const checkEmail = (email) => {
  const partesEmail = email.split("@");

  if (
    (partesEmail.length === 2 &&
      partesEmail[1].toLowerCase() === "gmail.com") ||
    (partesEmail.length === 2 &&
      partesEmail[1].toLowerCase() === "outlook.com") ||
    (partesEmail.length === 2 && partesEmail[1].toLowerCase() === "hotmail.com")
  ) {
    return true;
  } else {
    return false;
  }
};
/* --------------------------------------------------------------------- */

/* ---------- FUNÇÃO PARA VERIFICAR IGUALDADE DAS SENHAS --------------- */
function checkPasswordMatch() {
  return senha.value === confirmarSenha.value ? true : false;
}
/* --------------------------------------------------------------------- */

/* ----------- FUNÇÃO PARA INSERIR MASCARA NO TELEFONE ----------------- */

function maskPhoneNumber(event) {
  let celular = event.target.value;

  if (/[A-Za-zÀ-ÿ]/.test(celular)) {
    createDisplayMsgError("O celular deve conter apenas números!");
  } else {
    createDisplayMsgError("");
  }

  celular = celular.replace(/\D/g, ""); // Remove os caracteres não numéricos

  if (celular.length > 11) {
    celular = celular.substring(0, 11);
  }

  if (celular.length > 2) {
    celular = `(${celular.substring(0, 2)}) ${celular.substring(2)}`;
  } else if (celular.length > 0) {
    celular = `(${celular}`;
  }

  if (celular.length > 10) {
    celular = celular.replace(/(\(\d{2}\)) (\d{5})(\d{1,4})/, "$1 $2-$3");
  }

  event.target.value = celular;
}
/* --------------------------------------------------------------------- */

/* ------------- FUNÇÃO PARA VERIFICAR FORÇA DA SENHA ------------------ */
function checkPasswordStrength(senha) {
  if (!/[a-z]/.test(senha)) {
    return "A senha deve ter pelo menos uma letra minúscula!";
  }
  if (!/[A-Z]/.test(senha)) {
    return "A senha deve ter pelo menos uma letra maiúscula!";
  }
  if (!/[\W_]/.test(senha)) {
    return "A senha deve ter pelo menos um caractere especial!";
  }
  if (!/\d/.test(senha)) {
    return "A senha deve ter pelo menos um número!";
  }
  if (senha.length < 8) {
    return "A senha deve ter pelo menos 8 caracteres!";
  }

  return null;
}
/* --------------------------------------------------------------------- */

/* ------------- FUNÇÃO PARA VERIFICAR E ENVIAR DADOS ------------------ */
async function fetchDatas(event) { // tornar função em async (assincrona) para usar o await
  event.preventDefault();
  createDisplayMsgError(""); // limpa mensagens de erro anteriores

  if (!checkNome) { // correção aqui: chamar função
    createDisplayMsgError(
      "O nome não pode conter números ou caracteres especiais!"
    );
    nome.focus();
    return;
  }

  if (!checkEmail(email.value)) {
    createDisplayMsgError( // correção aqui: mensagem apropriada
      "O e-mail digitado não é válido ou não é de um domínio permitido."
    );
    email.focus();
    return;
  }
  
  const senhaError = checkPasswordStrength(senha.value);
  if (senhaError) {
    createDisplayMsgError(senhaError);
    senha.focus();
    return;
  }

  if (!checkPasswordMatch()) {
    createDisplayMsgError("As senhas digitadas não coincidem!");
    confirmarSenha.focus();
    return;
  }


  // validação do celular (opcional, já que a máscara tenta corrigir)
  const celularLimpo = celular.value.replace(/\D/g, "");
  if (celular.value && (celularLimpo.length < 10 || celularLimpo.length > 11)) {
    createDisplayMsgError("O telefone deve conter apenas números");
    celular.focus();
    return;
  }

  const formData = {
    // "username": representa o nome de usuário inserido pelo usuário.
    /* ".trim()" é usado para remover quaisquer espaço em branco
    do início ou do fim da string do nome do usuário.
    */
   username: nome.value.trim(),

   email: email.value.trim(),

   /* importante: a senha não deve ser "trimmed" (não deve conter ".trim()")
   porque espaços no início ou no fim podem ser intencionais e parte da senha escolhida.
  */
   password: senha.value,

   // é importante enviar apenas os números para facilitar o processamento no backend.
   celular: celularLimpo,

   /* "replace(/\D/g, "")" é usado para remover todos os caracteres que não são dígitos
   garantindo que apenas os números do cpf sejam enviados.
   */
   cpf: cpf.value.replace(/\D/g, ""),

   rg: rg.value.replace(/\D/g, ""),
  };

  console.log("Dados a serem enviados: ", JSON.stringify(formData, null, 2));

  // ------ INÍCIO DA LÓGICA DE ENVIO ------

  try {
    const response = await fetch('/cadastro', {
      method: 'POST', // método HTTP
      headers: {
        'Content-Type': 'application/json', // indicando que estamos enviando JSON
        // 'Accept': 'application/json' // opcional, indica que esperamos JSON de volta
      },
      body: JSON.stringify(formData), // converte o objeto JavaScript para uma string JSON
    });

    if (response.ok) { // verifica se a resposta do servidor foi bem-sucedida (status 2xx)
      const result = await response.json(); // tenta parsear a resposta do servidor como JSON
      console.log('Sucesso:', result);
      formulario.reset(); // limpa o formulário após o sucesso
      alert('Cadastro realizado com sucesso! ' + (result.message || ''));
      window.location.href = "/login";
      // redireciona ou mostra mensagem de sucesso mais elaborada
    } else {
      // o servidor respondeu com um erro (status 4xx ou 5xx)
      const errorData = await response.json().catch(() => ({ message: 'Erro ao processar a resposta do servidor.' })); // tenta pegar a mensagem de erro do servidor
    }
  } catch (error) {
    // erro de rede ou algo impediu a requisição de ser completada
    console.error('erro de conexão. Tente novamente.');
  }

  // ------ FIM DA LÓGICA DE ENVIO ------
}
/* --------------------------------------------------------------------- */

formulario.addEventListener("submit", fetchDatas);

nome.addEventListener("input", () => {
  if (nome.value && !checkNome()) {
    createDisplayMsgError(
      "O nome não pode conter números ou caracteres especiais!"
    );
  } else {
    createDisplayMsgError("");
  }
});

email.addEventListener("input", () => {
  if (email.value && !checkEmail(email.value)) {
    createDisplayMsgError("O e-mail digitado não é valido!");
  } else {
    createDisplayMsgError("");
  }
});

senha.addEventListener("input", () => {
  if (senha.value && checkPasswordStrength(senha.value)) {
    createDisplayMsgError(checkPasswordStrength(senha.value));
  } else {
    createDisplayMsgError("");
  }
});

function checkPasswordStrength(senha) {
  if (!/[a-z]/.test(senha)) {
    return "A senha deve ter pelo menos uma letra minúscula!";
  }
  if (!/[A-Z]/.test(senha)) {
    return "A senha deve ter pelo menos uma letra maiúscula!";
  }
  if (!/[\W_]/.test(senha)) {
    return "A senha deve ter pelo menos um caractere especial!";
  }
  if (!/\d/.test(senha)) {
    return "A senha deve ter pelo menos um número!";
  }
  if (senha.length < 8) {
    return "A senha deve ter pelo menos 8 caracteres!";
  }

  return null;
}
