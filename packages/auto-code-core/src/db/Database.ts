import Sqlite, { Database as DatabaseType } from "better-sqlite3";
import { CheckpointSaver } from "./CheckpointSaver.js";
import { CheckpointTable } from "./CheckpointTable.js";
import { RunTable } from "./RunTable.js";
import { CommandConfig } from "../config/index.js";
import { v4 as uuidv4 } from "uuid";
import { VersionTable } from "./VersionTable.js";

export type RunInfo = {
  run_id: string;
  thread_id: string;
};

export class Database {
  static VERSION = 2;
  private _checkpoints: CheckpointTable;
  private _versions: VersionTable;
  private _runs: RunTable;

  constructor(protected db: DatabaseType) {}

  init(): void {
    this.db.pragma("journal_mode=WAL");
    this.versions().setup();
    const { version } = this.versions().getVersion();
    if (version !== Database.VERSION) {
      this.migrate(version);
    }
  }

  migrate(version: number): void {
    if (version < 2) {
      this.checkpoints().drop();
    }
    this.checkpoints().setup();
    this.runs().setup();
    this.versions().updateVersion(Database.VERSION);
  }

  static fromConnString(connStringOrLocalPath: string): Database {
    const db = new Database(new Sqlite(connStringOrLocalPath));
    db.init();
    return db;
  }

  checkpointSaver(run_id: string): CheckpointSaver {
    return new CheckpointSaver(this.db, run_id);
  }

  checkpoints(): CheckpointTable {
    this._checkpoints = this._checkpoints || new CheckpointTable(this.db);
    return this._checkpoints;
  }

  versions(): VersionTable {
    this._versions = this._versions || new VersionTable(this.db);
    return this._versions;
  }

  runs(): RunTable {
    this._runs = this._runs || new RunTable(this.db);
    return this._runs;
  }

  startRun(c: CommandConfig): RunInfo {
    const run_id = uuidv4();
    const thread_id = c.getThread() || uuidv4();
    const workdir = c.getWorkDir();
    const config = JSON.stringify(c.toJSON());

    this.runs().insertRow({ run_id, thread_id, workdir, config });

    return { run_id, thread_id };
  }
}
