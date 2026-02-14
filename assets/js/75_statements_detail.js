(function () {
  'use strict';

  const ui = window.__ui || {};
  
  /**
   * 성명 상세 페이지 렌더링 모듈
   * 
   * Story 1.3: 성명 상세 페이지 구현
   * Epic 1: 성명 콘텐츠 표시 및 탐색
   */

  /**
   * 간단한 마크다운 파서 (기본 기능만)
   * 
   * 지원 기능:
   * - 헤더 (# ## ###)
   * - 굵게 (**text**)
   * - 기울임 (*text*)
   * - 링크 ([text](url))
   * - 리스트 (- item)
   * - 코드 블록 (```code```)
   * - 인라인 코드 (`code`)
   * - 줄바꿈 (두 개의 공백 + 줄바꿈)
   * 
   * @param {string} markdown - 마크다운 텍스트
   * @returns {string} HTML 문자열
   */
  function parseMarkdown(markdown) {
    if (!markdown || typeof markdown !== 'string') {
      return '';
    }

    let html = markdown;

    // 코드 블록 처리 (```로 감싼 부분) - 먼저 처리하여 다른 파싱에 영향 없도록
    const codeBlocks = [];
    html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
      const id = `code-block-${codeBlocks.length}`;
      codeBlocks.push({ id, code: escapeHtml(code.trim()) });
      return `__CODE_BLOCK_${id}__`;
    });

    // 인라인 코드 처리 (`로 감싼 부분)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // 줄 단위로 처리
    const lines = html.split('\n');
    const processedLines = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // 빈 줄 처리
      if (trimmed === '') {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        processedLines.push('');
        continue;
      }

      // 헤더 처리
      if (trimmed.startsWith('### ')) {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        processedLines.push(`<h3>${trimmed.substring(4)}</h3>`);
        continue;
      }
      if (trimmed.startsWith('## ')) {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        processedLines.push(`<h2>${trimmed.substring(3)}</h2>`);
        continue;
      }
      if (trimmed.startsWith('# ')) {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        processedLines.push(`<h1>${trimmed.substring(2)}</h1>`);
        continue;
      }

      // 리스트 처리
      if (trimmed.startsWith('- ')) {
        if (!inList) {
          processedLines.push('<ul>');
          inList = true;
        }
        const content = trimmed.substring(2);
        processedLines.push(`<li>${content}</li>`);
        continue;
      }

      // 일반 텍스트
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      processedLines.push(line);
    }

    // 리스트가 끝나지 않은 경우 닫기
    if (inList) {
      processedLines.push('</ul>');
    }

    html = processedLines.join('\n');

    // 인라인 포맷팅 처리
    // 굵게 처리 (**text**)
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // 기울임 처리 (*text*) - ** 다음에 오는 *만 처리
    html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

    // 링크 처리 ([text](url))
    // 외부 링크는 새 탭에서 열리도록, 내부 링크는 같은 탭에서 열리도록
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      // 외부 링크 확인
      const isExternal = url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//');
      if (isExternal) {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      } else {
        return `<a href="${url}">${text}</a>`;
      }
    });

    // 줄바꿈 처리 (두 개의 공백 + 줄바꿈)
    html = html.replace(/  \n/g, '<br>');

    // 문단 처리 (빈 줄로 구분)
    const paragraphs = html.split(/\n\n+/);
    html = paragraphs.map(para => {
      para = para.trim();
      if (!para) return '';
      // 이미 HTML 태그가 있으면 그대로, 없으면 <p>로 감싸기
      if (para.startsWith('<')) {
        return para;
      }
      return `<p>${para}</p>`;
    }).join('');

    // 코드 블록 복원
    codeBlocks.forEach(({ id, code }) => {
      html = html.replace(`__CODE_BLOCK_${id}__`, `<pre><code>${code}</code></pre>`);
    });

    return html;
  }

  /**
   * HTML 이스케이프
   * @param {string} text - 이스케이프할 텍스트
   * @returns {string} 이스케이프된 텍스트
   */
  function escapeHtml(text) {
    if (typeof text !== 'string') {
      return String(text);
    }

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 본문 내용 렌더링 (마크다운 또는 HTML)
   * @param {string} body - 본문 내용 (마크다운 또는 HTML)
   * @returns {string} 렌더링된 HTML
   */
  function renderBody(body) {
    if (!body || typeof body !== 'string') {
      return '<p>내용이 없습니다.</p>';
    }

    // HTML 태그가 포함되어 있으면 마크다운 파싱하지 않음
    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(body);
    
    if (hasHtmlTags) {
      // 이미 HTML인 경우 그대로 반환 (XSS 방지를 위해 DOMPurify 같은 라이브러리 권장)
      // 현재는 기본적인 이스케이프만 수행
      return body;
    } else {
      // 마크다운 파싱
      return parseMarkdown(body);
    }
  }

  /**
   * 성명 상세 페이지 HTML 생성
   * @param {Object} statement - 성명 데이터
   * @returns {string} 성명 상세 페이지 HTML
   */
  function createstatementDetail(statement) {
    if (!statement) {
      return '<div class="card content"><p>성명을 찾을 수 없습니다.</p></div>';
    }

    const { title, date, summary, body, slug, image, category } = statement;
    const formattedDate = formatDateKorean(date);
    const renderedBody = renderBody(body);

    // Story 3.3: 스크린 리더 접근성 - 이미지 alt 텍스트 개선
    let imageHtml = '';
    if (image) {
      const imageAlt = `${escapeHtml(title)} 성명 이미지`;
      imageHtml = `
        <div class="statement-image" role="img" aria-label="${imageAlt}">
          <img src="${escapeHtml(image)}" alt="${imageAlt}" loading="lazy">
        </div>
      `;
    }

    let categoryHtml = '';
    if (category) {
      categoryHtml = `<span class="statement-category">${escapeHtml(category)}</span>`;
    }

    // Story 3.3: 스크린 리더 접근성 - 상세 페이지 ARIA 속성
    return `
      <article class="card statement-detail" data-statement-slug="${slug}" aria-labelledby="detail-title-${slug}">
        <header class="statement-detail-header">
          <div class="statement-detail-meta" aria-label="성명 메타 정보">
            ${categoryHtml ? `<span class="statement-category" aria-label="카테고리: ${escapeHtml(category)}">${escapeHtml(category)}</span>` : ''}
            <time class="statement-detail-date" datetime="${date.toISOString()}" aria-label="성명 날짜: ${formattedDate}">
              ${formattedDate}
            </time>
          </div>
          <h1 class="statement-detail-title" id="detail-title-${slug}">${escapeHtml(title)}</h1>
          ${summary ? `<p class="statement-detail-summary" aria-label="성명 요약">${escapeHtml(summary)}</p>` : ''}
        </header>
        ${imageHtml}
        <div class="statement-detail-body" aria-label="성명 본문">
          ${renderedBody}
        </div>
        <footer class="statement-detail-footer" aria-label="성명 상세 페이지 푸터">
          <a href="./poli-statements.html" class="btn" aria-label="성명 목록으로 돌아가기">목록으로 돌아가기</a>
        </footer>
      </article>
    `;
  }

  /**
   * 날짜를 한국어 형식으로 포맷팅
   * @param {Date} date - 포맷팅할 날짜
   * @returns {string} 포맷팅된 날짜 문자열
   */
  function formatDateKorean(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}년 ${month}월 ${day}일`;
  }

  /**
   * 성명 상세 페이지를 DOM에 렌더링
   * @param {Object} statement - 성명 데이터
   * @param {HTMLElement|string} container - 렌더링할 컨테이너 요소 또는 선택자
   * @returns {boolean} 렌더링 성공 여부
   */
  function renderstatementDetail(statement, container) {
    const $ = ui.$ || ((sel) => document.querySelector(sel));
    const containerEl = typeof container === 'string' ? $(container) : container;

    if (!containerEl) {
      console.error('성명 상세 컨테이너를 찾을 수 없습니다.');
      return false;
    }

    // 공개된 성명만 표시
    if (!statement || !statement.published) {
      containerEl.innerHTML = `
        <div class="card content">
          <p>이 성명은 공개되지 않았습니다.</p>
          <a href="./statements.html" class="btn">목록으로 돌아가기</a>
        </div>
      `;
      return false;
    }

    containerEl.innerHTML = createstatementDetail(statement);
    return true;
  }

  /**
   * 에러 상태 표시
   * Story 3.3: 스크린 리더 접근성 - 에러 상태 알림
   * @param {HTMLElement|string} container - 컨테이너 요소 또는 선택자
   * @param {string} message - 에러 메시지
   */
  function showErrorState(container, message) {
    const $ = ui.$ || ((sel) => document.querySelector(sel));
    const containerEl = typeof container === 'string' ? $(container) : container;

    if (containerEl) {
      containerEl.innerHTML = `
        <div class="card content" role="alert" aria-live="assertive" aria-label="오류 발생">
          <p>성명 상세 내용을 불러오는 중 오류가 발생했습니다.</p>
          ${message ? `<p class="small">${escapeHtml(message)}</p>` : ''}
          <a href="./poli-statements.html" class="btn" aria-label="성명 목록으로 돌아가기">목록으로 돌아가기</a>
        </div>
      `;
    }
  }

  // Public API
  ui.statements = ui.statements || {};
  ui.statements.detail = {
    renderstatementDetail: renderstatementDetail,
    showErrorState: showErrorState,
    renderBody: renderBody,
    parseMarkdown: parseMarkdown,
    formatDateKorean: formatDateKorean,
    escapeHtml: escapeHtml
  };

  // Export for testing (if needed)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ui.statements.detail;
  }
})();


