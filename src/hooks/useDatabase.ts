import { useEffect, useState } from "react";
import * as SQLite from 'expo-sqlite';
import { openDatabase } from "../database";

/**
 * useDatabase
 * A hook to get the initialized database connection.
 * It ensures that migrations are applied.
 */
export function useDatabase() {
    const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

    useEffect(() => {
        let isMounted = true;
        async function setupDatabase() {
            try {
                const dbInstance = await openDatabase();
                if (isMounted) {
                    setDb(dbInstance);
                }
            } catch (error) {
                console.error("Failed to initialize database:", error);
            }
        }
        setupDatabase();

        return () => {
            isMounted = false;
        };
    }, []);

    return db;
}
