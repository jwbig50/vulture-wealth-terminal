CREATE TABLE `allocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ticker` varchar(20) NOT NULL,
	`weight` decimal(10,2) NOT NULL,
	`strategy` enum('equal','value-weighted','conviction','manual') NOT NULL DEFAULT 'manual',
	`accountType` enum('brokerage','roth-ira','traditional-ira') NOT NULL DEFAULT 'brokerage',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `allocations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financialData` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticker` varchar(20) NOT NULL,
	`revenue` decimal(20,2),
	`operatingCashFlow` decimal(20,2),
	`capex` decimal(20,2),
	`totalDebt` decimal(20,2),
	`cash` decimal(20,2),
	`sharesOutstanding` decimal(20,2),
	`hasMoat` int NOT NULL DEFAULT 1,
	`growthRate` decimal(5,2) NOT NULL DEFAULT '20',
	`wacc` decimal(5,2) NOT NULL DEFAULT '10',
	`fetchedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financialData_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `holdings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ticker` varchar(20) NOT NULL,
	`assetType` enum('stock','crypto') NOT NULL DEFAULT 'stock',
	`shares` decimal(20,8) NOT NULL,
	`averageCostBasis` decimal(20,8) NOT NULL,
	`totalCostBasis` decimal(20,2) NOT NULL,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `holdings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `priceHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticker` varchar(20) NOT NULL,
	`assetType` enum('stock','crypto') NOT NULL DEFAULT 'stock',
	`date` timestamp NOT NULL,
	`price` decimal(20,8) NOT NULL,
	`fetchedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `priceHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `valuations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticker` varchar(20) NOT NULL,
	`intrinsicValue` decimal(20,8),
	`marginOfSafety` decimal(10,2),
	`fcf` decimal(20,2),
	`fcfMargin` decimal(10,2),
	`debtToEquity` decimal(10,2),
	`vultureStatus` varchar(50),
	`calculatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `valuations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `watchlist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ticker` varchar(20) NOT NULL,
	`assetType` enum('stock','crypto') NOT NULL DEFAULT 'stock',
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `watchlist_id` PRIMARY KEY(`id`)
);
