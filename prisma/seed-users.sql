INSERT INTO users (name, email, password_hash, role, active, is_platform_admin, created_at, updated_at)
SELECT 'Shawn', 'hello@duffersdonutshop.com', '$2b$12$MTnv5txXDTGNAfNPB.FwOelawcnmFqm39MFdgrqZ5nBnF5593s8Em', 'OWNER', 1, 1, NOW(), NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'hello@duffersdonutshop.com');

INSERT INTO users (name, email, password_hash, role, active, is_platform_admin, created_at, updated_at)
SELECT 'Store Manager', 'manager@duffers.com', '$2b$12$MTnv5txXDTGNAfNPB.FwOelawcnmFqm39MFdgrqZ5nBnF5593s8Em', 'MANAGER', 1, 0, NOW(), NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'manager@duffers.com');

INSERT INTO users (name, email, password_hash, role, active, is_platform_admin, created_at, updated_at)
SELECT 'Jane Employee', 'employee@duffers.com', '$2b$12$MTnv5txXDTGNAfNPB.FwOelawcnmFqm39MFdgrqZ5nBnF5593s8Em', 'EMPLOYEE', 1, 0, NOW(), NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'employee@duffers.com');

INSERT INTO users (name, email, password_hash, role, active, is_platform_admin, created_at, updated_at)
SELECT 'Bob Baker', 'bob@duffers.com', '$2b$12$MTnv5txXDTGNAfNPB.FwOelawcnmFqm39MFdgrqZ5nBnF5593s8Em', 'EMPLOYEE', 1, 0, NOW(), NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'bob@duffers.com');

INSERT INTO tenant_users (tenant_id, user_id, role, active, created_at, updated_at)
SELECT 1, u.id, u.role, 1, NOW(), NOW() FROM users u
WHERE u.email IN ('hello@duffersdonutshop.com','manager@duffers.com','employee@duffers.com','bob@duffers.com')
AND u.id NOT IN (SELECT tu.user_id FROM tenant_users tu WHERE tu.tenant_id = 1);

UPDATE tenants SET plan = 'TEST' WHERE slug = 'duffersdonutshop';