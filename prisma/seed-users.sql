-- Seed default users for Duffers tenant (tenant_id=1)
-- Password for all users: "password" (bcrypt hash)
-- This runs directly via mysql, no node dependencies needed

-- Only insert if no users exist
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

-- Link users to tenant 1 (only if not already linked)
INSERT INTO tenant_users (tenant_id, user_id, role, active, created_at, updated_at)
SELECT 1, id, role, 1, NOW(), NOW() FROM users WHERE email IN ('hello@duffersdonutshop.com', 'manager@duffers.com', 'employee@duffers.com', 'bob@duffers.com')
AND id NOT IN (SELECT user_id FROM tenant_users WHERE tenant_id = 1);