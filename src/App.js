import React, { useState, useEffect } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import Select from 'react-select'
import Axios from 'axios'
import './App.css'
import mondaySdk from 'monday-sdk-js'

const monday = mondaySdk()

const App = () => {
  const [settings, _setSettings] = useState({})
  const [name, _setName] = useState('')
  const [originalText, _setOriginalText] = useState('')
  const [translationText, _setTranslationText] = useState('')
  const [languages, _setLanguages] = useState([])
  const [originalLanguage, _setOriginalLanguage] = useState('')
  const [translationLanguage, _setTranslationLanguage] = useState('')
  const [loading, _setLoading] = useState(false)
  const [error, _setError] = useState(false)

  const handleOriginalText = e => _setOriginalText(e.target.value)

  const handleOriginalLanguageSelection = e => _setOriginalLanguage(e.value)

  const handleTranslationLanguageSelection = e => _setTranslationLanguage(e.value)

  // handle errors
  useEffect(() => {
    _setError(false)
  }, [originalLanguage, translationLanguage])

  // request must be fixed
  const handleOnClick = () => {
    const payload = { text: originalText }

    if (!originalLanguage) return _setError('Please select an original language')
    if (!translationLanguage) return _setError('Please select a translation language')

    Axios.post('https://translate.dev.jakubroman.com/api/text/translate', payload)
      .then(({ data }) => _setTranslationText(data?.translations?.[0]))
      .catch(err => console.error(err))
  }

  const autoDetectLanguage = async () => {
    const payload = { text: originalText }

    _setLoading(true)

    await Axios.post('https://translate.dev.jakubroman.com/api/text/detect-language', payload)
      .then(({ data }) => _setOriginalLanguage(data?.detections?.[0].language))
      .then(() => _setLoading(false))
      .catch(err => console.error(err))
  }

  // Auto-detect language, check is request pending/should occur/ as enough text to auto-detect
  useEffect(() => {
    if (!loading && !originalLanguage && originalText.length > 4) {
      autoDetectLanguage()
    }
  }, [originalText])

  // Fetch language list
  useEffect(() => {
    Axios.get('https://translate.dev.jakubroman.com/api/languages')
      .then(({ data }) => {
        return data?.languages?.map(language => {
          return {
            value: language.code,
            label: language.name,
          }
        })
      })
      .then(languages => _setLanguages(languages))
      .catch(err => console.error(err))
  }, [])

  return (
    <div className="t__translation-page">
      <section className="translation-page">
        <div className="o__original-text">
          <div className="original-language">
            <h3>Original Language</h3>
            <Select
              className="original-language-select"
              options={languages}
              value={languages.find(item => item.value === originalLanguage)}
              onChange={handleOriginalLanguageSelection}
            />
          </div>
          <TextareaAutosize minRows={5} onChange={handleOriginalText} />
        </div>

        <div className="o__translated-text">
          <div className="translation-language">
            <h3>Translation Language</h3>
            <Select
              className="translation-language-select"
              options={languages}
              onChange={handleTranslationLanguageSelection}
            />
          </div>
          <TextareaAutosize minRows={5} value={translationText} />
        </div>

        <div className="o__submit-button">
          <p className="error-message">{error}</p>
          <button type="button" onClick={handleOnClick}>
            Submit
          </button>
        </div>
      </section>
    </div>
  )
}

export default App
