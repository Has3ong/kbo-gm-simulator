import { create } from 'zustand'

export interface TeamMeta {
  tmId: number
  tmKrNm: string
  tmShrtEngNm: string | null
  emblemCd: string | null
  ciClr: string | null
}

interface TeamMetaState {
  metas: TeamMeta[]
  loaded: boolean
  setMetas: (teams: TeamMeta[]) => void
  getCiClr: (tmShrtEngNm: string | null | undefined) => string | undefined
  getEmblemPath: (tmShrtEngNm: string | null | undefined) => string | null
  getByTmId: (tmId: number | null | undefined) => TeamMeta | undefined
}

export const useTeamMetaStore = create<TeamMetaState>((set, get) => ({
  metas: [],
  loaded: false,

  setMetas: (teams) =>
    set({
      metas: teams.map((t) => ({
        tmId: t.tmId,
        tmKrNm: t.tmKrNm,
        tmShrtEngNm: t.tmShrtEngNm,
        emblemCd: t.emblemCd,
        ciClr: t.ciClr,
      })),
      loaded: true,
    }),

  getCiClr: (tmShrtEngNm) => {
    if (!tmShrtEngNm) return undefined
    return get().metas.find((m) => m.tmShrtEngNm === tmShrtEngNm)?.ciClr ?? undefined
  },

  getEmblemPath: (tmShrtEngNm) => {
    if (!tmShrtEngNm) return null
    const meta = get().metas.find((m) => m.tmShrtEngNm === tmShrtEngNm)
    return meta?.emblemCd ? `/img/logo/${meta.emblemCd}` : null
  },

  getByTmId: (tmId) => {
    if (tmId == null) return undefined
    return get().metas.find((m) => m.tmId === tmId)
  },
}))
