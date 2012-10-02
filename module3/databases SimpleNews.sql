DROP DATABASE SimpleNews;
CREATE DATABASE SimpleNews;

USE SimpleNews;

CREATE TABLE accounts (
    id MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(20) NOT NULL,
    crypt_pass VARCHAR(100) NOT NULL,
    email_address VARCHAR(50) NOT NULL,
    admin ENUM('true','false') NOT NULL DEFAULT 'false',
    PRIMARY KEY (id)
) engine = INNODB DEFAULT character SET = utf8 COLLATE = utf8_general_ci;

CREATE TABLE categories (
    id MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    PRIMARY KEY (id)
) engine = INNODB DEFAULT character SET = utf8 COLLATE = utf8_general_ci;

CREATE TABLE stories (
    id MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    text TEXT NOT NULL,
    commit_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    account_id MEDIUMINT UNSIGNED NOT NULL,
    category_id MEDIUMINT UNSIGNED NOT NULL,
    PRIMARY KEY (id),
    FOREIGN key (account_id) REFERENCES accounts (id),
    FOREIGN key (category_id) REFERENCES categories (id)
) engine = INNODB DEFAULT character SET = utf8 COLLATE = utf8_general_ci;

CREATE TABLE comments (
    id MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    text TINYTEXT NOT NULL,
    commit_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    account_id MEDIUMINT UNSIGNED NOT NULL,
    story_id MEDIUMINT UNSIGNED NOT NULL,
    PRIMARY KEY (id),
    FOREIGN key (account_id) REFERENCES accounts (id),
    FOREIGN key (story_id) REFERENCES stories (id)
) engine = INNODB DEFAULT character SET = utf8 COLLATE = utf8_general_ci;

CREATE TABLE stories_likes (
    account_id MEDIUMINT UNSIGNED NOT NULL,
    story_id MEDIUMINT UNSIGNED NOT NULL,
    PRIMARY KEY (account_id, story_id),
    FOREIGN key (account_id) REFERENCES accounts (id),
    FOREIGN key (story_id) REFERENCES stories (id)
) engine = INNODB DEFAULT character SET = utf8 COLLATE = utf8_general_ci;

CREATE TABLE comments_likes (
    account_id MEDIUMINT UNSIGNED NOT NULL,
    comment_id MEDIUMINT UNSIGNED NOT NULL,
    PRIMARY KEY (account_id, comment_id),
    FOREIGN key (account_id) REFERENCES accounts (id),
    FOREIGN key (comment_id) REFERENCES comments (id)
) engine = INNODB DEFAULT character SET = utf8 COLLATE = utf8_general_ci;

