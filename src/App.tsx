import { useState } from 'react'
import styles from './App.module.css'
import { type GameData, useSheetData } from './useSheetData'

const SHEET_ID = '1-avpp_CsCeV0jCAy0cAg3uFDwuZ_4m4t4PCim36Jjes'

function isDemoAvailable(value: unknown) {
  const normalizedValue = String(value ?? '').trim().toLowerCase()

  return ['да', 'true', 'истина', '1'].includes(normalizedValue)
}

function App() {
  const { data, loading, error } = useSheetData(SHEET_ID)
  const [menuGame, setMenuGame] = useState<GameData | null>(null)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })

  function openMenu(event: React.MouseEvent<HTMLDivElement>, game: GameData) {
    event.stopPropagation()
    setMenuGame(game)
    setMenuPosition({ x: event.clientX, y: event.clientY })
  }

  function openLink(url: unknown) {
    const link = typeof url === 'string' ? url.trim() : ''

    if (!link) {
      return
    }

    window.open(link, '_blank', 'noopener,noreferrer')
    setMenuGame(null)
  }

  if (loading) {
    return <div className={styles.container}>Загрузка...</div>
  }

  if (error) {
    return <div className={styles.container}>Ошибка: {error}</div>
  }

  return (
    <div className={styles.container} onClick={() => setMenuGame(null)}>
      <div className={styles.grid}>
        {data.map((game, index) => {
          const poster = game['Постер']
          const hasPoster = typeof poster === 'string' && poster.trim() !== ''
          const demoAvailable = isDemoAvailable(game['Есть демо'])

          return (
            <div
              className={styles.card}
              key={`${game['Название'] || 'game'}-${index}`}
              onClick={(event) => openMenu(event, game)}
            >
              {hasPoster ? (
                <img className={styles.poster} src={poster} alt={game['Название']} />
              ) : (
                <div className={styles.noPoster}>{game['Название']}</div>
              )}

              <div className={styles.overlay}>
                <h2 className={styles.title}>{game['Название']}</h2>
                {game['Режим'] && <p className={styles.detail}>Режим: {game['Режим']}</p>}
                {game['Теги'] && <p className={styles.detail}>Теги: {game['Теги']}</p>}
                {game['Дата релиза'] && (
                  <p className={styles.detail}>Дата релиза: {game['Дата релиза']}</p>
                )}
                <p className={demoAvailable ? styles.demo : styles.noDemo}>
                  {demoAvailable ? 'Демо доступно' : 'Демо недоступно'}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {menuGame && (
        <div
          className={styles.contextMenu}
          style={{ left: menuPosition.x, top: menuPosition.y }}
          onClick={(event) => event.stopPropagation()}
          onMouseLeave={() => setMenuGame(null)}
        >
          <button
            className={styles.menuItem}
            disabled={!String(menuGame['Ссылка в Стим'] ?? '').trim()}
            type="button"
            onClick={() => openLink(menuGame['Ссылка в Стим'])}
          >
            Стим
          </button>
          <button
            className={styles.menuItem}
            disabled={!String(menuGame['Геймплей'] ?? '').trim()}
            type="button"
            onClick={() => openLink(menuGame['Геймплей'])}
          >
            Геймплей
          </button>
        </div>
      )}
    </div>
  )
}

export default App
