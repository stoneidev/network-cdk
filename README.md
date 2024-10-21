# Stonei CDK TypeScript 프로젝트

이 프로젝트는 AWS CDK를 사용하여 Stonei 서비스의 인프라를 정의하고 배포하기 위한 TypeScript 프로젝트입니다.

## 프로젝트 구조

- `bin/network.ts`: CDK 애플리케이션의 진입점
- `lib/`: 각 스택 정의 파일들이 위치
  - `network-stack.ts`: VPC 및 서브넷 구성
  - `ec2-stack.ts`: EC2 인스턴스 및 보안 그룹 구성
  - `rds-stack.ts`: RDS Aurora PostgreSQL 클러스터 구성
- `config/`: 설정 파일들이 위치
  - `app-config.ts`: 애플리케이션 전반적인 설정
  - `network-config.ts`: 네트워크 관련 설정
  - `ec2-config.ts`: EC2 관련 설정

## 스택 설명

1. NetworkStack
   - VPC 생성
   - 퍼블릭, 프라이빗, 격리 서브넷 구성
   - 인터넷 게이트웨이 및 NAT 게이트웨이 설정

2. EC2Stack
   - 배스천 호스트용 EC2 인스턴스 생성
   - 보안 그룹 설정

3. RDSStack
   - Aurora PostgreSQL 클러스터 생성
   - 데이터베이스 보안 그룹 설정

## 주요 기능

1. VPC 생성: 퍼블릭, 프라이빗, 격리 서브넷 포함
2. EC2 인스턴스 생성: 퍼블릭 서브넷에 배스천 호스트로 사용
3. RDS Aurora PostgreSQL 클러스터 생성: 격리 서브넷에 위치

## 사전 요구 사항

- Node.js (v14.x 이상)
- AWS CLI 구성 및 인증 정보 설정
- AWS CDK CLI 설치: `npm install -g aws-cdk`

## 설치 및 사용법

1. 프로젝트 클론:
   ```
   git clone <repository-url>
   cd <project-directory>
   ```

2. 의존성 설치:
   ```
   npm install
   ```

3. CDK 부트스트랩 (최초 1회):
   ```
   cdk bootstrap
   ```

4. 설정 파일 수정:
   - `config/app-config.ts`: 서비스 이름 및 환경 설정
   - `config/network-config.ts`: VPC CIDR 및 서브넷 설정
   - `config/ec2-config.ts`: EC2 접근 허용 IP 설정

5. CDK 스택 배포:
   - 모든 스택 배포:
     ```
     cdk deploy --all
     ```
   - 특정 스택만 배포:
     ```
     cdk deploy NetworkStack
     cdk deploy EC2Stack
     cdk deploy RDSStack
     ```
   - 여러 스택 동시 배포:
     ```
     cdk deploy NetworkStack EC2Stack
     ```

## 유용한 명령어

- `npm run build`: TypeScript 코드를 JavaScript로 컴파일
- `npm run watch`: 파일 변경 감지 및 자동 컴파일
- `npm run test`: Jest를 사용한 단위 테스트 실행
- `cdk deploy`: 스택을 AWS 계정/리전에 배포
- `cdk diff`: 배포된 스택과 현재 상태 비교
- `cdk synth`: CloudFormation 템플릿 생성

## 보안 주의사항

- `ec2-config.ts`의 `myIp` 값을 실제 사용 환경에 맞게 설정하세요.
- 프로덕션 환경에서는 보안 강화를 위해 추가적인 설정이 필요할 수 있습니다.

## 문제 해결

문제가 발생하면 다음을 확인하세요:
1. AWS 인증 정보가 올바르게 설정되었는지 확인
2. 리전 설정이 올바른지 확인
3. VPC CIDR 및 서브넷 CIDR이 겹치지 않는지 확인

## 기여 방법

1. 이 저장소를 포크합니다.
2. 새 브랜치를 생성합니다: `git checkout -b feature/AmazingFeature`
3. 변경사항을 커밋합니다: `git commit -m 'Add some AmazingFeature'`
4. 브랜치에 푸시합니다: `git push origin feature/AmazingFeature`
5. Pull Request를 생성합니다.
