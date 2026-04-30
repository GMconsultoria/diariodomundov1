CREATE TABLE `posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`subtitle` text,
	`content` text NOT NULL,
	`imageUrl` varchar(512),
	`imageKey` varchar(255),
	`category` enum('Política','Economia','Mundo','Tecnologia','Esportes','Entretenimento') NOT NULL,
	`author` varchar(255) NOT NULL,
	`published` boolean NOT NULL DEFAULT false,
	`views` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`publishedAt` timestamp,
	CONSTRAINT `posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `posts_slug_unique` UNIQUE(`slug`)
);
