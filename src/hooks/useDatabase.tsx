import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as SQLite from 'expo-sqlite';
import { openDatabase } from "../database";

interface DbContextType {
    db: SQLite.SQLiteDatabase | null;
    isLoading: boolean;
}

const DbContext = createContext<DbContextType>({
    db: null,
    isLoading: true,
});

export const useDatabase = () => useContext(DbContext);

export const DatabaseProvider = ({ children }: { children: ReactNode }) => {
    const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }
        setupDatabase();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <DbContext.Provider value={{ db, isLoading }}>
            {children}
        </DbContext.Provider>
    );
};