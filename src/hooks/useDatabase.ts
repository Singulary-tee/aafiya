import { useEffect, useState } from "react";
import * as SQLite from 'expo-sqlite';

/**
 * useDatabase
 * A hook to get the database connection.
 */
export function useDatabase() {
    const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

    useEffect(() => {
        let isMounted = true;
        async function setupDatabase() {
            const db = await SQLite.openDatabaseAsync('medication_tracker.db');
            if (isMounted) {
                setDb(db);
            }
        }
        setupDatabase();

        return () => {
            isMounted = false;
        };
    }, []);

    return db;
}
