-- DDL generated by Postico 1.4.3
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    title character varying(120) NOT NULL,
    title_seo character varying(100) NOT NULL,
    description character varying(500) NOT NULL,
    ingredients character varying(2000) NOT NULL,
    active boolean NOT NULL DEFAULT false,
    prep_time_seo character varying(20) NOT NULL,
    cook_time_seo character varying(20) NOT NULL,
    total_time_seo character varying(20) NOT NULL,
    prep_time character varying(20) NOT NULL,
    cook_time character varying(20) NOT NULL,
    total_time character varying(20) NOT NULL,
    cuisine character varying(40) NOT NULL,
    yield character varying(20) NOT NULL,
    steps character varying(2000) NOT NULL,
    featured_image_name character varying(40) NOT NULL,
    secondary_image_name character varying(40),
    extra_ingredients_title character varying(40),
    extra_ingredients character varying(500),
    notes character varying(500),
    youtube_video_id character varying(60),
    tweets integer,
    aggregate_rating numeric,
    rating_count integer,
    images_names_csv character varying(250),
    tags_csv character varying(100),
);

ALTER TABLE "public"."recipes"
  ADD COLUMN "images_names_csv" character varying(300),
  ADD COLUMN "tags_csv" character varying(100);


ALTER TABLE "public"."recipes" ADD COLUMN "aggregate_rating" decimal;
UPDATE recipes SET aggregate_rating=4.3 WHERE id>0 ;

ALTER TABLE "public"."recipes" ADD COLUMN "rating_count" integer;
UPDATE recipes SET rating_count=22 WHERE id>0 ;



-- Indices -------------------------------------------------------

CREATE UNIQUE INDEX recipes_pkey ON recipes(id int4_ops);

-- DDL generated by Postico 1.4.3
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name text NOT NULL,
    image_name text NOT NULL,
    quantity_recipes integer NOT NULL,
    name_seo text NOT NULL,
    is_featured boolean NOT NULL
);

-- Indices -------------------------------------------------------

CREATE UNIQUE INDEX tags_pkey ON tags(id int4_ops);


-- DDL generated by Postico 1.4.3
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE recipes_tags (
    id SERIAL PRIMARY KEY,
    recipe_id integer REFERENCES recipes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    tag_id integer REFERENCES tags(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indices -------------------------------------------------------

CREATE UNIQUE INDEX recipes_tags_pkey ON recipes_tags(id int4_ops);


CREATE TABLE search_terms (
    id SERIAL PRIMARY KEY,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    term character varying(120) NOT NULL,
    term_seo character varying(100) NOT NULL,
    active boolean NOT NULL DEFAULT false,
    related_recipes_csv character varying(100),
    CONSTRAINT term_unique UNIQUE (term),
    CONSTRAINT term_seo_unique UNIQUE (term_seo)
);

INSERT INTO public.search_terms
(created_at, updated_at, term, term_seo, active, related_posts_csv)
VALUES
('2020-06-02', '2020-06-02', 'scones de queso', 'scones-de-queso', true, '1,2,3'),
('2020-06-02', '2020-06-02', 'tarta de manzana', 'tarta-de-manzana', true, '1,2,3'),
('2020-06-02', '2020-06-02', 'faina licuada', 'faina-licuada', true, '')
