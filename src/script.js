const searchInput = document.querySelector(".search-input");
const menuBtn = document.querySelector(".menu-btn");
const sideMenu = document.getElementById("sideMenu");
const overlay = document.getElementById("pageOverlay");
const form = document.querySelector(".cadastro-form");
const container = document.querySelector(".grid");

function openMenu() {
  sideMenu.classList.add("open");
  overlay.classList.add("show");
}

function closeMenu() {
  sideMenu.classList.remove("open");
  overlay.classList.remove("show");
}

menuBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  sideMenu.classList.contains("open") ? closeMenu() : openMenu();
});

document.addEventListener("click", (e) => {
  if (sideMenu.classList.contains("open") && !sideMenu.contains(e.target) && !menuBtn.contains(e.target)) {
    closeMenu();
  }
});

overlay.addEventListener("click", closeMenu);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

let materiasCarregadas = [];

async function carregarMaterias() {
  try {
    const resposta = await fetch("/api/materias");
    if (!resposta.ok) throw new Error("Erro ao buscar matérias");
    materiasCarregadas = await resposta.json();
    renderizarMaterias(materiasCarregadas);
  } catch (erro) {
    console.error("❌ Erro ao carregar matérias:", erro);
  }
}

function renderizarMaterias(materias) {
  if (!container) return;
  container.innerHTML = "";

  materias.forEach((m) => {
    const card = document.createElement("div");
    card.classList.add("card");
    const imagemSrc = m.imagem ? m.imagem : 'https://cdn-icons-png.flaticon.com/512/8832/8832880.png';
    card.innerHTML = `
      <img src="${imagemSrc}" alt="${m.nome}">
      <p>${m.nome}</p>
    `;

    // Botão de excluir
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Excluir";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", async () => {
      if (confirm(`Tem certeza que deseja excluir a matéria "${m.nome}"?`)) {
        try {
          const resposta = await fetch(`/api/materias/${m.id_materia}`, { method: "DELETE" });
          if (!resposta.ok) throw new Error("Erro ao excluir matéria");
          alert(`Matéria "${m.nome}" excluída com sucesso!`);
          carregarMaterias();
        } catch (erro) {
          console.error(erro);
          alert("Erro ao excluir matéria. Verifique o console.");
        }
      }
    });

    card.appendChild(deleteBtn);
    container.appendChild(card);
  });

  const addCard = document.createElement("div");
  addCard.classList.add("card", "add-card-materia");
  addCard.innerHTML = "<span>+</span>";
  addCard.onclick = () => window.location.href = "cadastro_materia.html";
  container.appendChild(addCard);
}

async function adicionarMateria(e) {
  e.preventDefault();
  const nomeMateria = document.querySelector('#nomeMateria').value;
  const imagemMateria = document.querySelector('#imagemMateria').files[0];

  if (!nomeMateria || !imagemMateria) {
    alert("Preencha todos os campos!");
    return;
  }

  const formData = new FormData();
  formData.append("nome", nomeMateria);
  formData.append("imagem", imagemMateria);

  try {
    const resposta = await fetch("/api/materias", {
      method: "POST",
      body: formData
    });
    if (!resposta.ok) throw new Error("Erro ao adicionar matéria");
    const novaMateria = await resposta.json();
    alert(`Matéria "${novaMateria.nome}" adicionada com sucesso!`);
    carregarMaterias();
    form.reset();
  } catch (erro) {
    console.error("❌ Erro ao adicionar matéria:", erro);
    alert("Erro ao adicionar matéria. Verifique o console.");
  }
}

searchInput.addEventListener("input", () => {
  const termo = searchInput.value.toLowerCase();
  const filtradas = materiasCarregadas.filter(m => m.nome.toLowerCase().includes(termo));
  renderizarMaterias(filtradas);
});

if (form) form.addEventListener("submit", adicionarMateria);

window.addEventListener("DOMContentLoaded", carregarMaterias);
