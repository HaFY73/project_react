'use client';

import { useState, useEffect } from 'react';
import styles from '../style.module.css';
import { CoverLetterResponse, apiClient } from '@/lib/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

interface Question {
  id: string;
  title: string;
  content: string;
}

interface SavePanelProps {
  title: string;
  questions: Question[];
  currentCoverLetterId?: number;
  onLoad?: (coverLetter: CoverLetterResponse) => void;
}

export default function SavePanel({ title, questions, currentCoverLetterId, onLoad }: SavePanelProps) {
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [coverLetters, setCoverLetters] = useState<CoverLetterResponse[]>([]);

  // 사용자 인증 확인
  const checkAuth = () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('로그인이 필요합니다.');
      window.location.href = '/login';
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (showLoadModal) {
      loadCoverLetters();
    }
  }, [showLoadModal]);

  const loadCoverLetters = async () => {
    if (!checkAuth()) return;

    try {
      setIsLoading(true);
      const letters = await apiClient.getCoverLetters();
      setCoverLetters(letters);
    } catch (error: any) {
      console.error('Failed to load cover letters:', error);
      if (error.message === '로그인이 필요합니다.') {
        window.location.href = '/login';
      } else {
        alert('자기소개서 목록을 불러오는데 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveCoverLetter = async (isDraft: boolean) => {
    if (!checkAuth()) return;

    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    const requestData = {
      title,
      isDraft,
      questions,
    };

    try {
      setIsLoading(true);
      if (currentCoverLetterId) {
        await apiClient.updateCoverLetter(currentCoverLetterId, requestData);
      } else {
        await apiClient.createCoverLetter(requestData);
      }
      alert(isDraft ? '중간 저장되었습니다.' : '최종 저장되었습니다.');
      if (!isDraft) {
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Save failed:', error);
      if (error.message === '로그인이 필요합니다.') {
        window.location.href = '/login';
      } else {
        alert('저장에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadCoverLetter = async (id: number) => {
    if (!checkAuth()) return;

    try {
      setIsLoading(true);
      const coverLetter = await apiClient.getCoverLetter(id);
      onLoad?.(coverLetter);
      setShowLoadModal(false);
      alert('자기소개서를 불러왔습니다.');
    } catch (error: any) {
      console.error('Load failed:', error);
      if (error.message === '로그인이 필요합니다.') {
        window.location.href = '/login';
      } else {
        alert('불러오기에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // PDF 생성용 HTML 컨텐츠 생성 (한글 폰트 지원)
  const createPdfContent = (): HTMLElement => {
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 794px;
      padding: 40px;
      background: white;
      font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      box-sizing: border-box;
    `;


    // 내용이 있는 질문들만 필터링

    const questionsWithContent = questions.filter(q => q.content.trim());

    container.innerHTML = `
      <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #2563eb; padding-bottom: 20px;">
        <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0; color: #1e40af; font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;">${title || '자기소개서'}</h1>
        <div style="font-size: 12px; color: #6b7280; font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;">작성일: ${new Date().toLocaleDateString('ko-KR')}</div>
      </div>
      
      ${questionsWithContent.map((question, index) => `
        <div style="margin-bottom: 35px; page-break-inside: avoid;">
          <div style="background-color: #2563eb; color: white; padding: 12px 16px; border-radius: 6px 6px 0 0; font-weight: bold; font-size: 16px; font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;">
            문항 ${index + 1}
          </div>
          
          ${question.title && question.title.trim() ? `
            <div style="background-color: #e0f2fe; padding: 10px 16px; border-left: 4px solid #0891b2; margin-bottom: 0px; font-weight: 600; color: #0c4a6e; font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;">
              ${question.title}
            </div>
          ` : ''}
          
          <div style="padding: 20px; border: 1px solid #e5e7eb; ${question.title && question.title.trim() ? 'border-top: none;' : ''} border-radius: 0 0 6px 6px; background-color: #ffffff; min-height: 100px; white-space: pre-wrap; word-wrap: break-word; font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; page-break-inside: auto;">
            ${question.content}
          </div>
        </div>
      `).join('')}
      
      <div style="height: 50px;"></div>
      
      <div style="text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 40px; font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;">
        이 문서는 자동으로 생성되었습니다.
      </div>
    `;

    return container;
  };

  // HTML2Canvas를 사용한 한글 지원 PDF 생성
  const handleExportPDF = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!checkAuth()) return;

    const hasContent = questions.some(q => q.content.trim());
    if (!hasContent) {
      alert('내용을 입력해주세요.');
      return;
    }

    try {
      setIsExporting(true);
      setShowExportOptions(false);

      // PDF 생성용 임시 HTML 요소 생성
      const pdfContent = createPdfContent();
      document.body.appendChild(pdfContent);

      // 잠시 대기하여 요소가 렌더링되도록 함
      await new Promise(resolve => setTimeout(resolve, 300));

      // HTML을 캔버스로 변환
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: pdfContent.scrollWidth,
        height: pdfContent.scrollHeight,
        logging: false,
        imageTimeout: 15000,
        removeContainer: true
      });

      // 임시 요소 제거
      document.body.removeChild(pdfContent);

      // 캔버스를 PDF로 변환
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // 첫 페이지 추가
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // 여러 페이지가 필요한 경우
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // PDF 다운로드
      const fileName = `${sanitizeFileName(title)}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('PDF 생성 실패:', error);
      alert('PDF 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWord = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!checkAuth()) return;

    const hasContent = questions.some(q => q.content.trim());
    if (!hasContent) {
      alert('내용을 입력해주세요.');
      return;
    }

    try {
      setIsExporting(true);
      setShowExportOptions(false);

      // Word 문서 생성
      const doc = new Document({
        styles: {
          default: {
            document: {
              run: {
                font: 'Malgun Gothic'
              }
            }
          }
        },
        sections: [
          {
            children: [
              // 제목
              new Paragraph({
                children: [
                  new TextRun({
                    text: title || '자기소개서',
                    bold: true,
                    size: 32,
                    font: 'Malgun Gothic',
                    color: '1e40af'
                  })
                ],
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
              }),

              // 작성일
              new Paragraph({
                children: [
                  new TextRun({
                    text: `작성일: ${new Date().toLocaleDateString('ko-KR')}`,
                    size: 20,
                    font: 'Malgun Gothic',
                    color: '6b7280'
                  })
                ],
                alignment: AlignmentType.RIGHT,
                spacing: { after: 600 }
              }),

              // 구분선
              new Paragraph({
                children: [
                  new TextRun({
                    text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    size: 16,
                    color: '2563eb',
                    font: 'Malgun Gothic'
                  })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
              }),

              // 질문들 (내용이 있는 것만)
              ...questions
                  .filter(q => q.content.trim())
                  .flatMap((question, index) => [
                    // 문항 번호
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `문항 ${index + 1}`,
                          bold: true,
                          size: 24,
                          font: 'Malgun Gothic',
                          color: '2563eb'
                        })
                      ],
                      spacing: { before: 400, after: 200 }
                    }),

                    // 질문 제목 (있는 경우)
                    ...(question.title && question.title.trim() ? [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: question.title,
                            bold: true,
                            size: 22,
                            font: 'Malgun Gothic',
                            color: '0c4a6e'
                          })
                        ],
                        spacing: { after: 200 }
                      })
                    ] : []),

                    // 질문 내용
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: question.content,
                          size: 20,
                          font: 'Malgun Gothic'
                        })
                      ],
                      spacing: { after: 400 }
                    })
                  ]),

              // 하단 정보
              new Paragraph({
                children: [
                  new TextRun({
                    text: '이 문서는 자동으로 생성되었습니다.',
                    size: 16,
                    font: 'Malgun Gothic',
                    color: '9ca3af'
                  })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 800 }
              })
            ]
          }
        ]
      });

      // Word 문서를 Blob으로 변환
      const blob = await Packer.toBlob(doc);

      // 파일 다운로드
      const fileName = `${sanitizeFileName(title)}.docx`;
      saveAs(blob, fileName);

    } catch (error) {
      console.error('Word 생성 실패:', error);
      alert('Word 문서 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsExporting(false);
    }
  };

  const sanitizeFileName = (fileName: string): string => {
    if (!fileName || fileName.trim() === '') {
      return '자기소개서';
    }
    return fileName.replace(/[\\/:*?"<>|]/g, '_').trim();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const canExport = title.trim() && questions.some(q => q.content.trim()) && !isExporting;

  return (
      <>
        <div className={styles.saveSidebar}>
          <button className={styles.loadTrigger} onClick={() => setShowLoadModal(true)}>
            불러오기
          </button>

          <div className={styles.saveButtons}>
            <button className={styles.saveMenuBtn} onClick={() => saveCoverLetter(true)} disabled={isLoading}>
              {isLoading ? '저장 중...' : '중간 저장'}
            </button>
            <button className={styles.saveMenuBtn} onClick={() => saveCoverLetter(false)} disabled={isLoading}>
              {isLoading ? '저장 중...' : '최종 저장'}
            </button>
          </div>

          <div className={styles.exportLinkWrapper}>
          <span
              className={`${styles.exportLink} ${!canExport ? styles.disabled : ''}`}
              onClick={() => {
                if (canExport) {
                  setShowExportOptions(!showExportOptions);
                } else if (!title.trim()) {
                  alert('제목을 입력해주세요.');
                } else if (!questions.some(q => q.content.trim())) {
                  alert('내용을 입력해주세요.');
                }
              }}
          >
            {isExporting ? '생성 중...' : '내보내기⬇'}
          </span>
            {showExportOptions && canExport && (
                <div className={styles.exportOptions}>
                  <button
                      onClick={handleExportPDF}
                      disabled={isExporting}
                  >
                    {isExporting ? '생성 중...' : 'PDF로 저장'}
                  </button>
                  <button
                      onClick={handleExportWord}
                      disabled={isExporting}
                  >
                    {isExporting ? '생성 중...' : 'Word로 저장'}
                  </button>
                </div>
            )}
          </div>
        </div>

        {showLoadModal && (
            <div className={styles.modal} onClick={() => setShowLoadModal(false)}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>작성한 자기소개서 불러오기</h2>

                {isLoading ? (
                    <p className={styles.loading}>불러오는 중...</p>
                ) : coverLetters.length === 0 ? (
                    <p className={styles.emptyList}>저장된 자기소개서가 없습니다.</p>
                ) : (
                    <ul className={styles.loadList}>
                      {coverLetters.map((coverLetter) => (
                          <li key={coverLetter.id} className={styles.loadItem}>
                            <div>
                              <div className={styles.loadTitle}>
                                {coverLetter.title}
                                {coverLetter.isDraft && <span className={styles.draftBadge}> (임시저장)</span>}
                              </div>
                              <div className={styles.loadMeta}>
                                작성일: {formatDate(coverLetter.createdAt)} | 수정일: {formatDate(coverLetter.updatedAt)}
                              </div>
                            </div>
                            <button className={styles.loadBtn} onClick={() => handleLoadCoverLetter(coverLetter.id)}>
                              불러오기
                            </button>
                          </li>
                      ))}
                    </ul>
                )}

                <button className={styles.closeBtn} onClick={() => setShowLoadModal(false)}>
                  닫기
                </button>
              </div>
            </div>
        )}
      </>
  );
}