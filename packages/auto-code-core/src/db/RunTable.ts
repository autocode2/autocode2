import { Database } from "better-sqlite3";

export interface Row {
  created_at: string;
  run_id: string;
  workdir: string;
  config: string;
  thread_id: string;
}

export class RunTable {
  constructor(protected db: Database) {}

  setup(): void {
    try {
      this.db.exec(`
CREATE TABLE IF NOT EXISTS runs (
  run_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  thread_id TEXT NOT NULL,
  workdir TEXT NOT NULL,
  config BLOB,
  PRIMARY KEY (run_id)
);`);
    } catch (error) {
      console.log("Error creating runs table", error);
      throw error;
    }
  }

  getRow(run_id: string): Row {
    return this.db
      .prepare(
        `SELECT run_id, created_at, thread_id, workdir, config FROM runs WHERE row_id = ?`
      )
      .get(run_id) as Row;
  }

  getLastRun(workdir: string): Row {
    return this.db
      .prepare(
        `SELECT run_id, created_at, thread_id, workdir, config FROM runs WHERE workdir = ? ORDER BY created_at DESC LIMIT 1`
      )
      .get(workdir) as Row;
  }

  insertRow(row: Omit<Row, "created_at">): void {
    const data = [row.run_id, row.workdir, row.config, row.thread_id];

    this.db
      .prepare(
        `INSERT OR REPLACE INTO runs (run_id, workdir, config, thread_id) VALUES (?, ?, ?, ?)`
      )
      .run(...data);
  }
}
