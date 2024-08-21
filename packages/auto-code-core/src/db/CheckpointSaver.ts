import Database, { Database as DatabaseType } from "better-sqlite3";
import { RunnableConfig } from "@langchain/core/runnables";
import {
  BaseCheckpointSaver,
  Checkpoint,
  CheckpointMetadata,
  CheckpointTuple,
  SerializerProtocol
} from "@langchain/langgraph";
import { load } from "@langchain/core/load";
import { CheckpointTable, Row } from "./CheckpointTable.js";

const Serializer: SerializerProtocol<Checkpoint> = {
  stringify(obj) {
    return JSON.stringify(obj);
  },
  async parse(data) {
    return await load(data.toString());
  }
};

// snake_case is used to match Python implementation

export class CheckpointSaver extends BaseCheckpointSaver {
  table: CheckpointTable;

  protected isSetup: boolean;

  constructor(
    db: DatabaseType,
    serde: SerializerProtocol<Checkpoint> = Serializer
  ) {
    super(serde);
    this.table = new CheckpointTable(db);
    this.isSetup = false;
  }

  static fromConnString(connStringOrLocalPath: string): CheckpointSaver {
    return new CheckpointSaver(new Database(connStringOrLocalPath));
  }

  private setup(): void {
    if (this.isSetup) {
      return;
    }
    this.table.setup();

    this.isSetup = true;
  }

  async getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined> {
    this.setup();
    const thread_id = this.getThreadId(config);
    const checkpoint_id = this.getCheckpointId(config);

    if (checkpoint_id) {
      try {
        const row = this.table.getRow(thread_id, checkpoint_id);

        if (row) {
          return {
            config,
            checkpoint: (await this.serde.parse(row.checkpoint)) as Checkpoint,
            metadata: (await this.serde.parse(
              row.metadata
            )) as CheckpointMetadata,
            parentConfig: row.parent_id
              ? {
                  configurable: {
                    thread_id,
                    checkpoint_id: row.parent_id
                  }
                }
              : undefined
          };
        }
      } catch (error) {
        console.log("Error retrieving checkpoint", error);
        throw error;
      }
    } else {
      const row = this.table.getLatestRow(thread_id);

      if (row) {
        return {
          config: {
            configurable: {
              thread_id: row.thread_id,
              checkpoint_id: row.checkpoint_id
            }
          },
          checkpoint: (await this.serde.parse(row.checkpoint)) as Checkpoint,
          metadata: (await this.serde.parse(
            row.metadata
          )) as CheckpointMetadata,
          parentConfig: row.parent_id
            ? {
                configurable: {
                  thread_id: row.thread_id,
                  checkpoint_id: row.parent_id
                }
              }
            : undefined
        };
      }
    }

    return undefined;
  }

  async *list(
    config: RunnableConfig,
    limit?: number,
    before?: RunnableConfig
  ): AsyncGenerator<CheckpointTuple> {
    this.setup();
    const thread_id = this.getThreadId(config);
    const options = {
      limit,
      before: before?.configurable?.checkpoint_id as string | undefined
    };

    try {
      const rows: Row[] = this.table.getAllRows(thread_id, options);

      if (rows) {
        for (const row of rows) {
          yield {
            config: {
              configurable: {
                thread_id: row.thread_id,
                checkpoint_id: row.checkpoint_id
              }
            },
            checkpoint: (await this.serde.parse(row.checkpoint)) as Checkpoint,
            metadata: (await this.serde.parse(
              row.metadata
            )) as CheckpointMetadata,
            parentConfig: row.parent_id
              ? {
                  configurable: {
                    thread_id: row.thread_id,
                    checkpoint_id: row.parent_id
                  }
                }
              : undefined
          };
        }
      }
    } catch (error) {
      console.log("Error listing checkpoints", error);
      throw error;
    }
  }

  async put(
    config: RunnableConfig,
    checkpoint: Checkpoint,
    metadata: CheckpointMetadata
  ): Promise<RunnableConfig> {
    this.setup();

    try {
      const row = {
        thread_id: this.getThreadId(config),
        checkpoint_id: checkpoint.id,
        parent_id: this.getCheckpointId(config),
        checkpoint: this.serde.stringify(checkpoint),
        metadata: this.serde.stringify(metadata)
      };
      this.table.insertRow(row);
    } catch (error) {
      console.log("Error saving checkpoint", error);
      throw error;
    }

    return {
      configurable: {
        thread_id: this.getThreadId(config),
        checkpoint_id: checkpoint.id
      }
    };
  }

  private getThreadId(config: RunnableConfig): string {
    const thread_id = config.configurable?.thread_id as string | undefined;
    if (!thread_id) {
      throw new Error("Thread ID not set");
    }
    return thread_id;
  }

  private getCheckpointId(config: RunnableConfig): string | undefined {
    return config.configurable?.checkpoint_id as string | undefined;
  }
}
