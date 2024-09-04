import { Database } from "better-sqlite3";
import { VERSION } from "./Database.js";

export interface Row {
  version: number;
}

export class VersionTable {
  constructor(protected db: Database) {}

  setup(): void {
    try {
      this.db.exec(`
CREATE TABLE IF NOT EXISTS version (
  id TEXT NOT NULL,
  version INTEGER NOT NULL,
  PRIMARY KEY (id)
);`);
      this.updateVersion(VERSION);
    } catch (error) {
      console.log("Error creating version table", error);
      throw error;
    }
  }

  getVersion(): Row {
    return this.db
      .prepare(`SELECT version FROM version WHERE id = ?`)
      .get("version") as Row;
  }

  updateVersion(version: number): void {
    const data = ["version", version];

    this.db
      .prepare(`INSERT OR REPLACE INTO version (id, version) VALUES (?, ?)`)
      .run(...data);
  }
}
