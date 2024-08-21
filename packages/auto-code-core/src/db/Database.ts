import Sqlite, { Database as DatabaseType } from "better-sqlite3";
import { CheckpointSaver } from "./CheckpointSaver.js";
import { CheckpointTable } from "./CheckpointTable.js";
import { RunTable } from "./RunTable.js";
import { CommandConfig } from "../config/index.js";
import { v4 as uuidv4 } from "uuid";

export type RunInfo = {
  run_id: string;
  thread_id: string;
};

export class Database {
  private _checkpointSaver: CheckpointSaver;
  private _checkpoints: CheckpointTable;
  private _runs: RunTable;

  constructor(protected db: DatabaseType) {}

  init(): void {
    this.db.pragma("journal_mode=WAL");
    this.checkpoints().setup();
    this.runs().setup();
  }

  static fromConnString(connStringOrLocalPath: string): Database {
    const db = new Database(new Sqlite(connStringOrLocalPath));
    db.init();
    return db;
  }

  checkpointSaver(): CheckpointSaver {
    this._checkpointSaver =
      this._checkpointSaver || new CheckpointSaver(this.db);
    return this._checkpointSaver;
  }

  checkpoints(): CheckpointTable {
    this._checkpoints = this._checkpoints || new CheckpointTable(this.db);
    return this._checkpoints;
  }

  runs(): RunTable {
    this._runs = this._runs || new RunTable(this.db);
    return this._runs;
  }

  startRun(c: CommandConfig): RunInfo {
    const run_id = uuidv4();
    const thread_id = uuidv4();
    const workdir = c.getWorkDir();
    const config = JSON.stringify(c.toJSON());

    this.runs().insertRow({ run_id, thread_id, workdir, config });

    return { run_id, thread_id };
  }
}
