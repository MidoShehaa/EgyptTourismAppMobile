// ─────────────────────────────────────────────────────────────────
// UserContext — BACKWARD-COMPATIBLE FACADE
// ─────────────────────────────────────────────────────────────────
// This file now re-exports the three granular contexts as a single
// `useUser` hook, so existing screens continue to work without any
// import changes. New screens should import the specific hooks:
//   import { useSettings } from '../store/SettingsContext';
//   import { useData }     from '../store/DataContext';
//   import { usePlanner }  from '../store/PlannerContext';
// ─────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useMemo } from 'react';
import { SettingsProvider, useSettings } from './SettingsContext';
import { DataProvider, useData } from './DataContext';
import { PlannerProvider, usePlanner } from './PlannerContext';

const UserContext = createContext(null);

// ── Inner bridge: merge all three contexts into a single value ──
const UserBridge = ({ children }) => {
    const settingsCtx = useSettings();
    const dataCtx     = useData();
    const plannerCtx  = usePlanner();

    const merged = useMemo(() => ({
        ...settingsCtx,
        ...dataCtx,
        ...plannerCtx,
    }), [settingsCtx, dataCtx, plannerCtx]);

    return (
        <UserContext.Provider value={merged}>
            {children}
        </UserContext.Provider>
    );
};

// ── Public provider — wraps all three in correct order ──────────
export const UserProvider = ({ children }) => (
    <SettingsProvider>
        <DataProvider>
            <PlannerProvider>
                <UserBridge>
                    {children}
                </UserBridge>
            </PlannerProvider>
        </DataProvider>
    </SettingsProvider>
);

// ── Backward-compatible hook ────────────────────────────────────
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within UserProvider');
    return context;
};

export default UserContext;
