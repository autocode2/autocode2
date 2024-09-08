import { Database } from "better-sqlite3";

export interface Row {
  checkpoint: string | Uint8Array;
  metadata: string | Uint8Array;
  parent_checkpoint_id?: string;
  thread_id: string;
  checkpoint_id: string;
  checkpoint_ns?: string;
  type?: string;
}

export class CheckpointTable {
  constructor(protected db: Database) {}

  setup(): void {
    try {
      this.db.exec(`
CREATE TABLE IF NOT EXISTS checkpoints (
  thread_id TEXT NOT NULL,
  checkpoint_ns TEXT NOT NULL DEFAULT '',
  checkpoint_id TEXT NOT NULL,
  parent_checkpoint_id TEXT,
  type TEXT,
  checkpoint BLOB,
  metadata BLOB,
  PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id)
);`);
    } catch (error) {
      console.log("Error creating checkpoints table", error);
      throw error;
    }
  }

  drop(): void {
    try {
      console.log("Dropping checkpoints table");
      this.db.exec(`DROP TABLE IF EXISTS checkpoints;`);
    } catch (error) {
      console.log("Error dropping checkpoints table", error);
      throw error;
    }
  }

  getRow({
    thread_id,
    checkpoint_ns,
    checkpoint_id
  }: {
    thread_id?: string;
    checkpoint_ns: string;
    checkpoint_id: string;
  }): Row {
    return this.db
      .prepare(
        `SELECT thread_id, checkpoint_id, parent_checkpoint_id, type, checkpoint, metadata FROM checkpoints WHERE thread_id = ? AND checkpoint_ns = ? AND checkpoint_id = ?`
      )
      .get(thread_id, checkpoint_ns, checkpoint_id) as Row;
  }

  getLatestRow({
    thread_id,
    checkpoint_ns
  }: {
    thread_id?: string;
    checkpoint_ns: string;
  }): Row {
    return this.db
      .prepare(
        `SELECT thread_id, checkpoint_id, parent_checkpoint_id, type, checkpoint, metadata FROM checkpoints WHERE thread_id = ? AND checkpoint_ns = ? ORDER BY checkpoint_id DESC LIMIT 1`
      )
      .get(thread_id, checkpoint_ns) as Row;
  }

  getAllRows(
    thread_id: string,
    { limit, before }: { limit?: number; before?: string }
  ): Row[] {
    let sql = `SELECT thread_id, checkpoint_id, parent_id, checkpoint, metadata FROM checkpoints WHERE thread_id = ? ${
      before ? "AND checkpoint_id < ?" : ""
    } ORDER BY checkpoint_id DESC`;
    if (limit) {
      sql += ` LIMIT ${limit}`;
    }
    const args = [thread_id, before].filter(Boolean);
    return this.db.prepare(sql).all(...args) as Row[];
  }

  insertRow(row: Row): void {
    const data = [
      row.thread_id,
      row.checkpoint_ns,
      row.checkpoint_id,
      row.parent_checkpoint_id,
      row.type,
      row.checkpoint,
      row.metadata
    ];

    this.db
      .prepare(
        `INSERT OR REPLACE INTO checkpoints (thread_id, checkpoint_ns, checkpoint_id, parent_checkpoint_id, type, checkpoint, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(...data);
  }
}
