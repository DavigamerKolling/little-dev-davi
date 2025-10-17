window.addEventListener("DOMContentLoaded", async () => {
    try {
      const resposta = await fetch("/api/materias");
      
      if (!resposta.ok) {
        throw new Error("Falha na resposta do servidor");
      }
  
      const dados = await resposta.json();
  
      console.log("✅ Conectado ao backend com sucesso!");
      console.log("📚 Dados recebidos do servidor:", dados);
      
      const aviso = document.createElement("p");
      aviso.textContent = "Conectado ao servidor com sucesso!";
      aviso.style.textAlign = "center";
      aviso.style.color = "#008000";
      document.body.appendChild(aviso);
  
    } catch (erro) {
      console.error("❌ Erro ao conectar com o backend:", erro);
  
      const avisoErro = document.createElement("p");
      avisoErro.textContent = "Erro ao conectar com o servidor!";
      avisoErro.style.textAlign = "center";
      avisoErro.style.color = "#ff0000";
      document.body.appendChild(avisoErro);
    }
  });
  