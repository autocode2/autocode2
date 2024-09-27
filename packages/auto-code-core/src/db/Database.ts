import Sqlite, { Database as DatabaseType } from "better-sqlite3";
import { CheckpointSaver } from "./CheckpointSaver.js";
import { CheckpointTable } from "./CheckpointTable.js";
import { RunTable } from "./RunTable.js";
import { CommandConfig } from "../config/index.js";
import { v4 as uuidv4 } from "uuid";
import { VersionTable } from "./VersionTable.js";
import { CheckpointWritesTable } from "./CheckpointWrites.js";

export type RunInfo = {
  run_id: string;
  thread_id: string;
  isRestart: boolean;
};

export const VERSION = 4;

export class Database {
  static VERSION = VERSION;
  private _checkpoints: CheckpointTable;
  private _versions: VersionTable;
  private _runs: RunTable;
  private _checkpointWrites: CheckpointWritesTable;

  constructor(protected db: DatabaseType) {}

  init(): void {
    this.db.pragma("journal_mode=WAL");
    this.versions().setup();
    const { version } = this.versions().getVersion();
    console.log("DATABASE VERSION", version);
    if (version !== Database.VERSION) {
      this.migrate(version);
    }
  }

  migrate(version: number): void {
    console.log(
      `Migrating database from version ${version} to ${Database.VERSION}`
    );
    if (version < 4) {
      this.checkpoints().drop();
      this.runs().drop();
    }
    this.checkpoints().setup();
    this.checkpointWrites().setup();
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

  checkpointWrites(): CheckpointWritesTable {
    this._checkpointWrites =
      this._checkpointWrites || new CheckpointWritesTable(this.db);
    return this._checkpointWrites;
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
    let thread_id = c.getThread();
    const workdir = c.getWorkDir();

    if (!thread_id && c.getContinue()) {
      const lastRun = this.runs().getLastRun(workdir);
      thread_id = lastRun?.thread_id;
    }
    const isRestart = !!thread_id;
    thread_id ||= uuidv4();

    const config = JSON.stringify(c.toJSON());
    const run_id = uuidv4();
    this.runs().insertRow({ run_id, thread_id, workdir, config });

    c.opts.thread = thread_id;

    return { run_id, thread_id, isRestart };
  }
}
