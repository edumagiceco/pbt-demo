<?php
require_once '../config/database.php';

try {
    $db = getDBConnection();
    
    // 사용자 테이블
    $sql = "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        user_type ENUM('student', 'instructor', 'admin') NOT NULL DEFAULT 'student',
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        profile_image VARCHAR(255) DEFAULT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $db->exec($sql);
    echo "✓ users 테이블 생성됨<br>";

    // 프로젝트 테이블
    $sql = "CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        instructor_id INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        max_participants INT DEFAULT 20,
        status ENUM('draft', 'active', 'completed', 'archived') DEFAULT 'draft',
        thumbnail VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
    )";
    $db->exec($sql);
    echo "✓ projects 테이블 생성됨<br>";

    // 프로젝트 참여자 테이블
    $sql = "CREATE TABLE IF NOT EXISTS project_participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        role ENUM('participant', 'team_leader') DEFAULT 'participant',
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_participation (project_id, user_id)
    )";
    $db->exec($sql);
    echo "✓ project_participants 테이블 생성됨<br>";

    // 학습 자료 테이블
    $sql = "CREATE TABLE IF NOT EXISTS learning_materials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type ENUM('file', 'video', 'link') NOT NULL,
        file_path VARCHAR(500),
        file_size INT DEFAULT 0,
        mime_type VARCHAR(100),
        uploaded_by INT NOT NULL,
        download_count INT DEFAULT 0,
        is_public BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
    )";
    $db->exec($sql);
    echo "✓ learning_materials 테이블 생성됨<br>";

    // 과제 테이블
    $sql = "CREATE TABLE IF NOT EXISTS assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        instructions TEXT,
        due_date DATETIME NOT NULL,
        max_score INT DEFAULT 100,
        is_group_assignment BOOLEAN DEFAULT FALSE,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )";
    $db->exec($sql);
    echo "✓ assignments 테이블 생성됨<br>";

    // 과제 제출 테이블
    $sql = "CREATE TABLE IF NOT EXISTS submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assignment_id INT NOT NULL,
        user_id INT NOT NULL,
        title VARCHAR(255),
        content TEXT,
        file_path VARCHAR(500),
        score INT DEFAULT NULL,
        feedback TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        graded_at TIMESTAMP NULL,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";
    $db->exec($sql);
    echo "✓ submissions 테이블 생성됨<br>";
    
    // 게시판 테이블
    $sql = "CREATE TABLE IF NOT EXISTS boards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        type ENUM('notice', 'qna', 'discussion') DEFAULT 'discussion',
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        view_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";
    $db->exec($sql);
    echo "✓ boards 테이블 생성됨<br>";
    
    // 댓글 테이블
    $sql = "CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        board_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        parent_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
    )";
    $db->exec($sql);
    echo "✓ comments 테이블 생성됨<br>";

    echo "<br><strong>모든 기본 테이블이 성공적으로 생성되었습니다!</strong>";
    
} catch (PDOException $e) {
    echo "오류: " . $e->getMessage();
}
?>
