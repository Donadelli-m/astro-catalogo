
import { useState, useEffect } from 'react'
import './App.css'
import { entrarAnonimamente, db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

function App() {
  const [asteroides, setAsteroides] = useState([])
  const [nome, setNome] = useState('')
  const [classificacao, setClassificacao] = useState('Próximo da Terra')
  const [diametro, setDiametro] = useState('')
  const [dataAproximacao, setDataAproximacao] = useState('')
  const [busca, setBusca] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [asteroidesNASA, setAsteroidesNASA] = useState([])
  const [carregandoNASA, setCarregandoNASA] = useState(false)
  const [erroNASA, setErroNASA] = useState('')

  useEffect(() => {
    async function carregarAsteroides() {
      try {
        await entrarAnonimamente()

        const consulta = await getDocs(collection(db, "asteroides"))

        const lista = consulta.docs.map((documento) => ({
          id: documento.id,
          ...documento.data()
        }))

        setAsteroides(lista)

        console.log("Asteroides carregados com sucesso!")
      } catch (erro) {
        console.error("Erro ao carregar asteroides:", erro)
      }
    }

    carregarAsteroides()
  }, [])

  async function cadastrarAsteroide(event) {
    event.preventDefault()

    if (!nome.trim() || !diametro || !dataAproximacao) {
      setMensagem('Preencha todos os campos.')
      return
    }

    if (Number(diametro) <= 0) {
      setMensagem('O diâmetro deve ser maior que zero.')
      return
    }

    const dadosAsteroide = {
      nome: nome.trim(),
      classificacao,
      diametro: Number(diametro),
      dataAproximacao
    }

    try {
      if (editandoId) {
        await updateDoc(doc(db, "asteroides", editandoId), dadosAsteroide)

        setAsteroides((listaAtual) =>
          listaAtual.map((asteroide) =>
            asteroide.id === editandoId
              ? { ...asteroide, ...dadosAsteroide }
              : asteroide
          )
        )

        setMensagem('Asteroide atualizado com sucesso!')
        setEditandoId(null)

      } else {
        const documento = await addDoc(
          collection(db, "asteroides"),
          {
            ...dadosAsteroide,
            criadoEm: new Date()
          }
        )

        setAsteroides((listaAtual) => [
          ...listaAtual,
          { id: documento.id, ...dadosAsteroide }
        ])

        setMensagem('Asteroide cadastrado com sucesso!')
      }

      setNome('')
      setClassificacao('Próximo da Terra')
      setDiametro('')
      setDataAproximacao('')

    } catch (erro) {
      console.error("Erro ao salvar:", erro)
      setMensagem('Erro ao salvar asteroide no banco.')
    }
  }

  async function buscarAsteroidesNASA() {
    setCarregandoNASA(true)
    setErroNASA('')

    try {
      const hoje = new Date()
      const dataFinal = new Date()
      dataFinal.setDate(hoje.getDate() + 6)

      const formatarData = (data) => {
        const ano = data.getFullYear()
        const mes = String(data.getMonth() + 1).padStart(2, '0')
        const dia = String(data.getDate()).padStart(2, '0')
        return `${ano}-${mes}-${dia}`
      }

      const inicio = formatarData(hoje)
      const fim = formatarData(dataFinal)

      const chave = import.meta.env.VITE_NASA_API_KEY

      const resposta = await fetch(
        `https://api.nasa.gov/neo/rest/v1/feed?start_date=${inicio}&end_date=${fim}&api_key=${chave}`
      )

      if (!resposta.ok) {
        const detalhe = await resposta.text()
        throw new Error(`Erro ${resposta.status}: ${detalhe}`)
      }

      const dados = await resposta.json()
      const lista = Object.values(dados.near_earth_objects).flat()

      setAsteroidesNASA(lista)

    } catch (erro) {
      console.error('Erro na API NASA:', erro)
      setErroNASA(erro.message)
    } finally {
      setCarregandoNASA(false)
    }
  }

  async function excluirAsteroide(id) {
    try {
      await deleteDoc(doc(db, "asteroides", id))

      setAsteroides((listaAtual) =>
        listaAtual.filter((asteroide) => asteroide.id !== id)
      )

      setMensagem('Asteroide excluído com sucesso!')

    } catch (erro) {
      console.error("Erro ao excluir:", erro)
      setMensagem('Erro ao excluir asteroide.')
    }
  }

  const asteroidesFiltrados = asteroides.filter((asteroide) =>
    asteroide.nome.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="app">
      <aside className="sidebar">
        <h1 className="logo">✦ Astro<span>Catálogo</span></h1>

        <nav className="menu">
          <a className="menu-item active" href="#dashboard">
            ◈ Dashboard
          </a>
          <a className="menu-item" href="#catalogo">
            ◉ Catálogo
          </a>
          <a className="menu-item" href="#cadastro">
            ＋ Cadastrar asteroide
          </a>
        </nav>

        <div className="sidebar-footer">
          <span>OBSERVATÓRIO DIGITAL</span>
          <p>Explorando o universo, um asteroide por vez.</p>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <span className="eyebrow">CENTRO DE OBSERVAÇÃO</span>
            <h2>Visão geral</h2>
          </div>
          <span className="status">
            <span className="status-dot"></span>
            Sistema online
          </span>
        </header>

        <section className="welcome">
          <div>
            <span className="eyebrow">BEM-VINDO AO UNIVERSO</span>
            <h2>Conheça os vizinhos<br />do nosso planeta.</h2>
            <p>
              Explore, consulte e catalogue asteroides próximos da Terra.
            </p>
            <a href="#catalogo" className="primary-button">
              Explorar catálogo ↗
            </a>
          </div>

          <div className="planet" aria-hidden="true">
            <div className="planet-ring"></div>
            <div className="planet-core">✦</div>
          </div>
        </section>

        <section className="stats">
          <article className="stat-card">
            <span className="stat-icon">☄</span>
            <p>Asteroides cadastrados</p>
            <h3>{asteroides.length}</h3>
            <span className="stat-note">No seu catálogo</span>
          </article>

          <article className="stat-card">
            <span className="stat-icon">◎</span>
            <p>Fonte astronômica</p>
            <h3>NASA</h3>
            <span className="stat-note">NASA NeoWs integrada</span>
          </article>

          <article className="stat-card">
            <span className="stat-icon">⌖</span>
            <p>Objetos catalogados</p>
            <h3>{asteroidesFiltrados.length}</h3>
            <span className="stat-note">Resultados da pesquisa</span>
          </article>
        </section>

        <section className="catalog-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">DADOS EM TEMPO REAL</span>
              <h2>Explorar asteroides da NASA</h2>
            </div>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={buscarAsteroidesNASA}
            disabled={carregandoNASA}
          >
            {carregandoNASA ? 'Consultando NASA...' : '☄ Buscar asteroides'}
          </button>

          {erroNASA && <p className="form-message">{erroNASA}</p>}

          {asteroidesNASA.length > 0 && (
            <div className="asteroid-list">
              {asteroidesNASA.map((asteroide) => {
                const aproximacao = asteroide.close_approach_data[0]

                const diametro =
                  asteroide.estimated_diameter.kilometers.estimated_diameter_max

                const velocidade =
                  Number(aproximacao.relative_velocity.kilometers_per_hour)

                const distancia =
                  Number(aproximacao.miss_distance.kilometers)

                const data = aproximacao.close_approach_date

                return (
                  <article className="asteroid-card" key={asteroide.id}>
                    <div className="asteroid-symbol">☄</div>

                    <div className="asteroid-info">
                      <h3>{asteroide.name}</h3>

                      <span className="asteroid-tag">
                        {asteroide.is_potentially_hazardous_asteroid
                          ? 'Potencialmente perigoso'
                          : 'Próximo da Terra'}
                      </span>

                      <p>Diâmetro máximo: {diametro.toFixed(3)} km</p>

                      <p>
                        Velocidade: {velocidade.toLocaleString('pt-BR', {
                          maximumFractionDigits: 2
                        })} km/h
                      </p>

                      <p>
                        Distância: {distancia.toLocaleString('pt-BR', {
                          maximumFractionDigits: 0
                        })} km
                      </p>

                      <p>
                        Aproximação: {data.split('-').reverse().join('/')}
                      </p>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <section className="catalog-section" id="cadastro">
          <div className="section-heading">
            <div>
              <span className="eyebrow">NOVO REGISTRO</span>
              <h2>Cadastrar asteroide</h2>
            </div>
          </div>

          <form className="asteroid-form" onSubmit={cadastrarAsteroide}>
            <label>
              Nome do asteroide
              <input
                type="text"
                placeholder="Ex.: Apophis"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                required
              />
            </label>

            <label>
              Classificação
              <select
                value={classificacao}
                onChange={(event) => setClassificacao(event.target.value)}
              >
                <option>Próximo da Terra</option>
                <option>Potencialmente perigoso</option>
                <option>Outro</option>
              </select>
            </label>

            <label>
              Diâmetro estimado (km)
              <input
                type="number"
                min="0.001"
                step="any"
                placeholder="Ex.: 0.37"
                value={diametro}
                onChange={(event) => setDiametro(event.target.value)}
                required
              />
            </label>

            <label>
              Data de aproximação
              <input
                type="date"
                value={dataAproximacao}
                onChange={(event) => setDataAproximacao(event.target.value)}
                required
              />
            </label>

            <button className="primary-button form-button" type="submit">
              {editandoId ? 'Salvar alterações' : '+ Cadastrar asteroide'}
            </button>

            {mensagem && (
              <p className="form-message" role="status">
                {mensagem}
              </p>
            )}
          </form>
        </section>

        <section className="catalog-section" id="catalogo">
          <div className="section-heading">
            <div>
              <span className="eyebrow">EXPLORAÇÃO ESPACIAL</span>
              <h2>Seu catálogo</h2>
            </div>
          </div>

          <input
            className="search-input"
            type="search"
            placeholder="Pesquisar asteroide pelo nome..."
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />

          {asteroidesFiltrados.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">☄</div>
              <h3>
                {busca
                  ? 'Nenhum resultado encontrado'
                  : 'Seu universo começa aqui'}
              </h3>
              <p>
                {busca
                  ? 'Tente pesquisar usando outro nome.'
                  : 'Cadastre seu primeiro asteroide usando o formulário acima.'}
              </p>
            </div>
          ) : (
            <div className="asteroid-list">
              {asteroidesFiltrados.map((asteroide) => (
                <article className="asteroid-card" key={asteroide.id}>
                  <div className="asteroid-symbol">☄</div>

                  <div className="asteroid-info">
                    <h3>{asteroide.nome}</h3>
                    <span className="asteroid-tag">
                      {asteroide.classificacao}
                    </span>
                    <p>Diâmetro: {asteroide.diametro} km</p>
                    <p>
                      Aproximação:{' '}
                      {asteroide.dataAproximacao.split('-').reverse().join('/')}
                    </p>
                  </div>

                  <div className="card-actions">
                    <button
                      type="button"
                      className="edit-button"
                      onClick={() => {
                        setNome(asteroide.nome)
                        setClassificacao(asteroide.classificacao)
                        setDiametro(String(asteroide.diametro))
                        setDataAproximacao(asteroide.dataAproximacao)
                        setEditandoId(asteroide.id)
                      }}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => excluirAsteroide(asteroide.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="footer">
          AstroCatálogo · Dados astronômicos para exploração e estudo.
        </footer>
      </main>
    </div>
  )
}

export default App
