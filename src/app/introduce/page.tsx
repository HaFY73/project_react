'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { PenTool } from 'lucide-react';
import styles from './style.module.css';
import QuestionBlock from './components/QuestionBlock';
import Sidebar from './components/Sidebar';
import SavePanel from './components/SavePanel';
import { CoverLetterResponse } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface Question {
  id: string;
  title: string;
  content: string;
}

export default function IntroducePage() {
  const { userId, userName, isLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', title: '', content: '' },
  ]);
  const [showQuestionHeaders, setShowQuestionHeaders] = useState(true);
  const [currentCoverLetterId, setCurrentCoverLetterId] = useState<number | undefined>();

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const addQuestion = useCallback(() => {
    const newId = (questions.length + 1).toString();
    setQuestions(prev => [...prev, { id: newId, title: '', content: '' }]);

    setTimeout(() => {
      const element = document.getElementById(`question-${questions.length + 1}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, [questions.length]);

  const removeLastQuestion = useCallback(() => {
    if (questions.length > 1) {
      setQuestions(prev => prev.slice(0, -1));

      setTimeout(() => {
        const element = document.getElementById(`question-${questions.length - 1}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [questions.length]);

  const updateQuestion = useCallback((id: string, field: 'title' | 'content', value: string) => {
    setQuestions(prev =>
        prev.map(q => (q.id === id ? { ...q, [field]: value } : q))
    );
  }, []);

  const scrollToQuestion = useCallback((index: number) => {
    const element = document.getElementById(`question-${index}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handleToggleChange = useCallback((checked: boolean) => {
    setShowQuestionHeaders(checked);
  }, []);

  const handleLoadCoverLetter = useCallback((coverLetter: CoverLetterResponse) => {
    setTitle(coverLetter.title);
    setCurrentCoverLetterId(coverLetter.id);

    const loadedQuestions = coverLetter.questions.map((q, index) => ({
      id: (index + 1).toString(),
      title: q.title || '',
      content: q.content || '',
    }));

    if (loadedQuestions.length === 0) {
      loadedQuestions.push({ id: '1', title: '', content: '' });
    }

    setQuestions(loadedQuestions);
  }, []);

  const resetForm = useCallback(() => {
    setTitle('');
    setQuestions([{ id: '1', title: '', content: '' }]);
    setCurrentCoverLetterId(undefined);
  }, []);

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (!userId) {
    return null; // useAuth 훅에서 로그인 페이지로 리다이렉트 처리
  }

  return (
      <div className={styles.pageContainer}>
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className={styles.pageHeaderInline}
        >
          <div className={styles.pageTitleSection}>
            <h1 className={styles.pageTitle}>
              <PenTool className={styles.titleIcon} />
              자소서 작성
            </h1>
            <p className={styles.pageDescription}>
              나만의 특별한 자기소개서를 작성해보세요
            </p>
          </div>
        </motion.div>

        <div className={styles.resumePage}>
          <div className={styles.mainWrapper}>
            <div className={styles.mainLayout}>
              <Sidebar
                  questionCount={questions.length}
                  onAddQuestion={addQuestion}
                  onRemoveQuestion={removeLastQuestion}
                  onScrollToQuestion={scrollToQuestion}
                  visible={showQuestionHeaders}
              />

              <div className={styles.resume}>
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
                  <span className={styles.toggleText} title="ON: 문항별 제목 작성 가능 / OFF: 내용만 작성">
                  ⓘ
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
                          onUpdateTitle={(value) => updateQuestion(question.id, 'title', value)}
                          onUpdateContent={(value) => updateQuestion(question.id, 'content', value)}
                      />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <SavePanel
              title={title}
              questions={questions}
              currentCoverLetterId={currentCoverLetterId}
              onLoad={handleLoadCoverLetter}
          />
        </div>
      </div>
  );
}
