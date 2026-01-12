/**
 * 노션 API 클라이언트
 * 
 * Story 2.2: 노션 데이터 가져오기 및 변환
 * 
 * 노션 API v1을 사용하여 데이터베이스에서 데이터를 가져옵니다.
 */

const https = require('https');

/**
 * 노션 API 클라이언트
 */
class NotionClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.notion.com/v1';
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    };
  }

  /**
   * HTTP 요청 실행
   * @param {string} method - HTTP 메서드
   * @param {string} path - API 경로
   * @param {Object} [data] - 요청 본문 데이터
   * @returns {Promise<Object>} 응답 데이터
   */
  async request(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: method,
        headers: this.headers
      };

      const req = https.request(options, (res) => {
        let body = '';

        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(body));
            } catch (error) {
              reject(new Error(`Failed to parse response: ${error.message}`));
            }
          } else {
            reject(new Error(`API request failed: ${res.statusCode} ${res.statusMessage}\n${body}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  /**
   * 데이터베이스에서 모든 페이지 가져오기
   * @param {string} databaseId - 데이터베이스 ID
   * @returns {Promise<Array>} 페이지 배열
   */
  async queryDatabase(databaseId) {
    // 데이터베이스 ID 검증
    if (!databaseId || typeof databaseId !== 'string') {
      throw new Error('Database ID is required and must be a string');
    }
    
    const cleanId = databaseId.trim().replace(/-/g, '');
    if (cleanId.length !== 32) {
      throw new Error(`Invalid database ID: expected 32 characters, got ${cleanId.length} (value: ${databaseId.substring(0, 20)}...)`);
    }
    
    const allPages = [];
    let hasMore = true;
    let startCursor = null;

    while (hasMore) {
      const requestBody = {};
      if (startCursor) {
        requestBody.start_cursor = startCursor;
      }

      // 하이픈 제거한 ID 사용 (Notion API는 하이픈 있음/없음 모두 허용하지만 일관성 유지)
      const apiPath = `/databases/${cleanId}/query`;
      console.log(`Making request to: POST ${apiPath}`);
      
      const response = await this.request('POST', apiPath, requestBody);
      
      allPages.push(...response.results);
      hasMore = response.has_more;
      startCursor = response.next_cursor;
    }

    return allPages;
  }

  /**
   * 페이지의 블록 콘텐츠 가져오기
   * @param {string} pageId - 페이지 ID
   * @returns {Promise<Array>} 블록 배열
   */
  async getPageBlocks(pageId) {
    const allBlocks = [];
    let hasMore = true;
    let startCursor = null;

    while (hasMore) {
      const path = `/blocks/${pageId}/children${startCursor ? `?start_cursor=${startCursor}` : ''}`;
      const response = await this.request('GET', path);
      
      allBlocks.push(...response.results);
      hasMore = response.has_more;
      startCursor = response.next_cursor;
    }

    return allBlocks;
  }
}

module.exports = NotionClient;

