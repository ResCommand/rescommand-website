INSERT INTO users (name, email, password_hash, role, active, is_platform_admin, created_at, updated_at)
VALUES ('Shawn', 'hello@duffersdonutshop.com', '$2b$12$MTnv5txXDTGNAfNPB.FwOelawcnmFqm39MFdgrqZ5nBnF5593s8Em', 'OWNER', 1, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role), active = VALUES(active), is_platform_admin = VALUES(is_platform_admin), updated_at = NOW();

INSERT INTO users (name, email, password_hash, role, active, is_platform_admin, created_at, updated_at)
VALUES ('Store Manager', 'manager@duffers.com', '$2b$12$MTnv5txXDTGNAfNPB.FwOelawcnmFqm39MFdgrqZ5nBnF5593s8Em', 'MANAGER', 1, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role), active = VALUES(active), updated_at = NOW();

INSERT INTO users (name, email, password_hash, role, active, is_platform_admin, created_at, updated_at)
VALUES ('Jane Employee', 'employee@duffers.com', '$2b$12$MTnv5txXDTGNAfNPB.FwOelawcnmFqm39MFdgrqZ5nBnF5593s8Em', 'EMPLOYEE', 1, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role), active = VALUES(active), updated_at = NOW();

INSERT INTO users (name, email, password_hash, role, active, is_platform_admin, created_at, updated_at)
VALUES ('Bob Baker', 'bob@duffers.com', '$2b$12$MTnv5txXDTGNAfNPB.FwOelawcnmFqm39MFdgrqZ5nBnF5593s8Em', 'EMPLOYEE', 1, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role), active = VALUES(active), updated_at = NOW();

INSERT INTO tenant_users (tenant_id, user_id, role, active, created_at, updated_at)
SELECT t.id, u.id, u.role, 1, NOW(), NOW()
FROM users u
CROSS JOIN tenants t
WHERE u.email IN ('hello@duffersdonutshop.com','manager@duffers.com','employee@duffers.com','bob@duffers.com')
  AND t.slug = 'duffersdonutshop'
  AND NOT EXISTS (
    SELECT 1 FROM tenant_users tu WHERE tu.tenant_id = t.id AND tu.user_id = u.id
  );

UPDATE tenants SET plan = 'TEST' WHERE slug = 'duffersdonutshop';