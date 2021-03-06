import { Connection, Db, Table } from 'rethinkdb';
import { DatabaseService } from './database.service';
import { LogEntry, Rejection } from '../data/internal';

export class LogService {

  public static get connection(): Connection { return DatabaseService.connection; }
  public static get table(): Table { return DatabaseService.log; }

  public static getAll(): Promise<LogEntry[]> {
    return new Promise<LogEntry[]>((resolve, reject) => {
      this.table.run(this.connection)
          .then(cursor => cursor.toArray()
              .then(result => resolve(result.map(o => LogEntry.fromAny(o))))
      ).catch(err => reject(new Rejection(err)));
    });
  }

  public static create(logEntry: LogEntry): Promise<LogEntry> {
    return new Promise<LogEntry>((resolve, reject) => {
      const data = logEntry.toAny();
      delete data.id;

      this.table.insert(data).run(this.connection).then(result => {
          data.id = result.generated_keys[0];
          resolve(LogEntry.fromAny(data));
        }, err => reject(new Rejection(err)));
    });
  }
}
