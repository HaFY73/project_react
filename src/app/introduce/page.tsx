'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { PenTool } from 'lucide-react'
import styles from './style.module.css'
import QuestionBlock from './components/QuestionBlock'
import Sidebar from './components/Sidebar'
import SavePanel from './components/SavePanel'
import { CoverLetterResponse } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

interface Question {
  id: string
  title: string
  content: string
}

export default function IntroducePage() {
  const { userId, isLoading } = useAuth()

  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState<Question[]>([{ id: '1', title: '', content: '' }])
  const [showQuestionHeaders, setShowQuestionHeaders] = useState(false)
  const [currentCoverLetterId, setCurrentCoverLetterId] = useState<number | undefined>()

  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  const addQuestion = useCallback(() => {
    const newId = (questions.length + 1).toString()
    setQuestions(prev => [...prev, { id: newId, title: '', content: '' }])
    setTimeout(() => {
      const element = document.getElementById(`question-${questions.length + 1}`)
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }, [questions])

  const removeLastQuestion = useCallback(() => {
    if (questions.length > 1) {
      setQuestions(prev => prev.slice(0, -1))
      setTimeout(() => {
        const element = document.getElementById(`question-${questions.length - 1}`)
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }, [questions])

  const updateQuestion = useCallback((id: string, field: 'title' | 'content', value: string) => {
    setQuestions(prev => prev.map(q => (q.id === id ? { ...q, [field]: value } : q)))
  }, [])

  const scrollToQuestion = useCallback((index: number) => {
    const element = document.getElementById(`question-${index}`)
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  const handleToggleChange = useCallback((checked: boolean) => {
    if (checked && questions.length > 1) {
      setShowQuestionHeaders(true)
    } else if (!checked && questions.length > 1) {
      if (confirm('첫 문항만 남기고 나머지를 삭제합니다. 계속할까요?')) {
        setQuestions([questions[0]])
        setShowQuestionHeaders(false)
      }
    } else {
      setShowQuestionHeaders(checked)
    }
  }, [questions])

  const handleLoadCoverLetter = useCallback((coverLetter: CoverLetterResponse) => {
    setTitle(coverLetter.title)
    setCurrentCoverLetterId(coverLetter.id)
    const loadedQuestions = coverLetter.questions.length
        ? coverLetter.questions.map((q, i) => ({ id: (i + 1).toString(), title: q.title || '', content: q.content || '' }))
        : [{ id: '1', title: '', content: '' }]
    setQuestions(loadedQuestions)
    setShowQuestionHeaders(loadedQuestions.length === 1)
  }, [])

  const resetForm = useCallback(() => {
    setTitle('')
    setQuestions([{ id: '1', title: '', content: '' }])
    setCurrentCoverLetterId(undefined)
  }, [])

  if (isLoading) return <div>로딩 중...</div>
  if (!userId) return null

  return (
      <div className={styles.pageContainer}>
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className={`${styles.pageHeaderInline} flex items-center justify-between`}
        >
          <div>
            <h1 className={styles.pageTitle}>
              <PenTool className={styles.titleIcon} />
              자소서 작성
            </h1>
            <p className={styles.pageDescription}>나만의 특별한 자기소개서를 작성해보세요</p>
          </div>

          <SavePanel
              title={title}
              questions={questions}
              currentCoverLetterId={currentCoverLetterId}
              onLoad={handleLoadCoverLetter}
              showQuestionHeaders={showQuestionHeaders}
          />
        </motion.div>

        <div className={styles.mainLayout}>
          <Sidebar
              questionCount={questions.length}
              onAddQuestion={addQuestion}
              onRemoveQuestion={removeLastQuestion}
              onScrollToQuestion={scrollToQuestion}
              visible={!showQuestionHeaders}
          />

          <div className={`${styles.resume} hover:shadow-lg transition-shadow duration-200`}>
            <input
                type="text"
                className={styles.titleInput}
                placeholder="자기소개서 제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <div className={styles.toggleContainer}>
              <label className={styles.toggleLabel}>
                <input
                    type="checkbox"
                    checked={showQuestionHeaders}
                    onChange={(e) => handleToggleChange(e.target.checked)}
                />
                <span className={styles.toggleSlider}></span>
              </label>
              <span className={styles.toggleText}>
              ⓘ 문항별 제목 ON/OFF
            </span>
            </div>

            <div className={styles.questionContainer}>
              {questions.map((question, index) => (
                  <QuestionBlock
                      key={question.id}
                      id={question.id}
                      index={index + 1}
                      title={question.title}
                      content={question.content}
                      showHeader={showQuestionHeaders}
                      isFirstQuestion={index === 0}
                      onUpdateTitle={(val) => updateQuestion(question.id, 'title', val)}
                      onUpdateContent={(val) => updateQuestion(question.id, 'content', val)}
                  />
              ))}
            </div>
          </div>
        </div>
      </div>
  )
}
