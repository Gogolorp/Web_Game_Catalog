import { useEffect, useRef, useState } from 'react'
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
  const [activeCardKey, setActiveCardKey] = useState<string | null>(null)
  const longPressTimerRef = useRef<number | null>(null)
  const pointerStartRef = useRef({ x: 0, y: 0 })

  function closeMenu() {
    setMenuGame(null)
    setActiveCardKey(null)
  }

  useEffect(() => {
    window.addEventListener('scroll', closeMenu, true)

    return () => window.removeEventListener('scroll', closeMenu, true)
  }, [])

  function getMenuPosition(clientX: number, clientY: number) {
    return {
      x: Math.max(8, Math.min(clientX, window.innerWidth - 184)),
      y: Math.max(8, Math.min(clientY, window.innerHeight - 128)),
    }
  }

  function clearLongPressTimer() {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  function openMenu(clientX: number, clientY: number, game: GameData, cardKey: string) {
    setMenuGame(game)
    setActiveCardKey(cardKey)
    setMenuPosition(getMenuPosition(clientX, clientY))
  }

  function handlePointerDown(
    event: React.PointerEvent<HTMLDivElement>,
    game: GameData,
    cardKey: string,
  ) {
    event.stopPropagation()
    pointerStartRef.current = { x: event.clientX, y: event.clientY }

    if (event.pointerType === 'mouse') {
      openMenu(event.clientX, event.clientY, game, cardKey)
      return
    }

    clearLongPressTimer()
    longPressTimerRef.current = window.setTimeout(() => {
      openMenu(event.clientX, event.clientY, game, cardKey)
      longPressTimerRef.current = null
    }, 1000)
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const deltaX = Math.abs(event.clientX - pointerStartRef.current.x)
    const deltaY = Math.abs(event.clientY - pointerStartRef.current.y)

    if (deltaX > 10 || deltaY > 10) {
      clearLongPressTimer()
    }
  }

  function openLink(url: unknown) {
    const link = typeof url === 'string' ? url.trim() : ''

    if (!link) {
      return
    }

    window.open(link, '_blank', 'noopener,noreferrer')
    closeMenu()
  }

  if (loading) {
    return <div className={styles.container}>Загрузка...</div>
  }

  if (error) {
    return <div className={styles.container}>Ошибка: {error}</div>
  }

  return (
    <div className={styles.container} onClick={closeMenu}>
      <div className={styles.grid}>
        {data.map((game, index) => {
          const cardKey = `${game['Название'] || 'game'}-${index}`
          const poster = game['Постер']
          const hasPoster = typeof poster === 'string' && poster.trim() !== ''
          const demoAvailable = isDemoAvailable(game['Есть демо'])

          return (
            <div
              className={`${styles.card} ${activeCardKey === cardKey ? styles.cardActive : ''}`}
              key={cardKey}
              onClick={(event) => event.stopPropagation()}
              onContextMenu={(event) => event.preventDefault()}
              onPointerCancel={clearLongPressTimer}
              onPointerDown={(event) => handlePointerDown(event, game, cardKey)}
              onPointerMove={handlePointerMove}
              onPointerUp={clearLongPressTimer}
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
          onMouseLeave={closeMenu}
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
