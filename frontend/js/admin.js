async function carregarDados() {
    const listaEmpresas = document.getElementById('lista-empresas');
    const listaParceiros = document.getElementById('lista-parceiros');

    const empresas = await fetch('http://localhost:3000/api/admin/empresas').then(res => res.json());
    const parceiros = await fetch('http://localhost:3000/api/admin/parceiros').then(res => res.json());

    listaEmpresas.innerHTML = empresas.map(e => `<li>Usuário: ${e.usuario}</li>`).join('');
    listaParceiros.innerHTML = parceiros.map(p => `<li>Usuário: ${p.usuario}</li>`).join('');
}

carregarDados();
