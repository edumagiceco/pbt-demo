<?php
require_once '../config/database.php';

try {
    $db = getDBConnection();
    
    echo "<h2>PBT LMS 테스트 데이터 삽입</h2>";
    
    // 테스트 사용자 데이터 삽입
    echo "<h3>사용자 데이터 삽입</h3>";
    
    // 관리자 계정
    $admin_password = password_hash('admin123', PASSWORD_DEFAULT);
    $stmt = $db->prepare("
        INSERT IGNORE INTO users (username, email, password, user_type, first_name, last_name, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ");
    
    $stmt->execute(['admin', 'admin@pbtlms.com', $admin_password, 'admin', '관리자', '김']);
    echo "✓ 관리자 계정 생성: admin@pbtlms.com / admin123<br>";
    
    // 강사 계정들
    $instructors = [
        ['instructor1', 'instructor1@pbtlms.com', '김강사', '선생님'],
        ['instructor2', 'instructor2@pbtlms.com', '박강사', '교수님'],
        ['instructor3', 'instructor3@pbtlms.com', '이강사', '박사님']
    ];
    
    foreach ($instructors as $instructor) {
        $password = password_hash('instructor123', PASSWORD_DEFAULT);
        $stmt->execute([$instructor[0], $instructor[1], $password, 'instructor', $instructor[2], $instructor[3]]);
        echo "✓ 강사 계정 생성: {$instructor[1]} / instructor123<br>";
    }
    
    // 학생 계정들
    $students = [
        ['student1', 'student1@pbtlms.com', '김학생', '1번'],
        ['student2', 'student2@pbtlms.com', '박학생', '2번'],
        ['student3', 'student3@pbtlms.com', '이학생', '3번'],
        ['student4', 'student4@pbtlms.com', '최학생', '4번'],
        ['student5', 'student5@pbtlms.com', '정학생', '5번'],
        ['student6', 'student6@pbtlms.com', '한학생', '6번'],
        ['student7', 'student7@pbtlms.com', '조학생', '7번'],
        ['student8', 'student8@pbtlms.com', '윤학생', '8번'],
        ['student9', 'student9@pbtlms.com', '장학생', '9번'],
        ['student10', 'student10@pbtlms.com', '임학생', '10번']
    ];
    
    foreach ($students as $student) {
        $password = password_hash('student123', PASSWORD_DEFAULT);
        $stmt->execute([$student[0], $student[1], $password, 'student', $student[2], $student[3]]);
        echo "✓ 학생 계정 생성: {$student[1]} / student123<br>";
    }
    
    // 테스트 프로젝트 데이터 삽입
    echo "<br><h3>프로젝트 데이터 삽입</h3>";
    
    // 강사 ID 조회
    $stmt = $db->prepare("SELECT id FROM users WHERE user_type = 'instructor' ORDER BY id LIMIT 3");
    $stmt->execute();
    $instructor_ids = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $projects = [
        [
            'title' => '웹 개발 프로젝트 - React & Node.js',
            'description' => '현대적인 웹 애플리케이션 개발을 위한 프로젝트입니다. React를 사용한 프론트엔드 개발과 Node.js를 사용한 백엔드 API 개발을 학습합니다. 팀 프로젝트로 진행되며, 실제 서비스 수준의 웹 애플리케이션을 개발하는 것이 목표입니다.',
            'instructor_id' => $instructor_ids[0],
            'start_date' => date('Y-m-d'),
            'end_date' => date('Y-m-d', strtotime('+60 days')),
            'max_participants' => 20,
            'status' => 'active'
        ],
        [
            'title' => '데이터 분석 프로젝트 - Python & ML',
            'description' => 'Python을 활용한 데이터 분석 및 머신러닝 프로젝트입니다. 실제 데이터를 사용하여 데이터 전처리, 시각화, 모델링까지 전 과정을 경험할 수 있습니다. Pandas, NumPy, Scikit-learn 등의 라이브러리를 사용합니다.',
            'instructor_id' => $instructor_ids[1],
            'start_date' => date('Y-m-d', strtotime('+7 days')),
            'end_date' => date('Y-m-d', strtotime('+45 days')),
            'max_participants' => 15,
            'status' => 'active'
        ],
        [
            'title' => '모바일 앱 개발 - React Native',
            'description' => 'React Native를 사용한 크로스 플랫폼 모바일 앱 개발 프로젝트입니다. iOS와 Android에서 동시에 작동하는 앱을 개발하며, 실제 앱스토어 배포까지 경험할 수 있습니다.',
            'instructor_id' => $instructor_ids[2],
            'start_date' => date('Y-m-d', strtotime('+14 days')),
            'end_date' => date('Y-m-d', strtotime('+90 days')),
            'max_participants' => 12,
            'status' => 'draft'
        ],
        [
            'title' => 'AI 챗봇 개발 프로젝트',
            'description' => '자연어 처리 기술을 활용한 AI 챗봇 개발 프로젝트입니다. 사용자와 자연스럽게 대화할 수 있는 챗봇을 만들어보며, 최신 AI 기술을 실무에 적용하는 방법을 학습합니다.',
            'instructor_id' => $instructor_ids[0],
            'start_date' => date('Y-m-d', strtotime('-10 days')),
            'end_date' => date('Y-m-d', strtotime('+20 days')),
            'max_participants' => 18,
            'status' => 'active'
        ],
        [
            'title' => '블록체인 DApp 개발',
            'description' => '이더리움 기반의 탈중앙화 애플리케이션(DApp) 개발 프로젝트입니다. Solidity를 사용한 스마트 컨트랙트 개발과 Web3를 사용한 프론트엔드 연동을 학습합니다.',
            'instructor_id' => $instructor_ids[1],
            'start_date' => date('Y-m-d', strtotime('-30 days')),
            'end_date' => date('Y-m-d', strtotime('-5 days')),
            'max_participants' => 10,
            'status' => 'completed'
        ]
    ];
    
    $stmt = $db->prepare("
        INSERT INTO projects (title, description, instructor_id, start_date, end_date, max_participants, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    
    foreach ($projects as $project) {
        $stmt->execute([
            $project['title'],
            $project['description'],
            $project['instructor_id'],
            $project['start_date'],
            $project['end_date'],
            $project['max_participants'],
            $project['status']
        ]);
        echo "✓ 프로젝트 생성: {$project['title']}<br>";
    }
    
    // 프로젝트 참여자 데이터 삽입
    echo "<br><h3>프로젝트 참여자 데이터 삽입</h3>";
    
    // 학생 ID 조회
    $stmt = $db->prepare("SELECT id FROM users WHERE user_type = 'student' ORDER BY id LIMIT 10");
    $stmt->execute();
    $student_ids = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // 프로젝트 ID 조회
    $stmt = $db->prepare("SELECT id FROM projects ORDER BY id");
    $stmt->execute();
    $project_ids = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $stmt = $db->prepare("
        INSERT INTO project_participants (project_id, user_id, status, joined_at)
        VALUES (?, ?, ?, NOW())
    ");
    
    // 첫 번째 프로젝트에 학생들 참여
    if (isset($project_ids[0])) {
        for ($i = 0; $i < 8; $i++) {
            if (isset($student_ids[$i])) {
                $status = $i < 6 ? 'approved' : 'pending';
                $stmt->execute([$project_ids[0], $student_ids[$i], $status]);
                echo "✓ 학생 {$student_ids[$i]}가 프로젝트 {$project_ids[0]}에 {$status} 상태로 참여<br>";
            }
        }
    }
    
    // 두 번째 프로젝트에 학생들 참여
    if (isset($project_ids[1])) {
        for ($i = 2; $i < 7; $i++) {
            if (isset($student_ids[$i])) {
                $status = $i < 5 ? 'approved' : 'pending';
                $stmt->execute([$project_ids[1], $student_ids[$i], $status]);
                echo "✓ 학생 {$student_ids[$i]}가 프로젝트 {$project_ids[1]}에 {$status} 상태로 참여<br>";
            }
        }
    }
    
    // 과제 데이터 삽입
    echo "<br><h3>과제 데이터 삽입</h3>";
    
    $assignments = [
        [
            'project_id' => $project_ids[0] ?? 1,
            'title' => '프로젝트 기획서 작성',
            'description' => '개발할 웹 애플리케이션의 기획서를 작성하세요.',
            'instructions' => '1. 프로젝트 개요\n2. 기능 명세\n3. 기술 스택\n4. 개발 일정\n5. 팀 역할 분담',
            'due_date' => date('Y-m-d H:i:s', strtotime('+7 days')),
            'max_score' => 100
        ],
        [
            'project_id' => $project_ids[0] ?? 1,
            'title' => '프론트엔드 UI 설계',
            'description' => 'React를 사용한 사용자 인터페이스를 설계하고 구현하세요.',
            'instructions' => '1. 와이어프레임 작성\n2. 컴포넌트 구조 설계\n3. 기본 UI 구현\n4. 반응형 디자인 적용',
            'due_date' => date('Y-m-d H:i:s', strtotime('+14 days')),
            'max_score' => 100
        ],
        [
            'project_id' => $project_ids[1] ?? 2,
            'title' => '데이터 수집 및 전처리',
            'description' => '분석할 데이터를 수집하고 전처리 과정을 수행하세요.',
            'instructions' => '1. 데이터 소스 선정\n2. 데이터 수집\n3. 결측치 처리\n4. 이상치 제거\n5. 데이터 정규화',
            'due_date' => date('Y-m-d H:i:s', strtotime('+10 days')),
            'max_score' => 100
        ]
    ];
    
    $stmt = $db->prepare("
        INSERT INTO assignments (project_id, title, description, instructions, due_date, max_score, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    
    foreach ($assignments as $assignment) {
        $stmt->execute([
            $assignment['project_id'],
            $assignment['title'],
            $assignment['description'],
            $assignment['instructions'],
            $assignment['due_date'],
            $assignment['max_score'],
            $instructor_ids[0] ?? 1
        ]);
        echo "✓ 과제 생성: {$assignment['title']}<br>";
    }
    
    echo "<br><h2>✅ 모든 테스트 데이터가 성공적으로 삽입되었습니다!</h2>";
    echo "<hr>";
    echo "<h3>테스트 계정 정보</h3>";
    echo "<strong>관리자:</strong> admin@pbtlms.com / admin123<br>";
    echo "<strong>강사:</strong> instructor1@pbtlms.com / instructor123<br>";
    echo "<strong>학생:</strong> student1@pbtlms.com / student123<br>";
    echo "<br>";
    echo "<a href='../index.php' class='btn btn-primary'>메인 페이지로 이동</a>";
    
} catch (PDOException $e) {
    echo "오류: " . $e->getMessage();
}
?>

<style>
body { 
    font-family: Arial, sans-serif; 
    margin: 20px; 
    background-color: #f8f9fa;
}
h2, h3 { 
    color: #333; 
}
.btn {
    display: inline-block;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    margin-top: 20px;
}
.btn:hover {
    background-color: #0056b3;
}
</style>
