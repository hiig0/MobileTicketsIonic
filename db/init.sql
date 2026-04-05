CREATE DATABASE IF NOT EXISTS tickets_db;
USE tickets_db;

CREATE TABLE IF NOT EXISTS tickets (
  id CHAR(36) NOT NULL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  type ENUM('SP', 'SG', 'SE') NOT NULL,
  sequence INT NOT NULL,
  status ENUM('EMITIDA', 'ATENDIDA', 'DESCARTADA') NOT NULL,
  issued_at DATETIME NOT NULL,
  attended_at DATETIME NULL,
  guiche VARCHAR(60) NULL,
  service_minutes INT NULL,
  INDEX idx_tickets_issued_at (issued_at),
  INDEX idx_tickets_type_status (type, status),
  INDEX idx_tickets_attended_at (attended_at)
);