import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'

export interface GameData {
  'Название': string
  'Режим'?: string
  'Теги'?: string
  'Дата релиза'?: string | number
  'Есть демо'?: string
  'Постер'?: string
  'Ссылка в Стим'?: string
  'Примечание'?: string
  'Геймплей'?: string
  [key: string]: any
}

const GOOGLE_SHEETS_BASE_URL = import.meta.env.DEV
  ? '/google-sheets'
  : 'https://docs.google.com'

function formatSheetDate(value: string | number | undefined) {
  if (typeof value !== 'number') {
    return value
  }

  const parsedDate = XLSX.SSF.parse_date_code(value)

  if (!parsedDate) {
    return value
  }

  const month = String(parsedDate.m).padStart(2, '0')
  const day = String(parsedDate.d).padStart(2, '0')

  return `${parsedDate.y}-${month}-${day}`
}

function normalizeGameData(game: GameData): GameData {
  return {
    ...game,
    'Дата релиза': formatSheetDate(game['Дата релиза']),
  }
}

export function useSheetData(sheetId: string) {
  const [data, setData] = useState<GameData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSheetData() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `${GOOGLE_SHEETS_BASE_URL}/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&headers=1&t=${new Date().getTime()}`,
        )

        if (!response.ok) {
          throw new Error(`Failed to load sheet: ${response.status}`)
        }

        const csv = await response.text()
        const workbook = XLSX.read(csv, { type: 'string' })
        const firstSheetName = workbook.SheetNames[0]
        const firstSheet = workbook.Sheets[firstSheetName]
        const rows = XLSX.utils.sheet_to_json<GameData>(firstSheet).map(normalizeGameData)

        setData(rows)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sheet data')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    if (sheetId) {
      loadSheetData()
    } else {
      setData([])
      setLoading(false)
      setError(null)
    }
  }, [sheetId])

  return { data, loading, error }
}
