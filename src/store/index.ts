import atomForConfig from './atomForConfig'
import { reviewInfoAtom } from './reviewInfoAtom'
import type { wordBookListType, wordBookRow } from '@/api/type/WordBookType'
import { DISMISS_START_CARD_DATE_KEY, defaultFontSizeConfig } from '@/constants'
import { idDictionaryMap } from '@/resources/dictionary'
import { correctSoundResources, keySoundResources, wrongSoundResources } from '@/resources/soundResource'
import type {
  Dictionary,
  DictionaryResource,
  InfoPanelState,
  LoopWordTimesOption,
  PhoneticType,
  PronunciationType,
  WordDictationOpenBy,
  WordDictationType,
} from '@/typings'
import type { ReviewRecord } from '@/utils/db/record'
import { atom } from 'jotai'
import { atomWithDefault, atomWithStorage } from 'jotai/utils'

export const currentDictIdAtom = atomWithStorage('currentDict', 'cet4')
export const needLogin = atomWithDefault(() => {
  return false
})

// 需要刷新单词本数据
export const refreshWordBookAtom = atomWithDefault(() => {
  return false
})

// 需要刷新单词本描述
export const refreshWordBookDescAtom = atomWithDefault(() => {
  return false
})

// 默认选中的单词本
export const defaultWordBookIdAtom = atomWithStorage('defaultWordBookId', '')

// Gallery页面当前选中的词典分类名
export const currentTabName = atomWithDefault(() => {
  return 'en'
})

// 当前字典信息
export const currentDictInfoAtom = atom<Dictionary>((get) => {
  const id = get(currentDictIdAtom)
  // get方法用于获取store里存储的数据值
  const existsInRemote = get(existsInRemoteData)
  let dict = idDictionaryMap[id]
  const remoteClassifiedData = localStorage.getItem('remoteClassifiedData')
  // 本地词典中未找到且远程字典中包含了数据，则获取远程的字典数据
  if (!dict && existsInRemote && remoteClassifiedData) {
    const remoteDictList = JSON.parse(remoteClassifiedData)
    dict = remoteDictList.find((item: DictionaryResource) => item.id === id)
  }
  // 如果 dict和远程字典 都未找到，则返回 cet4. Typing 中会检查 DictId 是否存在，如果不存在则会重置为 cet4
  if (!dict && !existsInRemote) {
    dict = idDictionaryMap.cet4
  }
  return dict
})

// 检查当前字典是否存在于远程字典中
export const existsInRemoteData = atom<boolean>((get) => {
  const id = get(currentDictIdAtom)
  const remoteClassifiedData = localStorage.getItem('remoteClassifiedData')
  let existsInRemoteData = false
  if (remoteClassifiedData) {
    const classifiedData: Array<DictionaryResource> = JSON.parse(remoteClassifiedData)
    for (let i = 0; i < classifiedData.length; i++) {
      if (classifiedData[i].id === id) {
        existsInRemoteData = true
        break
      }
    }
  }
  return existsInRemoteData
})

export const authInfoAtom = atomWithStorage('authInfo', { state: '', platformName: '' })

export const currentChapterAtom = atomWithStorage('currentChapter', 0)

export const loopWordConfigAtom = atomForConfig<{ times: LoopWordTimesOption }>('loopWordConfig', {
  times: 1,
})

export const keySoundsConfigAtom = atomForConfig('keySoundsConfig', {
  isOpen: true,
  isOpenClickSound: true,
  volume: 1,
  resource: keySoundResources[0],
})

export const hintSoundsConfigAtom = atomForConfig('hintSoundsConfig', {
  isOpen: true,
  volume: 1,
  isOpenWrongSound: true,
  isOpenCorrectSound: true,
  wrongResource: wrongSoundResources[0],
  correctResource: correctSoundResources[0],
})

export const pronunciationConfigAtom = atomForConfig('pronunciation', {
  isOpen: true,
  volume: 1,
  type: 'us' as PronunciationType,
  name: '美音',
  isLoop: false,
  isTransRead: false,
  transVolume: 1,
  rate: 1,
})

export const fontSizeConfigAtom = atomForConfig('fontsize', defaultFontSizeConfig)

export const pronunciationIsOpenAtom = atom((get) => get(pronunciationConfigAtom).isOpen)

export const pronunciationIsTransReadAtom = atom((get) => get(pronunciationConfigAtom).isTransRead)

export const randomConfigAtom = atomForConfig('randomConfig', {
  isOpen: false,
})

export const isShowPrevAndNextWordAtom = atomWithStorage('isShowPrevAndNextWord', true)
export const wordBookListAtom = atomWithStorage<Array<wordBookRow>>('wordBookList', [])
export const wordBookListCountAtom = atomWithStorage('wordBookListCount', 0)

export const isIgnoreCaseAtom = atomWithStorage('isIgnoreCase', true)

export const isShowAnswerOnHoverAtom = atomWithStorage('isShowAnswerOnHover', true)

export const isTextSelectableAtom = atomWithStorage('isTextSelectable', false)

export const reviewModeInfoAtom = reviewInfoAtom({
  isReviewMode: false,
  reviewRecord: undefined as ReviewRecord | undefined,
})
export const isReviewModeAtom = atom((get) => get(reviewModeInfoAtom).isReviewMode)

export const phoneticConfigAtom = atomForConfig('phoneticConfig', {
  isOpen: true,
  type: 'us' as PhoneticType,
})

export const isOpenDarkModeAtom = atomWithStorage('isOpenDarkModeAtom', window.matchMedia('(prefers-color-scheme: dark)').matches)

export const isShowSkipAtom = atom(false)

export const isInDevModeAtom = atom(false)

export const infoPanelStateAtom = atom<InfoPanelState>({
  donate: false,
  vsc: false,
  community: false,
  redBook: false,
})

export const wordDictationConfigAtom = atomForConfig('wordDictationConfig', {
  isOpen: false,
  type: 'hideAll' as WordDictationType,
  openBy: 'auto' as WordDictationOpenBy,
})

export const dismissStartCardDateAtom = atomWithStorage<Date | null>(DISMISS_START_CARD_DATE_KEY, null)

// for dev test
//   dismissStartCardDateAtom = atom<Date | null>(new Date())
