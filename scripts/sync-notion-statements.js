#!/usr/bin/env node
/**
 * 노션 데이터 동기화 스크립트 - 성명서용
 * 
 * Story 2.1: 노션 데이터 소스 연결 및 인증 설정
 * Story 2.2: 노션 데이터 가져오기 및 변환
 * 
 * GitHub Actions에서 실행되어 노션 데이터를 가져와 JSON 파일로 저장합니다.
 */

const fs = require('fs');
const path = require('path');
const NotionClient = require('./notion-client');
const { transformNotionPage } = require('./notion-transformer');

// 환경 변수 확인 (성명서 전용 API 키 우선, 없으면 공용 NOTION_API_KEY 사용)
const NOTION_API_KEY = process.env.NOTION_STATEMENTS_API_KEY || process.env.NOTION_API_KEY;
const NOTION_STATEMENTS_DATABASE_ID = process.env.NOTION_STATEMENTS_DATABASE_ID || process.env.NOTION_DATABASE_ID;

if (!NOTION_API_KEY) {
  console.error('ERROR: Notion API key is not set');
  console.error('Please set NOTION_STATEMENTS_API_KEY or NOTION_API_KEY in GitHub Secrets');
  process.exit(1);
}

if (!NOTION_STATEMENTS_DATABASE_ID) {
  console.error('ERROR: NOTION_STATEMENTS_DATABASE_ID environment variable is not set');
  console.error('Please set NOTION_STATEMENTS_DATABASE_ID in GitHub Secrets');
  console.error('(You can also use NOTION_DATABASE_ID if you want to use the same database)');
  process.exit(1);
}

/**
 * 노션 API를 사용하여 데이터베이스에서 성명 데이터 가져오기
 * 
 * Story 2.2: 노션 데이터 가져오기 및 변환
 * 
 * @returns {Promise<Array>} 성명 데이터 배열
 */
async function fetchNotionData() {
  try {
    console.log('Connecting to Notion API...');
    
    // 노션 클라이언트 생성
    const client = new NotionClient(NOTION_API_KEY);
    
    // 데이터베이스에서 모든 페이지 가져오기
    console.log(`Querying database: ${NOTION_STATEMENTS_DATABASE_ID.substring(0, 8)}...`);
    const pages = await client.queryDatabase(NOTION_STATEMENTS_DATABASE_ID);
    console.log(`Found ${pages.length} pages in database`);
    
    if (pages.length === 0) {
      // Story 2.5: 운영자 친화적인 안내 메시지
      console.log('\n⚠️  데이터베이스에서 페이지를 찾을 수 없습니다.');
      console.log('   다음을 확인해주세요:');
      console.log('   1. 노션 통합(Integration)이 데이터베이스에 연결되어 있는지 확인');
      console.log('   2. 데이터베이스에 최소 하나의 페이지가 있는지 확인');
      console.log('   3. GitHub Secrets의 NOTION_STATEMENTS_DATABASE_ID가 올바른지 확인');
      console.log('   4. 데이터베이스 URL에서 ID 확인: https://www.notion.so/.../{database_id}?v=...');
      console.log('');
    }
    
    // 각 페이지를 성명 데이터로 변환
    const statements = [];
    
    for (const page of pages) {
      try {
        // 페이지 속성 디버깅 (첫 번째 페이지만)
        if (pages.indexOf(page) === 0 && pages.length > 0) {
          console.log(`\n=== DEBUG: First page properties ===`);
          const propKeys = Object.keys(page.properties || {});
          console.log(`Property names (${propKeys.length}):`, propKeys);
          console.log(`Property details:`);
          propKeys.forEach(key => {
            const prop = page.properties[key];
            console.log(`  - "${key}": type=${prop.type || 'unknown'}`);
            if (prop.type === 'title' && prop.title) {
              console.log(`    value: "${prop.title.map(t => t.plain_text).join('')}"`);
            } else if (prop.type === 'date' && prop.date) {
              console.log(`    value: ${prop.date.start || 'null'}`);
            } else if (prop.type === 'rich_text' && prop.rich_text) {
              console.log(`    value: "${prop.rich_text.map(t => t.plain_text).join('')}"`);
            } else if (prop.type === 'status' && prop.status) {
              console.log(`    value: "${prop.status.name}"`);
            } else if (prop.type === 'select' && prop.select) {
              console.log(`    value: "${prop.select.name}"`);
            }
          });
          console.log(`=====================================\n`);
        }
        
        // 페이지 블록 가져오기 (본문 콘텐츠)
        console.log(`Fetching blocks for page: ${page.id.substring(0, 8)}...`);
        const blocks = await client.getPageBlocks(page.id);
        console.log(`  Found ${blocks.length} blocks`);
        
        // 페이지를 성명 데이터로 변환
        const statement = transformNotionPage(page, blocks);
        
        if (statement) {
          statements.push(statement);
          console.log(`✓ Transformed: ${statement.title}`);
        } else {
          // Story 2.5: 운영자 친화적인 에러 메시지
          console.log(`\n⚠️  성명이 건너뛰어졌습니다 (페이지 ID: ${page.id.substring(0, 8)}...)`);
          console.log(`   이유: 필수 필드(제목 또는 날짜)가 누락되었습니다.`);
          console.log(`   해결 방법:`);
          console.log(`   1. 노션 페이지에서 "제목" 필드가 있는지 확인하세요`);
          console.log(`   2. "날짜" 필드가 올바르게 설정되어 있는지 확인하세요`);
          console.log(`   3. 필드명이 "제목", "Title", "날짜", "Date" 중 하나인지 확인하세요`);
          
          // 디버깅: 속성 정보 출력
          if (page.properties) {
            const availableProps = Object.keys(page.properties);
            console.log(`   현재 페이지의 필드: ${availableProps.join(', ')}`);
            console.log(`   참고: 필드명은 대소문자와 공백을 무시하고 인식됩니다.`);
          }
          console.log(``);
        }
      } catch (error) {
        console.error(`ERROR: Failed to process page ${page.id.substring(0, 8)}:`, error.message);
        console.error(`  Stack: ${error.stack}`);
        // 개별 페이지 오류는 건너뛰고 계속 진행
      }
    }
    
    console.log(`Successfully transformed ${statements.length} statements`);
    return statements;
    
  } catch (error) {
    // Story 2.4: 에러 로깅 강화
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      type: 'NotionAPIError'
    };
    
    console.error('ERROR: Failed to fetch Notion data:', error.message);
    console.error('  Error details:', JSON.stringify(errorDetails, null, 2));
    
    // 폴백: 기존 데이터 파일이 있으면 사용
    const dataPath = path.join(__dirname, '..', 'data', 'statements.json');
    if (fs.existsSync(dataPath)) {
      try {
        const existingFile = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        // 새로운 형식 (메타데이터 포함) 또는 기존 형식 (배열) 지원, 항상 배열 반환
        const raw = existingFile.statements ?? existingFile;
        const existingData = Array.isArray(raw) ? raw : [];
        console.log(`WARNING: Using existing data file with ${existingData.length} statements as fallback`);
        return existingData;
      } catch (fallbackError) {
        console.error('ERROR: Failed to read fallback data file:', fallbackError.message);
      }
    }
    
    // 데이터가 없으면 빈 배열 반환
    console.log('WARNING: Returning empty array due to errors');
    return [];
  }
}

/**
 * 성명 데이터를 JSON 파일로 저장
 * Story 2.4: 에러 처리 및 폴백 메커니즘
 * 
 * @param {Array} statements - 성명 데이터 배열
 * @param {Object} [metadata] - 메타데이터 (마지막 업데이트 시각, 에러 정보 등)
 */
function saveStatementsData(statements, metadata = {}) {
  const dataDir = path.join(__dirname, '..', 'data');
  const dataPath = path.join(dataDir, 'statements.json');
  
  // data 디렉토리가 없으면 생성
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // 메타데이터와 함께 저장 (Story 2.4: 마지막 업데이트 시각, 에러 정보 포함)
  const dataToSave = {
    _metadata: {
      lastUpdated: metadata.lastUpdated || new Date().toISOString(),
      syncStatus: metadata.syncStatus || 'success',
      errorMessage: metadata.errorMessage || null,
      statementsCount: Array.isArray(statements) ? statements.length : 0,
      version: '1.0'
    },
    statements: Array.isArray(statements) ? statements : []
  };
  
  // JSON 파일로 저장
  fs.writeFileSync(
    dataPath,
    JSON.stringify(dataToSave, null, 2),
    'utf8'
  );
  
  console.log(`SUCCESS: Saved ${dataToSave.statements.length} statements to ${dataPath}`);
  if (metadata.syncStatus === 'partial' || metadata.syncStatus === 'error') {
    console.log(`WARNING: Sync completed with status: ${metadata.syncStatus}`);
    if (metadata.errorMessage) {
      console.log(`  Error: ${metadata.errorMessage}`);
    }
  }
}

/**
 * 메인 실행 함수
 * Story 2.4: 에러 처리 및 폴백 메커니즘
 */
async function main() {
  const startTime = new Date();
  let syncStatus = 'success';
  let errorMessage = null;
  let statements = [];
  
  try {
    console.log('Starting Notion sync for statements...');
    console.log(`NOTION_STATEMENTS_DATABASE_ID: ${NOTION_STATEMENTS_DATABASE_ID.substring(0, 8)}...`);
    
    // 노션에서 데이터 가져오기
    statements = await fetchNotionData();
    
    // 데이터 검증 (Story 2.4: 잘못된 형식 데이터 처리)
    if (!Array.isArray(statements)) {
      console.warn('WARNING: Statements data is not an array, converting...');
      statements = [];
      syncStatus = 'partial';
      errorMessage = 'Invalid data format: expected array';
    }
    
    // 빈 배열인 경우 경고
    if (statements.length === 0) {
      console.warn('WARNING: No statements found. This might indicate a problem.');
      syncStatus = 'partial';
      errorMessage = 'No statements found in database';
    }
    
  } catch (error) {
    // Story 2.4: 에러 처리 강화
    syncStatus = 'error';
    errorMessage = error.message;
    
    console.error('ERROR: Notion sync failed:', error.message);
    console.error('  Stack:', error.stack);
    
    // 폴백: 기존 데이터 파일 읽기 시도
    const dataPath = path.join(__dirname, '..', 'data', 'statements.json');
    if (fs.existsSync(dataPath)) {
      try {
        const existingFile = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        statements = existingFile.statements || existingFile;
        if (Array.isArray(statements) && statements.length > 0) {
          console.log(`INFO: Using ${statements.length} cached statements as fallback`);
          syncStatus = 'partial';
          errorMessage = `Sync failed, using cached data: ${error.message}`;
        }
      } catch (fallbackError) {
        console.error('ERROR: Failed to read fallback data:', fallbackError.message);
      }
    }
    
    // 완전 실패 시에도 빈 배열로 저장하여 페이지가 깨지지 않도록 함
    if (!Array.isArray(statements)) {
      statements = [];
    }
  } finally {
    // 0건일 때 기존 파일에 성명이 있으면 덮어쓰지 않음 (한 번 있던 성명이 사라지지 않도록)
    const dataPath = path.join(__dirname, '..', 'data', 'statements.json');
    if (statements.length === 0 && (syncStatus !== 'success' || errorMessage)) {
      if (fs.existsSync(dataPath)) {
        try {
          const existing = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
          const existingList = Array.isArray(existing.statements) ? existing.statements : (Array.isArray(existing) ? existing : []);
          if (existingList.length > 0) {
            console.log(`INFO: Keeping ${existingList.length} existing statements (sync returned 0)`);
            statements = existingList;
            if (syncStatus === 'success') syncStatus = 'partial';
            if (!errorMessage) errorMessage = 'No statements from Notion; kept previous data';
          }
        } catch (_) {}
      }
    }

    const metadata = {
      lastUpdated: new Date().toISOString(),
      syncStatus: syncStatus,
      errorMessage: errorMessage,
      syncDuration: new Date() - startTime
    };

    saveStatementsData(statements, metadata);
    
    if (syncStatus === 'success') {
      console.log('Notion sync completed successfully');
    } else if (syncStatus === 'partial') {
      console.log('Notion sync completed with warnings');
    } else {
      console.log('Notion sync failed, but fallback data saved');
      // 에러가 있어도 프로세스는 종료하지 않음 (폴백 데이터 저장 완료)
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { fetchNotionData, saveStatementsData };
