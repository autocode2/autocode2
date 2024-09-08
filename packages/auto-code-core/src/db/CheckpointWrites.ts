import { Database } from "better-sqlite3";

export interface Row {
  thread_id: string;
  checkpoint_ns: string;
  checkpoint_id: string;
  task_id: string;
  idx: number;
  channel: string;
  type?: string;
  value?: string | Uint8Array;
}

const TABLE_NAME = "checkpoint_writes";
export class CheckpointWritesTable {
  constructor(protected db: Database) {}

  setup(): void {
    try {
      this.db.exec(`
CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
  thread_id TEXT NOT NULL,
  checkpoint_ns TEXT NOT NULL DEFAULT '',
  checkpoint_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  idx INTEGER NOT NULL,
  channel TEXT NOT NULL,
  type TEXT,
  value BLOB,
  PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id, task_id, idx)
);`);
    } catch (error) {
      console.log("Error creating checkpoint_writes table", error);
      throw error;
    }
  }

  drop(): void {
    try {
      this.db.exec(`DROP TABLE IF EXISTS ${TABLE_NAME};`);
    } catch (error) {
      console.log("Error dropping checkpoint_writes table", error);
      throw error;
    }
  }

  getAllRows({
    thread_id,
    checkpoint_ns,
    checkpoint_id
  }: {
    thread_id: string;
    checkpoint_ns: string;
    checkpoint_id: string;
  }): Row[] {
    return this.db
      .prepare(
        `SELECT task_id, channel, type, value FROM ${TABLE_NAME} WHERE thread_id = ? AND checkpoint_ns = ? AND checkpoint_id = ?`
      )
      .all(thread_id, checkpoint_ns, checkpoint_id) as Row[];
  }

  insertRows(rows: Row[]): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO ${TABLE_NAME} 
      (thread_id, checkpoint_ns, checkpoint_id, task_id, idx, channel, type, value) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const transaction = this.db.transaction((rows: Row[]) => {
      for (const row of rows) {
        stmt.run(
          row.thread_id,
          row.checkpoint_ns,
          row.checkpoint_id,
          row.task_id,
          row.idx,
          row.channel,
          row.type,
          row.value
        );
      }
    });
    transaction(rows);
  }
}
