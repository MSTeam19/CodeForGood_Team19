-- Force add champion profile fields (with new timestamp)
ALTER TABLE champions ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE champions ADD COLUMN IF NOT EXISTS next_initiative_title TEXT;
ALTER TABLE champions ADD COLUMN IF NOT EXISTS next_initiative_description TEXT;
ALTER TABLE champions ADD COLUMN IF NOT EXISTS next_initiative_date DATE;

-- Also add the champion data
DO $$
DECLARE
    hk_central_id TEXT;
    hk_wan_chai_id TEXT;
    sg_marina_bay_id TEXT;
    my_kl_central_id TEXT;
BEGIN
    -- Get region IDs
    SELECT id::text INTO hk_central_id FROM regions WHERE name LIKE '%Central Hong Kong%' LIMIT 1;
    SELECT id::text INTO hk_wan_chai_id FROM regions WHERE name LIKE '%Wan Chai%' LIMIT 1;
    SELECT id::text INTO sg_marina_bay_id FROM regions WHERE name LIKE '%Marina Bay%' LIMIT 1;
    SELECT id::text INTO my_kl_central_id FROM regions WHERE name LIKE '%KL Central%' LIMIT 1;

    -- Only insert if no champions exist yet
    IF NOT EXISTS (SELECT 1 FROM champions WHERE email = 'sarah.chen@example.com') THEN
        -- Sarah Chen - Lead Champion for Central Hong Kong
        IF hk_central_id IS NOT NULL THEN
            INSERT INTO champions (
                id, name, email, region_id, organization, message, bio, 
                status, is_lead_champion, joined_date,
                next_initiative_title, next_initiative_description, next_initiative_date,
                created_at
            ) VALUES (
                gen_random_uuid(),
                'Sarah Chen',
                'sarah.chen@example.com',
                hk_central_id::uuid,
                'Parent Volunteer Group',
                'Local parent who has organized 15 successful fundraising events in the past year.',
                'Local parent who has organized 15 successful fundraising events in the past year. Passionate about education and community building with over 3 years of volunteer experience.',
                'active',
                true,
                '2024-01-15'::date,
                'Christmas Bake Sale',
                'Organizing a community bake sale to raise funds for new school equipment. Looking for 5 volunteers to help with setup, baking, and sales! We aim to raise $5,000 for new computers.',
                '2024-12-15'::date,
                NOW()
            );

            -- Mike Wong - Champion for Central Hong Kong  
            INSERT INTO champions (
                id, name, email, region_id, organization, message, bio,
                status, is_lead_champion, joined_date,
                next_initiative_title, next_initiative_description, next_initiative_date,
                created_at
            ) VALUES (
                gen_random_uuid(),
                'Mike Wong',
                'mike.wong@example.com', 
                hk_central_id::uuid,
                'Local Business Owner',
                'Teacher and local business owner passionate about youth development.',
                'Teacher and local business owner passionate about youth development. Believes in the power of community support and has been mentoring students for 5+ years.',
                'active',
                false,
                '2024-02-20'::date,
                'Student Mentorship Program',
                'Starting a weekend mentorship program for struggling students. Need volunteer tutors in Math and English. Program runs every Saturday morning.',
                '2024-11-30'::date,
                NOW()
            );
        END IF;

        -- Lisa Tan - Lead Champion for Marina Bay
        IF sg_marina_bay_id IS NOT NULL THEN
            INSERT INTO champions (
                id, name, email, region_id, organization, message, bio,
                status, is_lead_champion, joined_date,
                next_initiative_title, next_initiative_description, next_initiative_date,
                created_at
            ) VALUES (
                gen_random_uuid(),
                'Lisa Tan',
                'lisa.tan@example.com',
                sg_marina_bay_id::uuid,
                'Singapore Community Foundation',
                'Community organizer with experience in educational fundraising and event management.',
                'Community organizer with 7 years of experience in educational fundraising and event management. Has raised over $50,000 for local schools through innovative community programs.',
                'active',
                true,
                '2023-11-10'::date,
                'Tech Skills Workshop',
                'Organizing coding workshops for underprivileged students. Need laptops and volunteer instructors with programming experience. Workshop runs for 6 weeks.',
                '2024-10-01'::date,
                NOW()
            );

            -- James Lim - Champion for Marina Bay
            INSERT INTO champions (
                id, name, email, region_id, organization, message, bio,
                status, is_lead_champion, joined_date,
                next_initiative_title, next_initiative_description, next_initiative_date,
                created_at
            ) VALUES (
                gen_random_uuid(),
                'James Lim',
                'james.lim@example.com',
                sg_marina_bay_id::uuid,
                'Tech Volunteer Network',
                'Software engineer dedicated to bridging the digital divide in education.',
                'Software engineer with 8 years in tech industry, dedicated to bridging the digital divide in education. Volunteers 10+ hours per week teaching coding to kids.',
                'active',
                false,
                '2024-03-05'::date,
                'Digital Library Setup',
                'Setting up digital learning stations in the school library. Need tablets, educational software licenses, and tech-savvy volunteers for maintenance.',
                '2024-12-01'::date,
                NOW()
            );

            -- Rachel Ng - Champion for Marina Bay
            INSERT INTO champions (
                id, name, email, region_id, organization, message, bio,
                status, is_lead_champion, joined_date,
                next_initiative_title, next_initiative_description, next_initiative_date,
                created_at
            ) VALUES (
                gen_random_uuid(),
                'Rachel Ng',
                'rachel.ng@example.com',
                sg_marina_bay_id::uuid,
                'Marine Conservation Society',
                'Environmental educator focused on sustainability and science education.',
                'Environmental educator with a passion for sustainability and hands-on science education. Runs the school''s eco-club and organizes beach cleanup events.',
                'active',
                false,
                '2024-01-20'::date,
                'Eco-Science Fair',
                'Planning an environmental science fair to teach kids about sustainability. Looking for sponsors and science professionals to judge projects.',
                '2024-11-15'::date,
                NOW()
            );
        END IF;

        -- David Wong - Lead Champion for Wan Chai
        IF hk_wan_chai_id IS NOT NULL THEN
            INSERT INTO champions (
                id, name, email, region_id, organization, message, bio,
                status, is_lead_champion, joined_date,
                next_initiative_title, next_initiative_description, next_initiative_date,
                created_at
            ) VALUES (
                gen_random_uuid(),
                'David Wong',
                'david.wong@example.com',
                hk_wan_chai_id::uuid,
                'Wan Chai Athletic Club',
                'Former teacher turned community sports coordinator, passionate about physical education.',
                'Former teacher turned community sports coordinator with 12 years in education. Passionate about physical education and believes sports build character and teamwork skills.',
                'active',
                true,
                '2024-01-08'::date,
                'Sports Day Fundraiser',
                'Planning a fun sports day event with donation booths and competitive games. Need sports equipment donations, volunteer coaches, and refreshment sponsors.',
                '2024-01-20'::date,
                NOW()
            );
        END IF;

        -- Ahmad Rahman - Lead Champion for KL Central
        IF my_kl_central_id IS NOT NULL THEN
            INSERT INTO champions (
                id, name, email, region_id, organization, message, bio,
                status, is_lead_champion, joined_date,
                next_initiative_title, next_initiative_description, next_initiative_date,
                created_at
            ) VALUES (
                gen_random_uuid(),
                'Ahmad Rahman',
                'ahmad.rahman@example.com',
                my_kl_central_id::uuid,
                'Malaysian Education Alliance',
                'Education advocate working to improve access to quality learning resources.',
                'Education advocate with 6 years of experience working to improve access to quality learning resources in underserved communities. Fluent in English, Malay, and Mandarin.',
                'active',
                true,
                '2023-12-01'::date,
                'Multilingual Reading Program',
                'Starting a multilingual reading program to help students improve literacy in multiple languages. Need bilingual volunteers and diverse book donations.',
                '2024-10-15'::date,
                NOW()
            );
        END IF;

        RAISE NOTICE 'Champion seed data inserted successfully!';
    ELSE
        RAISE NOTICE 'Champion data already exists, skipping insert.';
    END IF;

    -- Refresh the materialized view to include the new champion data
    REFRESH MATERIALIZED VIEW leaderboard_region;
END $$;