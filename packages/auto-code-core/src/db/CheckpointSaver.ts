import { Database as DatabaseType } from "better-sqlite3";
import { RunnableConfig } from "@langchain/core/runnables";
import {
  BaseCheckpointSaver,
  type Checkpoint,
  type CheckpointListOptions,
  type CheckpointTuple,
  type PendingWrite,
  type CheckpointMetadata
} from "@langchain/langgraph-checkpoint";
import { CheckpointTable, Row as CheckpointRow } from "./CheckpointTable.js";
import {
  CheckpointWritesTable,
  Row as CheckpointWritesRow
} from "./CheckpointWrites.js";

export interface CheckpointConfig {
  thread_id?: string;
  checkpoint_ns?: string;
  checkpoint_id?: string;
}

export class CheckpointSaver extends BaseCheckpointSaver {
  checkpoints: CheckpointTable;
  writes: CheckpointWritesTable;

  protected isSetup: boolean;

  constructor(
    db: DatabaseType,
    public run_id: string
  ) {
    super();
    this.checkpoints = new CheckpointTable(db);
    this.writes = new CheckpointWritesTable(db);
  }

  async getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined> {
    let {
      thread_id,
      checkpoint_ns = "",
      checkpoint_id
    }: CheckpointConfig = config.configurable ?? {};
    let row: CheckpointRow;
    if (checkpoint_id) {
      row = this.checkpoints.getRow({
        thread_id,
        checkpoint_ns,
        checkpoint_id
      });
    } else {
      row = this.checkpoints.getLatestRow({ thread_id, checkpoint_ns });
    }
    if (row === undefined) {
      return;
    }
    let finalConfig = config;
    if (!checkpoint_id) {
      finalConfig = {
        configurable: {
          thread_id: row.thread_id,
          checkpoint_ns,
          checkpoint_id: row.checkpoint_id
        }
      };
    }
    thread_id = finalConfig.configurable?.thread_id as string;
    checkpoint_id = finalConfig.configurable?.checkpoint_id as string;
    checkpoint_ns = finalConfig.configurable?.checkpoint_ns as string;
    if (thread_id === undefined || checkpoint_id === undefined) {
      throw new Error("Missing thread_id or checkpoint_id");
    }
    const pendingWritesRows = this.writes.getAllRows({
      thread_id,
      checkpoint_ns,
      checkpoint_id
    });
    const pendingWrites = await Promise.all(
      pendingWritesRows.map(async (row) => {
        return [
          row.task_id,
          row.channel,
          await this.serde.loadsTyped(row.type ?? "json", row.value ?? "")
        ] as [string, string, unknown];
      })
    );
    return {
      config: finalConfig,
      checkpoint: (await this.serde.loadsTyped(
        row.type ?? "json",
        row.checkpoint
      )) as Checkpoint,
      metadata: (await this.serde.loadsTyped(
        row.type ?? "json",
        row.metadata
      )) as CheckpointMetadata,
      parentConfig: row.parent_checkpoint_id
        ? {
            configurable: {
              thread_id: row.thread_id,
              checkpoint_ns,
              checkpoint_id: row.parent_checkpoint_id
            }
          }
        : undefined,
      pendingWrites
    };
  }

  async *list(
    config: RunnableConfig,
    options?: CheckpointListOptions
  ): AsyncGenerator<CheckpointTuple> {
    const thread_id = config.configurable?.thread_id as string;
    const before = options?.before?.configurable?.checkpoint_id as string;
    const rows = this.checkpoints.getAllRows(thread_id, {
      limit: options?.limit,
      before
    });
    if (rows) {
      for (const row of rows) {
        yield {
          config: {
            configurable: {
              thread_id: row.thread_id,
              checkpoint_ns: row.checkpoint_ns,
              checkpoint_id: row.checkpoint_id
            }
          },
          checkpoint: (await this.serde.loadsTyped(
            row.type ?? "json",
            row.checkpoint
          )) as Checkpoint,
          metadata: (await this.serde.loadsTyped(
            row.type ?? "json",
            row.metadata
          )) as CheckpointMetadata,
          parentConfig: row.parent_checkpoint_id
            ? {
                configurable: {
                  thread_id: row.thread_id,
                  checkpoint_ns: row.checkpoint_ns,
                  checkpoint_id: row.parent_checkpoint_id
                }
              }
            : undefined
        };
      }
    }
  }

  async put(
    config: RunnableConfig,
    checkpoint: Checkpoint,
    metadata: CheckpointMetadata
  ): Promise<RunnableConfig> {
    const [type1, serializedCheckpoint] = this.serde.dumpsTyped(checkpoint);
    const [type2, serializedMetadata] = this.serde.dumpsTyped(metadata);
    if (type1 !== type2) {
      throw new Error(
        "Failed to serialized checkpoint and metadata to the same type."
      );
    }

    this.checkpoints.insertRow({
      thread_id: config.configurable?.thread_id as string,
      checkpoint_ns: config.configurable?.checkpoint_ns as string,
      checkpoint_id: checkpoint.id,
      parent_checkpoint_id: config.configurable?.checkpoint_id as string,
      type: type1,
      checkpoint: serializedCheckpoint,
      metadata: serializedMetadata
    });

    return {
      configurable: {
        thread_id: config.configurable?.thread_id as string,
        checkpoint_ns: config.configurable?.checkpoint_ns as string,
        checkpoint_id: checkpoint.id
      }
    };
  }

  async putWrites(
    config: RunnableConfig,
    writes: PendingWrite[],
    taskId: string
  ): Promise<void> {
    const rows: CheckpointWritesRow[] = writes.map((write, idx) => {
      const [type, serializedWrite] = this.serde.dumpsTyped(write[1]);
      return {
        thread_id: config.configurable?.thread_id as string,
        checkpoint_ns: config.configurable?.checkpoint_ns as string,
        checkpoint_id: config.configurable?.checkpoint_id as string,
        task_id: taskId,
        idx,
        channel: write[0],
        type,
        value: serializedWrite
      };
    });
    this.writes.insertRows(rows);
  }
}
